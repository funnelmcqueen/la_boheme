import { describe, expect, it } from "vitest";
import {
  BASIN,
  emblemDistance,
  orient,
  padFor,
  reentryX,
  shortestArc,
  step,
  transformFor,
  waveForce,
  type Basin,
  type Kind,
  type Swimmer,
} from "./swim";

const basin: Basin = {
  width: 749,
  height: 925,
  originX: 270,
  originY: 300,
  emblemX: 270,
  emblemY: 210,
  emblemRX: 255,
  emblemRY: 187,
  markBottom: 397,
  hole: 248,
};

const make = (kind: Kind, over: Partial<Swimmer> = {}): Swimmer => ({
  kind,
  x: 120,
  y: 600,
  vx: 22,
  vy: 0,
  speed: 22,
  width: kind === "mote" ? 3 : 120,
  height: kind === "mote" ? 3 : 46,
  facing: 1,
  angle: null,
  wobble: 0.4,
  wobbleRate: 0.12,
  slip: 1,
  fade: 1,
  ...over,
});

/** Deterministic stand-in for Math.random, so runs are reproducible. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

function run(swimmers: Swimmer[], seconds: number, onStep?: (s: Swimmer) => void) {
  const dt = 1 / 60;
  for (let frame = 0; frame < seconds * 60; frame++) {
    const now = frame * dt;
    for (const s of swimmers) {
      step(s, basin, now, dt, 1440 * 0.35, 0.26);
      orient(s, dt);
      onStep?.(s);
    }
  }
}

describe("shortestArc", () => {
  it("never takes the long way round", () => {
    expect(shortestArc(170, -170)).toBe(20);
    expect(shortestArc(-170, 170)).toBe(-20);
    expect(shortestArc(0, 359)).toBe(-1);
    for (let a = -720; a <= 720; a += 7) {
      for (let b = -720; b <= 720; b += 13) {
        expect(Math.abs(shortestArc(a, b))).toBeLessThanOrEqual(180);
      }
    }
  });
});

describe("the basin", () => {
  it("holds every creature for a minute, and the population never drops", () => {
    // The failure this replaces is slow: with a wrapping plane, once the wave
    // force reached everything they left together and ten visible fell to five
    // inside twenty seconds. A single-frame check would not have caught it.
    const swimmers = [
      make("fish"), make("fish", { x: 500, y: 200, facing: -1, vx: -24 }),
      make("prawn", { x: 300, y: 700, vx: 14, vy: 14 }),
      make("octopus", { x: 200, y: 800, vx: 0, vy: -20 }),
      make("mote", { x: 400, y: 400, vx: 9, vy: -4 }),
    ];

    /**
     * Slack past the soft wall, as a fraction of the column.
     *
     * Derived from BASIN rather than written out. The bounds here used to be
     * literals — 0.781 and 0.831 — which were the old x1 and y1 plus this margin,
     * copied by hand. When the basin widened they went on describing the old one
     * and reported creatures as escaped for using the water they had been given.
     * A test that duplicates the value it is checking only tests the copy.
     */
    const SLACK = 0.11;
    let escaped = 0;
    run(swimmers, 60, (s) => {
      const outsideX =
        s.x < -basin.width * SLACK || s.x > basin.width * (BASIN.x1 + SLACK);
      // Octopuses turn back at the underside of the lockup rather than at the top
      // of the frame, so they never leave the column at all.
      const outsideY =
        s.kind === "octopus"
          ? s.y - s.height / 2 < basin.markBottom - 1 ||
            s.y > basin.height * (BASIN.y1 + SLACK)
          : s.y < -basin.height * SLACK || s.y > basin.height * (BASIN.y1 + SLACK);
      if (outsideX || outsideY) escaped++;
    });

    expect(escaped).toBe(0);
    expect(swimmers).toHaveLength(5);
  });

  it("keeps everything clear of the emblem across a minute of motion", () => {
    // Started clear of the exclusion ellipse, the way Seascape spawns them. A
    // creature placed *inside* it fires the safety net on frame one, which looks
    // identical to a physics failure and is not one.
    const swimmers = [
      make("fish", { x: 120, y: 760 }),
      make("prawn", { x: 90, y: 640, vx: -18, vy: -18 }),
      make("octopus", { x: 640, y: 880, vx: 0, vy: -24 }),
    ];
    for (const s of swimmers) {
      expect(emblemDistance(basin, s.x, s.y, padFor(s)).magnitude).toBeGreaterThan(1.3);
    }

    let closest = Infinity;
    let clamped = 0;
    const dt = 1 / 60;
    for (let frame = 0; frame < 60 * 60; frame++) {
      for (const s of swimmers) {
        if (step(s, basin, frame * dt, dt, 1440 * 0.35, 0.26).clamped) clamped++;
        orient(s, dt);
        closest = Math.min(closest, emblemDistance(basin, s.x, s.y, padFor(s)).magnitude);
      }
    }

    /**
     * 1 is the exclusion surface: the mark's own ellipse already expanded by the
     * creature's half width. So the thing that must hold absolutely is that the
     * *mark* is never touched, which happens at 255/(255+72) ≈ 0.78 in these
     * units — the padding is the margin, and it exists to absorb exactly this.
     *
     * This is the adversarial case on purpose: an octopus only rises, and in this
     * basin the emblem's shadow spans the whole width, so it repeatedly climbs
     * straight at the mark from below and the field has to stop it head-on with
     * no sideways room. It gets 0.6% into the padding at worst.
     *
     * On the real page, with eleven creatures and a live clock, the measured
     * minimum over sixty seconds is 1.44 and the hard clamp fires zero times.
     */
    const markSurface = basin.emblemRX / (basin.emblemRX + padFor(make("octopus")));
    expect(markSurface).toBeCloseTo(0.78, 2);
    expect(closest).toBeGreaterThan(markSurface * 1.2);
    expect(closest).toBeGreaterThan(0.99);
  });

  it("now has a path around the mark, which it did not use to", () => {
    /**
     * Not an assertion about the physics — an assertion about the geometry, so the
     * reason the octopus behaves as it does is recorded rather than rediscovered.
     *
     * It used to read the other way. The exclusion ellipse, padded by an octopus's
     * half width, spanned the entire usable width of the water column: a creature
     * that may only rise had to cross it, which is why it re-enters from below
     * instead of going round. Widening the basin from 67% of a half-width column
     * to 93% of the whole hero opened a lane on the right — measured, the ellipse
     * ends around 80% of the way across and the wall is at 93%.
     *
     * The re-entry rule stays, and it is still load-bearing rather than vestigial:
     * the lane measures about 100px against an octopus 120px wide, so a fish or a
     * prawn can now take it and an octopus still cannot fit. That is the assertion
     * below, and it is the number to re-read if the basin or the mark moves again.
     */
    const octopus = make("octopus");
    const pad = padFor(octopus);
    const left = basin.emblemX - (basin.emblemRX + pad);
    const right = basin.emblemX + (basin.emblemRX + pad);

    expect(left).toBeLessThan(basin.width * BASIN.x0);
    expect(right).toBeLessThan(basin.width * BASIN.x1);
    // Open, but not to an octopus — which is why it still re-enters from below.
    const lane = basin.width * BASIN.x1 - right;
    expect(lane).toBeGreaterThan(0);
    expect(lane).toBeLessThan(octopus.width);
  });
});

