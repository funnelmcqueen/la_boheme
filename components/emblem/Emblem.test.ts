import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import puppeteer, { type Browser } from "puppeteer-core";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { VAJANA } from "@/lib/engravings";
import { ROSETTE, VIEWBOX, engrave } from "./geometry";

/**
 * The vector-effect regression test.
 *
 * It asserts the *painted* weight of a rendered small mark, not the presence of
 * the attribute, because the failure this guards against is exactly one where the
 * attribute is present and has no effect: CSS cannot select into a <use> element's
 * shadow tree, so a `vector-effect` declared in a stylesheet — which is how the
 * mockup does it — silently stops applying once the geometry moves into <defs>.
 * An attribute-presence test passes happily through all of that.
 *
 * What actually happens without it, measured rather than assumed: the stroke
 * scales with the viewBox, so a 1-unit stroke in a 760 box drawn at 92px lands at
 * 0.12 device pixels. Chrome does not drop it — it antialiases it — so the mark
 * does not vanish so much as wash out to a ghost. The discriminator is therefore
 * not whether pixels are touched (nearly as many are, either way) but whether any
 * pixel carries a fully drawn line.
 *
 *   92px, effect on : 28% of pixels at more than half intensity
 *   92px, effect off:  0% — not one pixel reaches half intensity
 */

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
/** House-signature size — the smallest the mark ships at, so the strictest case. */
const SIZE = 92;
const GROUND: [number, number, number] = [0x0a, 0x1d, 0x2b];

function fixture(nonScalingStroke: boolean) {
  const shape = (fragment: string) => (nonScalingStroke ? engrave(fragment) : fragment);
  const defs = [
    ...ROSETTE.mark.rings.map((ring, i) => `<g id="r${i}">${shape(ring)}</g>`),
    `<g id="frame">${shape(ROSETTE.mark.frame)}</g>`,
    `<g id="fish">${shape(VAJANA.body)}</g>`,
  ].join("");
  const uses = ROSETTE.mark.rings.map((_, i) => `<use href="#r${i}"/>`).join("");

  // Mirrors Emblem.module.css. If that changes shape, this has to follow.
  return `<!doctype html><meta charset="utf-8"><style>
    html,body{margin:0;background:rgb(${GROUND})}
    #stage{width:${SIZE}px;color:#FFFFFF}
    .dome{position:relative;width:100%;padding-top:50%;overflow:hidden}
    .dial{position:absolute;left:0;top:0;width:100%}
    .dial svg{width:100%;height:auto;display:block}
    .core{position:absolute;left:50%;bottom:7%;width:26%;transform:translateX(-50%)}
    .core svg{width:100%;height:auto;display:block}
    .core use{stroke:#DE8573;stroke-width:1.1;fill:none}
  </style>
  <svg style="position:absolute;width:0;height:0"><defs>${defs}</defs></svg>
  <div id="stage"><div class="dome">
    <div class="dial"><svg viewBox="0 0 ${VIEWBOX} ${VIEWBOX}" fill="none" stroke="currentColor"
      stroke-width="1" stroke-linejoin="round" stroke-linecap="round">${uses}<use href="#frame"/></svg></div>
    <div class="core"><svg viewBox="${VAJANA.viewBox}" fill="none"><use href="#fish"/></svg></div>
  </div></div>`;
}

interface Ink {
  /** Mean intensity above the ground, over the whole box. Total ink laid down. */
  density: number;
  /** Fraction of pixels past half intensity — pixels carrying a real line. */
  drawn: number;
}

let browser: Browser;
let dir: string;
let withEffect: Ink;
let withoutEffect: Ink;

async function paint(html: string): Promise<Ink> {
  const file = join(dir, `${html.length}-${html.charCodeAt(400)}.html`);
  writeFileSync(file, html, "utf8");

  const page = await browser.newPage();
  // deviceScaleFactor 1 is the strict case: at DPR 2 the broken stroke gets twice
  // the device pixels and the gap narrows.
  await page.setViewport({ width: SIZE, height: Math.round(SIZE / 2), deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
  const shot = (await page.screenshot({ encoding: "base64" })) as string;

  const ink = await page.evaluate(
    async (data, ground) => {
      const img = new Image();
      img.src = `data:image/png;base64,${data}`;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      const { data: px } = ctx.getImageData(0, 0, canvas.width, canvas.height);

      let sum = 0;
      let drawn = 0;
      for (let i = 0; i < px.length; i += 4) {
        const d =
          (Math.abs(px[i] - ground[0]) +
            Math.abs(px[i + 1] - ground[1]) +
            Math.abs(px[i + 2] - ground[2])) /
          765;
        sum += d;
        if (d > 0.5) drawn++;
      }
      const n = canvas.width * canvas.height;
      return { density: sum / n, drawn: drawn / n };
    },
    shot,
    GROUND,
  );

  await page.close();
  return ink;
}

describe("the small mark, as painted at 92px", () => {
  beforeAll(async () => {
    dir = mkdtempSync(join(tmpdir(), "vajana-emblem-"));
    browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
    withEffect = await paint(fixture(true));
    withoutEffect = await paint(fixture(false));
  });

  afterAll(async () => {
    await browser?.close();
    if (dir) rmSync(dir, { recursive: true, force: true });
  });

  it("draws real lines, not a ghost", () => {
    // Measured 0.284. The floor is set well clear of ordinary geometry tweaks and
    // far above the failure mode, which is exactly zero.
    expect(withEffect.drawn).toBeGreaterThan(0.15);
  });

  it("proves the measurement can tell — without the effect, nothing is fully drawn", () => {
    // Guards the guard. If this ever stops holding, the assertion above has
    // stopped measuring anything and would pass on a washed-out mark.
    expect(withoutEffect.drawn).toBe(0);
  });

  it("lays down several times the ink", () => {
    // Measured 0.279 against 0.065.
    expect(withEffect.density / withoutEffect.density).toBeGreaterThan(3);
  });
});
