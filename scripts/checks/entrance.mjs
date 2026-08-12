/**
 * The entrance, across all four conditions.
 *
 *   node scripts/checks/entrance.mjs
 *
 * The trap: poll from document creation, not after `load`. The whole thing lasts
 * about 2.3 seconds, and on a cold dev server `load` fires after it has finished —
 * a probe that starts there reports the entrance never ran, three times in a row,
 * convincingly.
 *
 * Each condition gets its own browser context so sessionStorage is genuinely fresh.
 */
import { baseUrl, reporter, wait, withBrowser } from "./harness.mjs";

/**
 * Installed before any page script, and polls on rAF so it cannot miss a state.
 *
 * It watches two things, because `data-entrance="done"` is not the end of the
 * entrance — it is the moment the mark *starts* travelling home. Timing to the
 * flag measured the pause and reported 2.3s while the whole thing ran 3.65s, so
 * the 2.5s rule was being met on a technicality. What matters is when the emblem
 * comes to rest, which is when its transform reaches identity and stays there.
 */
const POLL = () => {
  window.__entranceLog = [];
  window.__settledAt = null;
  let last = "(none)";
  let running = false;
  let lastTransform = null;
  let stableSince = null;

  const tick = () => {
    const root = document.documentElement;
    const value = root?.dataset ? root.dataset.entrance || "(unset)" : "(no html)";
    if (value !== last) {
      last = value;
      if (value === "running") running = true;
      window.__entranceLog.push({ at: Math.round(performance.now()), value });
    }

    if (running && window.__settledAt === null) {
      const mark = document.querySelector('[data-vj-emblem="full"]');
      if (mark) {
        const now = getComputedStyle(mark).transform;
        if (now !== lastTransform) {
          lastTransform = now;
          stableSince = performance.now();
        } else if (now === "none" && performance.now() - stableSince > 150) {
          // At rest the rule is `transform: none`; mid-travel it is a matrix.
          window.__settledAt = Math.round(stableSince);
        }
      }
    }

    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

async function run(browser, { label, hash = "", reduced = false, twice = false }) {
  const context = await browser.createBrowserContext();
  const page = await context.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  if (reduced) {
    await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  }

  // Warm the compiler first so the measurement is not dominated by a cold build.
  if (twice) {
    await page.goto(`${baseUrl()}/vajana`, { waitUntil: "networkidle0", timeout: 120_000 });
    await wait(3500);
  }

  await page.evaluateOnNewDocument(POLL);
  await page.goto(`${baseUrl()}/vajana${hash}`, { waitUntil: "networkidle0", timeout: 120_000 });
  await wait(3800);

  const { log, settledAt } = await page.evaluate(() => ({
    log: window.__entranceLog,
    settledAt: window.__settledAt,
  }));
  await context.close();

  const started = log.find((l) => l.value === "running");
  const released = log.find((l) => l.value === "done");
  return {
    label,
    ran: Boolean(started),
    /** The pause before the mark moves. */
    hold: started && released ? released.at - started.at : null,
    /** The whole entrance: from the mark appearing to the mark at rest. */
    duration: started && settledAt !== null ? settledAt - started.at : null,
    final: log.at(-1)?.value,
  };
}

await withBrowser(async (browser) => {
  const report = reporter("Entrance");

  const fresh = await run(browser, { label: "fresh session" });
  report.check("runs once on a fresh session", fresh.ran, fresh.ran ? "" : "never ran");
  /**
   * BUILD-BRIEF §6 said 2.5s for the whole entrance. Overruled by the owner: the
   * mark now holds for two seconds, alive, and drifts home over two more. See
   * DECISIONS.
   *
   * 5.5s against a 4s nominal, because the measured figure is not the nominal one.
   * The hold is a setTimeout competing with hydration and lands at 2.3–2.45s, and
   * the drift's 2s stretches to about 2.3 as frames are dropped — 4.6–4.8s end to
   * end on a loaded machine. The budget is set to catch a runaway, not to fail on
   * machine load, and it is measured over the right span: from the mark appearing
   * to the mark at rest, rather than over the pause in front of it.
   */
  report.check(
    "stays under 5.5s, mark appearing to mark at rest",
    fresh.duration !== null && fresh.duration < 5500,
    fresh.duration === null ? "never settled" : `${fresh.duration}ms`,
  );
  report.note("  of which the hold before it drifts", `${fresh.hold}ms`);

  for (const condition of [
    { label: "second load in the same session", twice: true },
    { label: "hash deep link", hash: "#menuja" },
    { label: "prefers-reduced-motion", reduced: true },
  ]) {
    const result = await run(browser, condition);
    report.check(`skipped — ${condition.label}`, !result.ran, `final state "${result.final}"`);
  }

  report.finish();
});
