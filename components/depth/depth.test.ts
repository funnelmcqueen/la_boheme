import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ACC,
  BODY,
  BONE,
  GROUND,
  LAMP,
  MAX_DEPTH,
  SHELL,
  depthFromScroll,
  depthVars,
  ramp,
  rgb,
} from "./depth";

const ALL = { GROUND, LAMP, ACC, BONE, BODY, SHELL };

describe("ramp", () => {
  it("returns each stop exactly at its own depth", () => {
    for (const [name, stops] of Object.entries(ALL)) {
      for (const [d, colour] of stops) {
        expect(ramp(stops, d), `${name} at ${d}m`).toEqual(colour);
      }
    }
  });

  it("clamps outside the table rather than extrapolating", () => {
    for (const [name, stops] of Object.entries(ALL)) {
      expect(ramp(stops, -20), `${name} above the surface`).toEqual(stops[0][1]);
      expect(ramp(stops, 500), `${name} below the deep`).toEqual(stops[stops.length - 1][1]);
    }
  });

  it("interpolates linearly between two stops", () => {
    // GROUND 0m rgb(24,64,84) -> 8m rgb(19,53,71); halfway is the mean.
    expect(ramp(GROUND, 4)).toEqual([22, 59, 78]);
  });

  it("every table spans the full column and is sorted", () => {
    for (const [name, stops] of Object.entries(ALL)) {
      expect(stops[0][0], `${name} starts at the surface`).toBe(0);
      expect(stops[stops.length - 1][0], `${name} ends at the deep`).toBe(MAX_DEPTH);
      const depths = stops.map(([d]) => d);
      expect(depths, `${name} is sorted`).toEqual([...depths].sort((a, b) => a - b));
    }
  });
});

describe("the descent", () => {
  it("the ground darkens monotonically all the way down", () => {
    let previous = Infinity;
    for (let d = 0; d <= MAX_DEPTH; d += 0.5) {
      const sum = ramp(GROUND, d).reduce((a, b) => a + b, 0);
      expect(sum, `${d}m is not lighter than the metre above it`).toBeLessThanOrEqual(previous);
      previous = sum;
    }
  });

  it("the warm accents invert: red leaves, blue stays", () => {
    // Red is the first wavelength seawater absorbs and blue the last, so the
    // system has to cross over rather than merely dim.
    for (const [name, stops] of [["lamp", LAMP], ["acc", ACC]] as const) {
      const [r0, , b0] = ramp(stops, 0);
      const [r1, , b1] = ramp(stops, MAX_DEPTH);
      expect(r0 - b0, `${name} is warm at the surface`).toBeGreaterThan(60);
      expect(b1 - r1, `${name} is cold in the deep`).toBeGreaterThan(0);
    }
  });

  it("the whole document maps onto the column, and the tail sits at 54m", () => {
    expect(depthFromScroll(0, 11296, 900)).toBe(0);
    expect(depthFromScroll(10396, 11296, 900)).toBe(MAX_DEPTH);
    expect(depthFromScroll(5198, 11296, 900)).toBeCloseTo(27, 5);
    // A document shorter than the viewport has no descent to make.
    expect(depthFromScroll(0, 400, 900)).toBe(0);
  });
});

describe("tokens.css", () => {
  const css = readFileSync(join(import.meta.dirname, "../../styles/tokens.css"), "utf8");

  /** Whitespace inside a value is not a difference — `rgb(24, 64, 84)` is the
      same colour as `rgb(24,64,84)`, and the CSS should stay readable. */
  const normalise = (value: string) => value.replace(/\s+/g, "");

  const declared = (name: string) => {
    const match = css.match(new RegExp(`\\n\\s*${name.replace(/[-]/g, "\\-")}:\\s*([^;]+);`));
    return match ? normalise(match[1]) : undefined;
  };

  /**
   * tokens.css carries the 0m values so first paint is already at the surface
   * with nothing to hydrate. That duplication is the point, and this is what
   * stops it rotting: if a ramp is retuned and the CSS is not, the build fails
   * here rather than flashing the old colour on every cold load.
   */
  it("declares the same surface values the engine would write", () => {
    const surface = depthVars(0);
    for (const [name, value] of Object.entries(surface)) {
      if (name === "--imgfx" || name === "--depth" || name === "--deep") continue;
      expect(declared(name), `${name} in tokens.css`).toBe(normalise(value));
    }
  });

  it("keeps the logo brown out of the ramp", () => {
    // It is an ink for light stock, not a light. Interpolating it would put it on
    // the water, where it measures 1.20:1 and is literally invisible.
    expect(declared("--logo-true")).toBe("#482720");
    expect(declared("--brand")).toBe("var(--logo-true)");
    expect(css).not.toMatch(/--logo:\s*#482720/);
  });

  it("gives a filled button a lit label rather than a hole", () => {
    expect(declared("--btn-label")).toBe("#10303F");
  });

  it("holds the emblem flat white, the one fixed point in the descent", () => {
    expect(declared("--emblem")).toBe("#FFFFFF");
  });
});

describe("depthVars", () => {
  it("writes every token the page reads", () => {
    expect(Object.keys(depthVars(0)).sort()).toEqual(
      ["--acc", "--body", "--bone", "--deep", "--depth", "--ground", "--imgfx", "--lamp", "--logo", "--shell"].sort(),
    );
  });

  it("resolves the vajana out of the dark below thirty metres", () => {
    expect(depthVars(0)["--deep"]).toBe("0.000");
    expect(depthVars(30)["--deep"]).toBe("0.000");
    expect(Number(depthVars(54)["--deep"])).toBeGreaterThan(0);
    expect(Number(depthVars(54)["--deep"])).toBeLessThanOrEqual(0.42);
  });

  it("carries the mark's colour separately from the accent", () => {
    // --logo and --lamp share a ramp today, but a section re-inking itself
    // reassigns --lamp and the fish must not follow it.
    expect(depthVars(12)["--logo"]).toBe(rgb(ramp(LAMP, 12)));
  });
});
