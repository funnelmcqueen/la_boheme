import { describe, expect, it } from "vitest";
import { HOLLOW_RATIO, OUTERMOST, mandalaMech } from "@/lib/mandala";
import { RING_MOTION, ROSETTE, VIEWBOX, engrave } from "./geometry";

describe("the rosette", () => {
  it("keeps the crown inside the dome's cut", () => {
    // The dome is overflow:hidden at 50% of the width, so anything past 0.454 of
    // the viewBox is shaved off the top of the mark.
    expect(OUTERMOST).toBeLessThanOrEqual(0.454);
  });

  it("builds each variant from its own geometry, not a subset", () => {
    // Every band's radii derive from (RIM - HOLLOW) / rings, so the three-ring
    // mark is not the inner three bands of the seven-ring one. If this ever
    // becomes true, the sprite could hold one definition instead of two.
    expect(ROSETTE.full.rings).toHaveLength(7);
    expect(ROSETTE.mark.rings).toHaveLength(3);
    expect(ROSETTE.mark.rings[0]).not.toBe(ROSETTE.full.rings[0]);
  });

  it("is deterministic — the same call gives the same paths", () => {
    expect(mandalaMech(VIEWBOX, 3)).toEqual(mandalaMech(VIEWBOX, 3));
  });

  it("holds the locked ring periods", () => {
    // These are in "must not change". Pinned so a retune has to be deliberate.
    expect(RING_MOTION.full.map((m) => m.seconds)).toEqual([210, 150, 118, 86, 64, 46, 32]);
    expect(RING_MOTION.mark.map((m) => m.seconds)).toEqual([154, 108, 70]);

    for (const motion of Object.values(RING_MOTION)) {
      motion.forEach((m, i) => expect(m.reverse).toBe(i % 2 === 1));
    }
  });

  it("keeps the periods non-harmonic, with one known exception", () => {
    // Two rings whose periods divide evenly realign on a fixed cycle, and the eye
    // starts to see the loop. 64s and 32s in the seven-ring table do exactly that
    // — they are both forward and realign every 64s. Reported, not fixed: the
    // table is locked. Everything else is clean.
    const known = new Set(["64/32"]);
    const harmonic: string[] = [];

    for (const motion of Object.values(RING_MOTION)) {
      const seconds = motion.map((m) => m.seconds);
      for (let i = 0; i < seconds.length; i++) {
        for (let j = i + 1; j < seconds.length; j++) {
          const [big, small] = [seconds[i], seconds[j]].sort((a, b) => b - a);
          if (big % small === 0) harmonic.push(`${big}/${small}`);
        }
      }
    }

    expect(harmonic.filter((pair) => !known.has(pair))).toEqual([]);
  });

  /**
   * The fish must not reach the innermost ring. The lip adds lines *inside* the
   * hollow, so the clear radius is not the hollow itself, and it has to be
   * recomputed whenever the lip, the hollow or the fish move.
   *
   * `hypot(w/2, h_centre + h/2)` — the far corner of the fish's box, from the
   * rosette's centre, both as fractions of the viewBox.
   */
  const fishCorner = (widthPct: number, bottomPct: number) => {
    const w = widthPct; // fraction of the dome's width == fraction of the viewBox
    const h = w * (280 / 640); // the engraving's own aspect
    const bottom = 0.5 * bottomPct; // the dome is half as tall as it is wide
    return Math.hypot(w / 2, bottom + h);
  };

  /** The lip circle. Nothing may cross this. */
  const LIP = HOLLOW_RATIO * 0.9;
  /** Its scalloped excursion, which dips inward at each lobe. */
  const LIP_SCALLOPED = LIP - HOLLOW_RATIO * 0.055;

  it("clears the vajana of the inner lip", () => {
    expect(fishCorner(0.24, 0.06), "full").toBeLessThan(LIP);
    expect(fishCorner(0.26, 0.07), "mark").toBeLessThan(LIP);
  });

  it("records how much of the scallop's excursion each variant uses", () => {
    // The masthead clears the scallop outright, as BUILD-BRIEF §10 computes:
    // 0.181 against 0.194.
    expect(fishCorner(0.24, 0.06)).toBeCloseTo(0.181, 3);
    expect(LIP_SCALLOPED).toBeCloseTo(0.194, 3);
    expect(fishCorner(0.24, 0.06)).toBeLessThan(LIP_SCALLOPED);

    // The small mark, at 26% and bottom 7%, sits 0.003 of the viewBox inside the
    // scallop's deepest point — about a third of a pixel at 112px, so it is not
    // visible, but it is the mockup's values and not a clean clearance. Pinned so
    // it cannot quietly get worse.
    expect(fishCorner(0.26, 0.07)).toBeCloseTo(0.1976, 3);
    expect(fishCorner(0.26, 0.07) - LIP_SCALLOPED).toBeLessThan(0.004);
  });
});

describe("vector-effect", () => {
  it("is a presentation attribute on every shape in the definition", () => {
    // Necessary but not sufficient — Emblem.test.ts asserts what is painted.
    // This only catches a shape shape-type the transform forgot about.
    const fragment = engrave(ROSETTE.mark.rings.join("") + ROSETTE.mark.frame);
    const shapes = fragment.match(/<(path|circle)\b[^>]*>/g) ?? [];
    expect(shapes.length).toBeGreaterThan(100);
    for (const shape of shapes) {
      expect(shape).toContain('vector-effect="non-scaling-stroke"');
    }
  });

  it("covers every shape type the generator emits", () => {
    const raw = ROSETTE.full.rings.join("") + ROSETTE.full.frame;
    const types = new Set([...raw.matchAll(/<([a-z]+)\b/g)].map((m) => m[1]));
    // If the generator ever emits an ellipse, line or polyline, the engrave()
    // regex silently skips it and that shape's stroke vanishes at small sizes.
    expect([...types].sort()).toEqual(["circle", "g", "path"]);
  });
});
