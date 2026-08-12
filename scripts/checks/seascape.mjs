/**
 * The seascape, sampled over live motion.
 *
 *   node scripts/checks/seascape.mjs [--seconds=60]
 *
 * Both failures this catches are slow, and a single frame shows neither: the water
 * empties over about a minute, and a creature crosses the mark on a pass a
 * screenshot misses. Sixty seconds is the default for that reason.
 *
 * Two traps, both of which produced wrong numbers during the build:
 *
 *   - `sea.clamps()` is cumulative since mount. Read it as a delta or you will
 *     report the settling period as steady state. That mistake once turned 0 into
 *     "804 firings".
 *   - Measure in the real hero. The same checks came back clean against a
 *     placeholder layout and were wrong the moment the emblem and the water sat in
 *     their true relationship.
 */
import { open, reporter, wait, withBrowser } from "./harness.mjs";

const seconds = Number(process.argv.find((a) => a.startsWith("--seconds="))?.slice(10) ?? 60);

await withBrowser(async (browser) => {
  const report = reporter(`Seascape — ${seconds}s of motion`);
  const page = await open(browser, "/vajana");

  const mounted = await page.evaluate(() => Boolean(window.__vjSea));
  if (!mounted) {
    report.check("seascape mounted", false, "window.__vjSea missing — reduced motion?");
    report.finish();
    return;
  }

  // Sanity first: a keep-out in the wrong place produces every symptom of broken
  // physics and none of the causes. Rule it out before reading anything else.
  const placement = await page.evaluate(() => {
    const basin = window.__vjSea.basin();
    const sea = document.querySelector('[class*="Seascape_sea"]').getBoundingClientRect();
    const dome = document.querySelector('[data-vj-dome="full"]').getBoundingClientRect();
    return {
      offBy: {
        x: Math.round(basin.emblemX - (dome.x + dome.width / 2 - sea.x)),
        y: Math.round(basin.emblemY - (dome.y + dome.height / 2 - sea.y)),
      },
      rx: Math.round(basin.emblemRX),
      ry: Math.round(basin.emblemRY),
    };
  });
  report.check(
    "keep-out sits where the dome is",
    placement.offBy.x === 0 && placement.offBy.y === 0,
    `off by ${placement.offBy.x},${placement.offBy.y}px · ellipse ${placement.rx}×${placement.ry}`,
  );

  const result = await page.evaluate(async (runFor) => {
    const sea = window.__vjSea;
    const startClamps = sea.clamps();
    const wordmark = document.querySelector("[data-vj-wordmark]").getBoundingClientRect();
    const dome = document.querySelector('[data-vj-dome="full"]').getBoundingClientRect();

    const overlap = (a, b) =>
      Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
      Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));

    const closest = {};
    const series = [];
    let wordmarkHits = 0;
    let domeHits = 0;
    // Who crosses the type, and for how long without a break. A fish passing
    // behind the lockup is accepted; one parked on it is not.
    const crossings = {};
    const streak = new Map();
    let longestStreak = 0;

    const started = performance.now();
    while (performance.now() - started < runFor * 1000) {
      const basin = sea.basin();
      let visible = 0;

      for (const swimmer of sea.swimmers()) {
        const pad = swimmer.kind === "mote" ? 3 : swimmer.width * 0.55 + 6;
        const distance = Math.hypot(
          (swimmer.x - basin.emblemX) / (basin.emblemRX + pad),
          (swimmer.y - basin.emblemY) / (basin.emblemRY + pad),
        );
        if (!(swimmer.kind in closest) || distance < closest[swimmer.kind]) {
          closest[swimmer.kind] = +distance.toFixed(3);
        }
        if (swimmer.kind === "mote") continue;

        const left = swimmer.x - swimmer.width / 2;
        const top = swimmer.y - swimmer.height / 2;
        if (left < basin.width && left + swimmer.width > 0 && top < basin.height && top + swimmer.height > 0) {
          visible++;
        }
      }

      for (const node of sea.nodes()) {
        if (node.dataset.swimmer === "mote") continue;
        const box = node.getBoundingClientRect();
        const kind = node.dataset.swimmer;
        if (overlap(box, wordmark) > 0) {
          wordmarkHits++;
          crossings[kind] = (crossings[kind] ?? 0) + 1;
          const run = (streak.get(node) ?? 0) + 1;
          streak.set(node, run);
          if (run > longestStreak) longestStreak = run;
        } else {
          streak.set(node, 0);
        }
        if (overlap(box, dome) > 0) domeHits++;
      }

      series.push({ at: Math.round((performance.now() - started) / 1000), visible });
      await new Promise((r) => setTimeout(r, 250));
    }

    // Ten-second means, so a downward trend is visible without dumping 240 rows.
    const windows = [];
    for (let i = 0; i * 10 < runFor; i++) {
      const slice = series.filter((s) => s.at >= i * 10 && s.at < (i + 1) * 10);
      if (slice.length) {
        windows.push({
          window: `${i * 10}-${(i + 1) * 10}s`,
          mean: +(slice.reduce((sum, s) => sum + s.visible, 0) / slice.length).toFixed(2),
          min: Math.min(...slice.map((s) => s.visible)),
        });
      }
    }

    return {
      clamps: sea.clamps() - startClamps,
      creatures: sea.swimmers().filter((s) => s.kind !== "mote").length,
      closest,
      windows,
      wordmarkHits,
      crossings,
      longestCrossing: longestStreak,
      domeHits,
      samples: series.length,
    };
  }, seconds);

  // The water must not empty. Wrapping — which the bounded basin replaced — took
  // ten visible down to five inside twenty seconds.
  const means = result.windows.map((w) => w.mean);
  const drained = means.length > 1 && means[means.length - 1] < means[0] - 1;
  report.check(
    "population holds",
    !drained && Math.min(...result.windows.map((w) => w.min)) >= result.creatures - 2,
    result.windows.map((w) => `${w.window} ${w.mean}`).join("  "),
  );

  // 1.0 is the exclusion surface: the mark's ellipse plus the creature's half width.
  for (const [kind, distance] of Object.entries(result.closest)) {
    report.check(`${kind} clears the mark`, distance > 1, `closest ${distance}`);
  }

  report.check("hard clamp never fires", result.clamps === 0, `${result.clamps} firings`);
  /**
   * The keep-out is the dome, not the lockup: type on a solid baseline tolerates a
   * creature passing behind it far better than the rosette does, and covering the
   * wordmark left the column with no middle at all. So a brief crossing is the
   * accepted behaviour, not a fault — what would not be is one settling there.
   *
   * Measured at 250ms, so eight consecutive samples is two seconds on the type.
   */
  report.check(
    "nothing settles on the wordmark",
    result.longestCrossing <= 8,
    `longest crossing ${(result.longestCrossing * 0.25).toFixed(1)}s`,
  );
  report.note(
    "wordmark crossings",
    `${result.wordmarkHits} of ${result.samples * 11} creature-samples` +
      (Object.keys(result.crossings).length
        ? ` — ${Object.entries(result.crossings).map(([k, n]) => `${k} ${n}`).join(", ")}`
        : ""),
  );
  report.check("nothing crosses the dome", result.domeHits === 0, `${result.domeHits} samples`);
  report.note("samples", `${result.samples} at 250ms`);

  report.finish();
});
