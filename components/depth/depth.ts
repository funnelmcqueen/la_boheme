/**
 * The descent.
 *
 * The page IS the water column. One scroll fraction drives every colour on it.
 * Ported verbatim from the approved mockup's depth engine — these stops are in
 * CLAUDE-CODE-PROMPT.md under "must not change".
 *
 * Attenuation runs warm -> cold rather than merely bright -> dark, because red is
 * the first wavelength seawater absorbs and blue the last. That is why there is
 * one type zone and no light/dark handover: the ground is dark the whole way, the
 * type is light the whole way, and only its temperature moves.
 */

export type RGB = readonly [number, number, number];
/** [depth in metres, colour at that depth]. Must be sorted by depth. */
export type Stop = readonly [number, RGB];

/** The page bottoms out at 54 metres. */
export const MAX_DEPTH = 54;

/** Clear water with sunlight still in it, going to the deep. */
export const GROUND: readonly Stop[] = [
  [0, [24, 64, 84]],
  [8, [19, 53, 71]],
  [18, [14, 41, 57]],
  [30, [10, 29, 43]],
  [42, [6, 18, 28]],
  [54, [3, 10, 16]],
];

/**
 * The warm accent ramp starts at the lifted logo colour (#DE8573 — the logo brown
 * #482720 at hue 10.5 with the value raised until it separates from the water),
 * not at amber. Every rule, button and hairline in the shallow water is the logo
 * colour before the sea takes the red out of it.
 */
export const LAMP: readonly Stop[] = [
  [0, [222, 133, 115]],
  [10, [218, 146, 130]],
  [22, [196, 182, 178]],
  [34, [162, 192, 210]],
  [46, [200, 224, 238]],
  [54, [228, 241, 248]],
];

/** The lead and the prices. */
export const ACC: readonly Stop[] = [
  [0, [232, 120, 96]],
  [12, [226, 138, 116]],
  [26, [190, 186, 186]],
  [40, [200, 224, 236]],
  [54, [226, 240, 248]],
];

/** Headings: warm cream to cold white. */
export const BONE: readonly Stop[] = [
  [0, [246, 235, 222]],
  [24, [240, 238, 234]],
  [54, [228, 241, 249]],
];

/** Body copy. */
export const BODY: readonly Stop[] = [
  [0, [232, 218, 203]],
  [24, [224, 228, 230]],
  [54, [206, 226, 238]],
];

/** Captions, muted. */
export const SHELL: readonly Stop[] = [
  [0, [188, 132, 88]],
  [24, [164, 158, 152]],
  [54, [142, 172, 190]],
];

/**
 * The mark's own colour, carried by the vajana inside every emblem.
 *
 * It shares LAMP's stops at every depth, but it is deliberately a separate token
 * rather than `var(--lamp)`. Sections re-ink themselves by reassigning --lamp
 * (`#catch{--lamp:var(--ink-prus)}`); the fish is the logo and must not follow
 * them. Same ramp, different reason to exist.
 */
export const LOGO: readonly Stop[] = LAMP;

/**
 * The logo brown exactly as printed. Luminance 0.029 against water at 0.045 —
 * 1.20:1, invisible at every depth on this page, and 9.81:1 on the cream carte.
 * Light grounds only. Never interpolated, because it is an ink, not a light.
 */
export const LOGO_TRUE = "#482720";

/**
 * Label inside a filled button. A deep water-blue rather than the page's
 * near-black, so the fill reads as lit rather than as a hole. 5.08:1 on the
 * surface lamp colour; the logo brown would be 3.58:1 and fail.
 */
export const BUTTON_LABEL = "#10303F";

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

const mix = (a: RGB, b: RGB, t: number): RGB => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

/** Piecewise-linear interpolation of a stop table at depth `d` metres. */
export function ramp(stops: readonly Stop[], d: number): RGB {
  for (let i = 1; i < stops.length; i++) {
    if (d <= stops[i][0] || i === stops.length - 1) {
      const [d0, c0] = stops[i - 1];
      const [d1, c1] = stops[i];
      const span = d1 - d0 || 1;
      return mix(c0, c1, clamp01((d - d0) / span));
    }
  }
  return stops[0][1];
}

export const rgb = (c: RGB) => `rgb(${c[0]},${c[1]},${c[2]})`;

/**
 * Every custom property the descent owns, at depth `d`.
 *
 * This is the single place the page's colour is decided. It is a pure function so
 * the same values can be baked into tokens.css for first paint, asserted in tests,
 * and written by the engine at runtime without any of the three drifting.
 */
export function depthVars(d: number): Record<string, string> {
  const t = clamp01(d / MAX_DEPTH);
  return {
    "--depth": d.toFixed(1),
    "--ground": rgb(ramp(GROUND, d)),
    "--lamp": rgb(ramp(LAMP, d)),
    "--acc": rgb(ramp(ACC, d)),
    "--bone": rgb(ramp(BONE, d)),
    "--body": rgb(ramp(BODY, d)),
    "--shell": rgb(ramp(SHELL, d)),
    "--logo": rgb(ramp(LOGO, d)),
    // Below thirty metres the vajana resolves out of the dark.
    "--deep": Math.max(0, Math.min(0.42, (d - 30) / 46)).toFixed(3),
    // Photographs lose saturation and warmth the way they would underwater.
    "--imgfx": `saturate(${(1 - t * 0.22).toFixed(3)}) brightness(${(1.04 - t * 0.26).toFixed(3)})`,
  };
}

/**
 * Scroll position -> depth in metres.
 *
 * Deliberately the whole document rather than per-section: the descent is one
 * continuous fall, so the fraction has to be global or sections would each restart
 * their own gradient. Note the tail consequence — the last viewport of content can
 * never be scrolled past, so the footer always sits at exactly 54m. That is the
 * deep, and it is correct.
 */
export function depthFromScroll(scrollY: number, scrollHeight: number, viewportHeight: number): number {
  const max = scrollHeight - viewportHeight;
  return max > 0 ? clamp01(scrollY / max) * MAX_DEPTH : 0;
}
