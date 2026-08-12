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

/** Installed before any page script, and polls on rAF so it cannot miss a state. */
const POLL = () => {
  window.__entranceLog = [];
  let last = "(none)";
  const tick = () => {
    const root = document.documentElement;
    const value = root?.dataset ? root.dataset.entrance || "(unset)" : "(no html)";
    if (value !== last) {
      last = value;
      window.__entranceLog.push({ at: Math.round(performance.now()), value });
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

  const log = await page.evaluate(() => window.__entranceLog);
  await context.close();

  const started = log.find((l) => l.value === "running");
  const landed = log.find((l) => l.value === "done");
  return {
    label,
    ran: Boolean(started),
    duration: started && landed ? landed.at - started.at : null,
    final: log.at(-1)?.value,
  };
}

await withBrowser(async (browser) => {
  const report = reporter("Entrance");

  const fresh = await run(browser, { label: "fresh session" });
  report.check("runs once on a fresh session", fresh.ran, fresh.duration ? `${fresh.duration}ms` : "never ran");
  report.check(
    "stays under 2.5s",
    fresh.duration !== null && fresh.duration < 2500,
    `${fresh.duration}ms`,
  );

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