describe("orientation", () => {
  it("a fish mirrors and never rotates through 180", () => {
    const fish = make("fish", { x: 400, y: 800, vx: -26, facing: -1 });
    let maxAngle = 0;
    let mirroredWhileFacingLeft = 0;
    const dt = 1 / 60;
    for (let frame = 0; frame < 60 * 40; frame++) {
      step(fish, basin, frame * dt, dt, 1440 * 0.35, 0.26);
      const { angle, mirror } = orient(fish, dt);
      maxAngle = Math.max(maxAngle, Math.abs(angle));
      if (fish.facing < 0 && mirror) mirroredWhileFacingLeft++;
    }
    // A tilt, never a turn. The clamp is ±9°.
    expect(maxAngle).toBeLessThanOrEqual(9.001);
    expect(mirroredWhileFacingLeft).toBeGreaterThan(0);
  });

  it("an octopus travels mantle-first and only ever rises", () => {
    const octopus = make("octopus", { x: 180, y: 850, vx: 4, vy: -22, speed: 22 });
    let sank = 0;
    const dt = 1 / 60;
    for (let frame = 0; frame < 60 * 40; frame++) {
      step(octopus, basin, frame * dt, dt, 1440 * 0.35, 0.26);
      const { angle } = orient(octopus, dt);
      if (octopus.vy > 0) sank++;
      void angle;
    }
    expect(sank).toBe(0);

    // And in open water it settles to a lean, not a spin.
    const settled = make("octopus", { x: 640, y: 880, vx: 2, vy: -22, speed: 22 });
    for (let frame = 0; frame < 240; frame++) orient(settled, 1 / 60);
    expect(Math.abs(settled.angle!)).toBeLessThan(40);
  });

  it("only a prawn chases a full heading", () => {
    const prawn = make("prawn", { x: 300, y: 700, vx: 20, vy: 6 });
    const seen = new Set<number>();
    const dt = 1 / 60;
    for (let frame = 0; frame < 60 * 40; frame++) {
      step(prawn, basin, frame * dt, dt, 1440 * 0.35, 0.26);
      seen.add(Math.round(orient(prawn, dt).angle / 30));
    }
    // A creature that only tilts cannot visit this many distinct headings.
    expect(seen.size).toBeGreaterThan(4);
  });

  it("chases the heading rather than snapping to it", () => {
    /**
     * This is what "the drawn angle chases through the shortest arc" has to mean
     * in a test. Not that the angle stays near the heading — near the mark a
     * creature's velocity can swing almost fully round in a frame, and the drawing
     * deliberately lags it; a lag of 120° there is the mechanism working, and
     * asserting it away would forbid the very behaviour that was wanted. What must
     * hold is that the drawn angle never moves faster than its own chase rate,
     * because binding rotation straight to velocity is what made everything look
     * like it was spinning.
     */
    const rates: Record<string, number> = { fish: 2.4, octopus: 1.2, prawn: 1.1 };
    const dt = 1 / 60;

    for (const kind of ["fish", "octopus", "prawn"] as const) {
      const s = make(kind, { x: 200, y: 800, vx: 18, vy: -14 });
      let worst = 0;
      let previous: number | null = null;

      for (let frame = 0; frame < 60 * 40; frame++) {
        step(s, basin, frame * dt, dt, 1440 * 0.35, 0.26);
        // A re-entering octopus clears its angle: it is a new creature arriving,
        // not the old one turning, and it must not chase the departed one's
        // heading. That frame is a reset, not a snap.
        const reset = s.angle === null;
        const { angle } = orient(s, dt);
        if (previous !== null && !reset) {
          worst = Math.max(worst, Math.abs(shortestArc(previous, angle)));
        }
        previous = angle;
      }

      // A single chase step can cover at most `rate * dt` of a 180° gap.
      expect(worst, `${kind} per-frame turn`).toBeLessThanOrEqual(180 * rates[kind] * dt + 0.001);
    }
  });

  it("holds the last angle when a creature is barely moving", () => {
    // atan2 of two values near zero swings wildly, and the drawn angle would
    // chase the noise.
    const prawn = make("prawn", { vx: 0.01, vy: -0.01, angle: 42, speed: 22 });
    expect(orient(prawn, 1 / 60).angle).toBe(42);
  });
});

