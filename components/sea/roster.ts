import { FISH_REAL, OCTOPUS, PRAWN, type Creature } from "@/lib/creatures";
import type { Kind } from "./swim";

/**
 * The population, exactly as the mockup carries it: six fish, three prawns, two
 * octopuses, sixty-four motes.
 *
 * Every value is fixed rather than generated, because these are rendered on the
 * server. Anything random here would differ between the server and the client and
 * hydration would tear. Positions and headings *are* random, and they are set in
 * the effect after mount, where only the transform changes.
 *
 * Deeper things are smaller, fainter, bluer, slower and slightly out of focus.
 */
export interface Spec {
  kind: Kind;
  /** Width as a fraction of the viewport, matching the mockup's vw values. */
  vw: number;
  speed: number;
  opacity: number;
  blur: number;
  /** The propulsion cue's own period. Never the same as its neighbour's. */
  beat: number;
  art: Creature;
}

export const CREATURES: Spec[] = [
  { kind: "fish", vw: 9.6, speed: 21.9, opacity: 0.58, blur: 0.19, beat: 6.0, art: FISH_REAL },
  { kind: "fish", vw: 8.4, speed: 28.0, opacity: 0.5, blur: 0.0, beat: 7.3, art: FISH_REAL },
  { kind: "fish", vw: 7.6, speed: 28.5, opacity: 0.44, blur: 0.04, beat: 7.4, art: FISH_REAL },
  { kind: "fish", vw: 7.0, speed: 24.2, opacity: 0.38, blur: 0.02, beat: 6.8, art: FISH_REAL },
  { kind: "fish", vw: 6.4, speed: 25.6, opacity: 0.33, blur: 0.23, beat: 7.9, art: FISH_REAL },
  { kind: "fish", vw: 5.8, speed: 17.4, opacity: 0.28, blur: 0.12, beat: 6.4, art: FISH_REAL },
  { kind: "prawn", vw: 7.8, speed: 22.6, opacity: 0.48, blur: 0.46, beat: 4.2, art: PRAWN },
  { kind: "prawn", vw: 6.4, speed: 26.6, opacity: 0.36, blur: 0.19, beat: 3.7, art: PRAWN },
  { kind: "prawn", vw: 5.4, speed: 16.5, opacity: 0.28, blur: 0.15, beat: 4.9, art: PRAWN },
  { kind: "octopus", vw: 6.6, speed: 25.9, opacity: 0.46, blur: 0.21, beat: 5.6, art: OCTOPUS },
  { kind: "octopus", vw: 7.8, speed: 19.0, opacity: 0.34, blur: 0.1, beat: 6.9, art: OCTOPUS },
];

/**
 * Suspended matter, carried by the same field. This is what makes the push read
 * as water: the medium visibly streams outward and thins near the mark, leaving a
 * clear zone. Rings would read as sonar; drifting matter reads as sea.
 *
 * Generated from an index so the server and the client agree exactly.
 */
export const MOTES = Array.from({ length: 64 }, (_, i) => {
  const wave = Math.sin(i * 2.399963) * 0.5 + 0.5; // golden-angle spread, deterministic
  const ripple = Math.sin(i * 1.61803) * 0.5 + 0.5;
  return {
    size: +(1.6 + wave * 3.4).toFixed(2),
    opacity: +(0.14 + ripple * 0.34).toFixed(2),
    speed: +(7 + wave * 16).toFixed(1),
  };
});
