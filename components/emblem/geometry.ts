import { mandalaMech } from "@/lib/mandala";

/**
 * The emblem's two sizes of rosette, generated once per process.
 *
 * `rings` is not a level of detail — every band's radii derive from
 * (RIM − HOLLOW) / rings, so the three-ring mark is its own geometry, not the
 * inner three bands of the seven-ring one. Both have to exist in the sprite.
 *
 * Seven turns to mush below about 90px, which is why the small mark has three.
 */

/** The viewBox every rosette and every instance shares. */
export const VIEWBOX = 760;

export type Variant = "full" | "mark";

/**
 * Alternating directions and non-harmonic periods, so the figure never visibly
 * repeats. These are in "must not change".
 */
export const RING_MOTION: Record<Variant, { seconds: number; reverse: boolean }[]> = {
  full: [
    { seconds: 210, reverse: false },
    { seconds: 150, reverse: true },
    { seconds: 118, reverse: false },
    { seconds: 86, reverse: true },
    { seconds: 64, reverse: false },
    { seconds: 46, reverse: true },
    { seconds: 32, reverse: false },
  ],
  mark: [
    { seconds: 154, reverse: false },
    { seconds: 108, reverse: true },
    { seconds: 70, reverse: false },
  ],
};

export const ROSETTE: Record<Variant, ReturnType<typeof mandalaMech>> = {
  full: mandalaMech(VIEWBOX, 7),
  mark: mandalaMech(VIEWBOX, 3),
};

/**
 * `vector-effect` is not an inherited property, and CSS selectors cannot reach
 * into a <use> element's shadow tree. Declaring it in a stylesheet — which is what
 * the mockup does — stops working the moment the geometry moves into <defs>, and
 * the failure is silent: the stroke scales with the viewBox instead, so at 92px
 * from a 760 box it renders at about a tenth of a pixel and the mark disappears.
 *
 * So it goes on every shape as a presentation attribute, inside the definition,
 * where <use> carries it into the shadow tree with the rest of the markup.
 *
 * components/emblem/Emblem.test.ts asserts the *painted* result rather than the
 * presence of this attribute, because an attribute-presence test would pass in
 * exactly the case this guards against.
 */
export const engrave = (fragment: string) =>
  fragment.replace(/<(path|circle)\b/g, '<$1 vector-effect="non-scaling-stroke"');
