/**
 * Engraved line art, nineteenth-century natural-history plate. Stroke only, so it
 * can be drawn, scaled and tinted from CSS.
 *
 * Ported from engravings.py. Path data is the source of truth and must not be
 * redrawn by hand.
 */

export interface Engraving {
  viewBox: string;
  /** Paths and circles, as raw SVG children. */
  body: string;
}

/**
 * The vajana. This is the mark — inside the emblem it carries --logo at every
 * size, while the rings stay white.
 */
export const VAJANA: Engraving = {
  viewBox: "0 0 640 280",
  body: [
    '<path d="M62,148 C92,114 152,94 216,90 C302,85 402,95 466,120 C402,178 302,194 216,190 C152,186 92,180 62,148 Z"/>',
    '<path d="M466,120 C500,104 536,86 566,74 C548,104 534,120 528,132 C536,148 552,168 570,196 C534,178 498,158 468,142"/>',
    '<path d="M126,108 C144,140 144,162 128,184"/>',
    '<path d="M228,90 C252,62 292,50 340,52 C318,68 288,80 262,86"/>',
    '<path d="M196,152 C222,166 244,180 254,198 C230,190 208,176 194,162"/>',
    '<path d="M132,146 C220,138 340,140 452,132"/>',
    '<path d="M264,104 C270,122 270,152 262,176"/>',
    '<path d="M318,102 C324,124 324,152 316,178"/>',
    '<path d="M372,106 C378,126 378,150 370,174"/>',
    '<path d="M156,120 C168,132 168,160 158,172"/>',
    '<circle cx="102" cy="140" r="7"/>',
  ].join(""),
};

/**
 * The same fish with the fin rays, gill line and scale arcs dropped. Below about
 * 40px the detail turns to mush and reads as a smudge rather than as an engraving.
 */
export const VAJANA_SIMPLE: Engraving = {
  viewBox: "0 0 640 280",
  body: [
    '<path d="M62,148 C92,114 152,94 216,90 C302,85 402,95 466,120 C402,178 302,194 216,190 C152,186 92,180 62,148 Z"/>',
    '<path d="M466,120 C500,104 536,86 566,74 C548,104 534,120 528,132 C536,148 552,168 570,196 C534,178 498,158 468,142"/>',
    '<path d="M126,108 C144,140 144,162 128,184"/>',
    '<circle cx="102" cy="140" r="7"/>',
  ].join(""),
};
