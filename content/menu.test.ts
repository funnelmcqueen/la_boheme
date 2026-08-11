import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { ALLERGY_NOTE, MENU, SIGNATURES, formatPrice } from "./menu";

const ROOT = join(import.meta.dirname, "..");
const SEARCHED = ["app", "components", "content", "lib", "styles"];

function sourceFiles() {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) {
        walk(path);
      } else if ([".ts", ".tsx", ".css"].includes(extname(entry))) {
        found.push(path);
      }
    }
  };
  for (const dir of SEARCHED) walk(join(ROOT, dir));
  return found;
}

describe("no price string exists outside menu.ts", () => {
  /**
   * Menu prices change every season, and the owner will not be editing React.
   * Everything renders from menu.ts through formatPrice, so a seasonal update is
   * one file — and this is what stops a number quietly reappearing in a component
   * where it will then be wrong, and wrong in a way nobody notices until a guest
   * points at a screen.
   *
   * Looks for the shapes a price actually takes: a lekë figure, a per-kilo rate, a
   * currency word. Not bare numbers — those are viewport widths and durations.
   */
  const patterns: [string, RegExp][] = [
    ["a lekë amount", /\b\d[\d\s  .,]*\s*(lekë|leke|ALL)\b/i],
    ["a per-kilo rate", /\b\d[\d\s  .,]*\s*L\s*\/\s*(kg|copë|each|gr)\b/i],
    // The thin space specifically, which is what formatPrice emits and what a
    // price copied off the rendered page would carry. A plain space between
    // digits is SVG path data, not money.
    ["a grouped price copied from the rendered menu", /\d[   ]\d{3}/],
  ];

  const allowed = new Set([
    join(ROOT, "content", "menu.ts"),
    join(ROOT, "content", "menu.test.ts"),
  ]);

  it.each(patterns)("finds no %s", (_label, pattern) => {
    const offenders: string[] = [];
    for (const file of sourceFiles()) {
      if (allowed.has(file)) continue;
      const text = readFileSync(file, "utf8");
      for (const line of text.split("\n")) {
        // Prose about money in a comment is not a price the page renders.
        if (/^\s*(\*|\/\/)/.test(line)) continue;
        if (pattern.test(line)) offenders.push(`${file.slice(ROOT.length + 1)}: ${line.trim()}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("searched the directories that could hold one", () => {
    // Guards the guard: if the walk silently found nothing, the checks above pass
    // for the wrong reason.
    const files = sourceFiles();
    expect(files.length).toBeGreaterThan(30);
    expect(files.some((f) => f.endsWith("Carte.tsx"))).toBe(true);
    expect(files.some((f) => f.endsWith("Sections.tsx"))).toBe(true);
  });
});

describe("the menu", () => {
  it("renders every price through one formatter", () => {
    for (const group of MENU) {
      for (const item of group.items) {
        const rendered = formatPrice(item, "sq");
        expect(rendered, `${item.id}`).toMatch(/\d/);
        expect(rendered, `${item.id} carries its unit`).not.toBe(String(item.price));
      }
    }
  });

  it("uses the printed card's thin space as the group separator", () => {
    const kilo = MENU.flatMap((g) => g.items).find((i) => i.price >= 1000)!;
    expect(formatPrice(kilo, "sq")).toContain(" ");
  });

  it("carries the three dishes that hold the master brand name", () => {
    expect(SIGNATURES).toHaveLength(3);
    for (const item of SIGNATURES) {
      expect(item.name.sq + item.name.en).toMatch(/La Bohème/);
    }
  });

  it("lists all twelve species in the catch", () => {
    // The mockup showed eight. The four missing ones were an oversight, and the
    // section renders the group, not a hand-picked subset.
    const group = MENU.find((g) => g.id === "catch")!;
    expect(group.items).toHaveLength(12);
    expect(group.items.map((i) => i.id)).toContain("peshkatrice");
  });

  it("has a wine list whose length is the argument", () => {
    const wines = MENU.filter((g) => g.id.startsWith("wine")).flatMap((g) => g.items);
    expect(wines.length).toBeGreaterThanOrEqual(38);
    for (const group of MENU.filter((g) => g.id.startsWith("wine"))) {
      expect(group.layout).toBe("wine");
    }
  });

  it("has the allergy note in both languages", () => {
    expect(ALLERGY_NOTE.sq).toMatch(/alergji/);
    expect(ALLERGY_NOTE.en).toMatch(/allerg/);
  });
});
