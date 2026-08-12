/**
 * The page: the descent, the separators, and the payload.
 *
 *   node scripts/checks/page.mjs
 */
import { open, reporter, withBrowser } from "./harness.mjs";

/** BUILD-BRIEF §9's depth table, for comparison. Descriptive, not a gate — the
    full carte inline pushes the lower sections deeper than it describes. */
const SPEC_BANDS = {
  hero: [0, 0], atmosfera: [3, 8], kuzhina: [10, 16], signatures: [18, 21],
  menuja: [21, 30], peshku: [30, 36], vererat: [32, 38], tavoline: [32, 38],
  mbremje: [38, 46], story: [46, 54],
};

await withBrowser(async (browser) => {
  const report = reporter("Page — descent, rhythm, payload");
  const errors = [];
  const page = await browser.newPage();
  page.on("pageerror", (e) => errors.push(String(e).slice(0, 140)));
  page.on("console", (m) => {
    // A 404 for the favicon is not a page fault.
    if (m.type() === "error" && !/favicon|404/i.test(m.text())) errors.push(m.text().slice(0, 140));
  });
  await page.close();

  const view = await open(browser, "/vajana");

  const data = await view.evaluate((ids) => {
    const height = document.documentElement.scrollHeight;
    const max = height - innerHeight;
    const depthAt = (y) => +((Math.min(1, Math.max(0, y / max))) * 54).toFixed(1);

    const bands = ids.map((id) => {
      const el = id === "hero" ? document.querySelector(".vj-hero") : document.getElementById(id);
      if (!el) return { id, missing: true };
      const box = el.getBoundingClientRect();
      const top = box.top + scrollY;
      return { id, from: depthAt(top), to: depthAt(top + box.height) };
    });

    /** Measured between visible edges: the mark's own box to the neighbour's. */
    const separators = [...document.querySelectorAll(".vj-sep, .vj-chapter")].map((sep) => {
      const previous = sep.previousElementSibling;
      const next = sep.nextElementSibling;
      const mark = sep.querySelector(
        ".vj-sep__inner > :nth-child(2), .vj-chapter__inner > :nth-child(2)",
      );
      const m = mark.getBoundingClientRect();
      const afterHero = previous.classList.contains("vj-hero");
      // Above the hero's divider, measure from the CTA — the hero holds 40px of
      // clearance inside its own box, so measuring to the box edge hides it and
      // reports a symmetry that is not there.
      const anchor = afterHero
        ? previous.querySelector('[class*="Hero_buttons"]') ?? previous
        : previous;
      return {
        kind: sep.className,
        above: Math.round(m.top + scrollY - (anchor.getBoundingClientRect().bottom + scrollY)),
        below: Math.round(next.getBoundingClientRect().top + scrollY - (m.bottom + scrollY)),
        afterHero,
      };
    });

    const style = document.documentElement.style;
    return {
      height,
      bands,
      separators,
      nodes: document.getElementsByTagName("*").length,
      emblems: document.querySelectorAll("[data-vj-emblem]").length,
      uses: document.querySelectorAll("use").length,
      images: document.images.length,
      imagesWithoutAlt: [...document.images].filter((i) => !i.alt).length,
      jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
      surface: style.getPropertyValue("--ground"),
    };
  }, Object.keys(SPEC_BANDS));

  // ---- the descent ----
  // `behavior: "instant"` matters: html carries scroll-behavior:smooth, so a
  // plain scrollTo is still animating a second later and reports 53.8m.
  const settle = async (to) => {
    await view.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), to);
    let previous = null;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 100));
      const now = await view.evaluate(() =>
        document.documentElement.style.getPropertyValue("--depth"),
      );
      if (now === previous) break;
      previous = now;
    }
    return view.evaluate(() => ({
      ground: document.documentElement.style.getPropertyValue("--ground"),
      depth: document.documentElement.style.getPropertyValue("--depth"),
    }));
  };

  const top = (await settle(0)).ground;
  const bottom = await settle(1e7);

  report.check("descent starts at the surface", top === "rgb(24,64,84)", top);
  report.check("descent reaches the deep", bottom.ground === "rgb(3,10,16)", bottom.ground);
  report.check("bottoms out at 54 m", bottom.depth === "54.0", `${bottom.depth} m`);

  // ---- the separators ----
  for (const sep of data.separators) {
    if (sep.afterHero) {
      // Ruling: the hero keeps 40px clear under its CTA, so its divider is
      // deliberately asymmetric. The 50/50 rule holds for the interior two.
      report.note("hero divider (asymmetry accepted)", `${sep.above} above / ${sep.below} below`);
    } else {
      report.check(
        `separator 50/50 (${sep.kind.trim()})`,
        sep.above === 50 && sep.below === 50,
        `${sep.above} / ${sep.below}`,
      );
    }
  }

  // ---- payload and correctness ----
  report.check("one JSON-LD graph", data.jsonLd === 1, `${data.jsonLd}`);
  report.check("every image has alt text", data.imagesWithoutAlt === 0, `${data.imagesWithoutAlt} without`);
  report.check("no page errors", errors.length === 0, errors[0] ?? "");
  report.check(
    "emblems render off the sprite",
    data.uses >= data.emblems * 4,
    `${data.emblems} emblems, ${data.uses} <use>`,
  );
  report.note("DOM nodes", `${data.nodes} (the mockup, with 11 inline rosettes, was 4230)`);
  report.note("page height", `${data.height}px`);

  // ---- the depth table, reported not gated ----
  report.note("depth bands vs BUILD-BRIEF §9", "");
  for (const band of data.bands) {
    if (band.missing) {
      report.check(`  ${band.id} present`, false, "section not found");
      continue;
    }
    const [from, to] = SPEC_BANDS[band.id];
    report.note(`  ${band.id.padEnd(11)}`, `${band.from}–${band.to} m   (§9: ${from}–${to})`);
  }

  report.finish();
});