describe("rendering", () => {
  it("offsets by half the height as well as half the width", () => {
    // x and y are the creature's centre. Subtracting only the width put every
    // creature half its own height below where the collision maths believed it
    // was, and the emblem exclusion was wrong on Y as a result.
    const fish = make("fish", { x: 300, y: 400, width: 120, height: 46 });
    expect(transformFor(fish, 0, false)).toContain("translate3d(240.0px,377.0px,0)");
  });

  it("mirrors rather than rotating, and only for a fish", () => {
    const fish = make("fish", { facing: -1 });
    expect(transformFor(fish, -4, true)).toContain("scaleX(-1)");
    expect(transformFor(make("prawn"), 120, false)).not.toContain("scaleX");
  });

  it("gives a mote no rotation at all", () => {
    expect(transformFor(make("mote"), 33, false)).not.toContain("rotate");
  });
});

describe("the wave", () => {
  it("reaches everywhere in the column over a full cycle", () => {
    // If a front never reaches part of the basin, creatures there drift without
    // ever being pushed, which is what makes a seascape read as a screensaver.
    const maxRadius = 1440 * 0.35;
    let felt = 0;
    for (let distance = 0; distance < maxRadius; distance += maxRadius / 40) {
      let peak = 0;
      for (let second = 0; second < 26; second += 0.25) {
        peak = Math.max(peak, waveForce(second, distance, maxRadius, 0.26));
      }
      if (peak > 0.05) felt++;
    }
    expect(felt).toBeGreaterThan(30);
  });
});

describe("octopus re-entry", () => {
  it("avoids the mark's shadow when the column is wide enough to allow it", () => {
    // Mobile, where the water spans the full width and there is clear room either
    // side of the mark.
    const wide: Basin = { ...basin, width: 1400, emblemX: 700, emblemRX: 180 };
    const random = seeded(7);
    const octopus = make("octopus");
    const shadow = wide.emblemRX + padFor(octopus);
    for (let i = 0; i < 200; i++) {
      expect(Math.abs(reentryX(octopus, wide, random) - wide.emblemX)).toBeGreaterThanOrEqual(
        shadow - 0.001,
      );
    }
  });

  it("falls back to the whole span when there is no clear column", () => {
    // On desktop the emblem is 486px wide inside a 749px water column, so padded
    // by a creature's half width its shadow covers the entire spawn range and
    // there is nowhere clear to come back. The fallback keeps it in the basin and
    // lets the repulsion field do the work.
    const random = seeded(3);
    const octopus = make("octopus");
    const shadow = basin.emblemRX + padFor(octopus);
    expect(shadow * 2).toBeGreaterThan(basin.width * 0.55);

    for (let i = 0; i < 200; i++) {
      const x = reentryX(octopus, basin, random);
      expect(x).toBeGreaterThanOrEqual(basin.width * 0.05 - 0.001);
      expect(x).toBeLessThanOrEqual(basin.width * 0.6 + 0.001);
    }
  });

  it("comes back inside the basin", () => {
    const random = seeded(11);
    const octopus = make("octopus");
    for (let i = 0; i < 200; i++) {
      const x = reentryX(octopus, basin, random);
      expect(x).toBeGreaterThanOrEqual(basin.width * 0.05 - 0.001);
      expect(x).toBeLessThanOrEqual(basin.width * BASIN.x1);
    }
  });
});
