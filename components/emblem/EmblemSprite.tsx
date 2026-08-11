import { VAJANA } from "@/lib/engravings";
import { ROSETTE, VIEWBOX, engrave, type Variant } from "./geometry";

/**
 * Every rosette on the site, defined once.
 *
 * The mockup inlines the full markup at each of the eleven places the emblem
 * appears — ten identical copies of a 32KB three-ring mark plus the seven-ring
 * hero — which is about 300KB of duplicated HTML and most of what stands between
 * this page and Lighthouse 90 on mobile. Here the geometry is defined once and
 * referenced.
 *
 * Each *ring* is its own definition rather than the whole rosette, because the
 * rings counter-rotate independently; referencing the rosette as one unit would
 * turn them together and kill the effect.
 *
 * Rendered once, in the venue layout.
 */
export const ringId = (variant: Variant, index: number) => `vj-${variant}-r${index}`;
export const frameId = (variant: Variant) => `vj-${variant}-frame`;
export const FISH_ID = "vj-vajana";

export function EmblemSprite() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {(Object.keys(ROSETTE) as Variant[]).map((variant) => (
          <g key={variant}>
            {ROSETTE[variant].rings.map((ring, i) => (
              <g
                key={i}
                id={ringId(variant, i)}
                dangerouslySetInnerHTML={{ __html: engrave(ring) }}
              />
            ))}
            <g
              id={frameId(variant)}
              dangerouslySetInnerHTML={{ __html: engrave(ROSETTE[variant].frame) }}
            />
          </g>
        ))}

        {/* The vajana. It is the mark, so it carries the mark's colour — --logo,
            at every size — while the rings stay white. */}
        <g id={FISH_ID} dangerouslySetInnerHTML={{ __html: engrave(VAJANA.body) }} />
      </defs>
    </svg>
  );
}

export const FISH_VIEWBOX = VAJANA.viewBox;
export const ROSETTE_VIEWBOX = `0 0 ${VIEWBOX} ${VIEWBOX}`;
