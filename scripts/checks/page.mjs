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
};

await withBrowser(async (browser) => {
  const report = reporter("Page — descent, rhythm, payload");
  /**
   * Everything the page complains about, collected from the page that is actually
   * loaded.
   *
   * The previous version attached these handlers to a fresh page, closed it, and
   * then opened a different one — so `errors` could never be populated and "no page
   * errors" passed on every run it had ever had. Nothing filtered here either: the
   * favicon 404 this used to excuse was a real missing file, and excusing it is how
   * it survived. If a request legitimately fails, fix the request.
   */
  const errors = [];
  const listen = (page) => {
    page.on("pageerror", (e) => errors.push(`js: ${String(e).slice(0, 160)}`));
    page.on("requestfailed", (r) =>
      errors.push(`net: ${r.failure()?.errorText ?? "failed"} ${r.url().slice(0, 120)}`),
    );
    page.on("response", (r) => {
      if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url().slice(0, 120)}`);
    });
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`console: ${m.text().slice(0, 160)}`);
    });
  };

  const view = await open(browser, "/vajana", { width: 1440, height: 900 }, listen);

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

    /**
     * Measured between visible edges — which means the topmost element that
     * actually paints, never the section box.
     *
     * Measuring to the box is how this check passed for a year while the last
     * separator sat 50 above and 147 below: padding lives *inside* the box, so a
     * section holding 96px of its own top padding still reports its edge exactly
     * where the rule wants it. BUILD-BRIEF §10 says this in as many words — "measure
     * the gap to the topmost element of the next section, not to the section box" —
     * and the check did the opposite.
     *
     * Absolutely positioned descendants are skipped: a watermark or a decorative
     * layer can sit above the content without being the thing a reader sees first.
     *
     * And every candidate is clamped to its clipping ancestors, because
     * `getBoundingClientRect` reports an element's own geometry whether or not any
     * of it is visible. The footer's emblem is the case in point: its rings are
     * `<use>` elements that rotate, so their rects run 4px past the dome that
     * clips them, and the gap under the last separator measured 46 against a real
     * 50. BUILD-BRIEF §10 has this as "measure against the clipped edge, not the
     * element" — it cost a day the first time.
     */
    const firstPainted = (root) => {
      let top = Infinity;
      // A visible top border is an edge a reader sees, so it counts — the footer
      // carries a hairline and the type sits one pixel under it. Measuring only
      // descendants would report 51 for a gap that visibly ends at 50.
      const rootStyle = getComputedStyle(root);
      const borderAlpha = Number(rootStyle.borderTopColor.match(/[\d.]+/g)?.[3] ?? 1);
      if (parseFloat(rootStyle.borderTopWidth) > 0 && borderAlpha > 0.02) {
        top = root.getBoundingClientRect().top;
      }
      for (const el of root.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        if (cs.position === "absolute" || cs.position === "fixed") continue;
        if (cs.display === "none" || cs.visibility === "hidden") continue;
        const box = el.getBoundingClientRect();
        if (box.width === 0 || box.height === 0) continue;

        // Where this element actually starts being visible.
        let visibleTop = box.top;
        for (let a = el.parentElement; a && a !== root.parentElement; a = a.parentElement) {
          if (getComputedStyle(a).overflow === "visible") continue;
          visibleTop = Math.max(visibleTop, a.getBoundingClientRect().top);
        }
        if (visibleTop >= box.bottom) continue; // clipped away entirely
        if (visibleTop < top) top = visibleTop;
      }
      return top === Infinity ? root.getBoundingClientRect().top : top;
    };

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
        below: Math.round(firstPainted(next) + scrollY - (m.bottom + scrollY)),
        // Kept so a failure says *why*: if these disagree the next block is holding
        // padding of its own, which is the shape of every version of this bug.
        belowToBox: Math.round(next.getBoundingClientRect().top + scrollY - (m.bottom + scrollY)),
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
        `${sep.above} / ${sep.below}` +
          (sep.below === sep.belowToBox
            ? ""
            : `  (box edge says ${sep.belowToBox} — the next block is holding ${
                sep.below - sep.belowToBox
              }px of its own padding)`),
      );
    }
  }

  // ---- payload and correctness ----
  report.check("one JSON-LD graph", data.jsonLd === 1, `${data.jsonLd}`);
  report.check("every image has alt text", data.imagesWithoutAlt === 0, `${data.imagesWithoutAlt} without`);
  report.check(
    "no page errors",
    errors.length === 0,
    errors.length ? `${errors.length}: ${[...new Set(errors)].slice(0, 3).join(" · ")}` : "",
  );
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
