import { FISH_ID, FISH_VIEWBOX, ROSETTE_VIEWBOX, frameId, ringId } from "./EmblemSprite";
import { RING_MOTION, ROSETTE, type Variant } from "./geometry";
import styles from "./Emblem.module.css";

/**
 * The emblem. The one fixed point in the descent.
 *
 * Flat #FFFFFF, fully opaque, at every depth — the water changes around the mark,
 * the mark does not change. That is what makes it readable as a fixed point:
 * everything else on the page is a reading of the light and tells you how deep you
 * are, so if the mark ramped too there would be nothing to measure against.
 *
 * A half-rosette dome with the vajana floating in its hollow, the wordmark on the
 * baseline. The dome is the top half of the full rosette — `overflow:hidden` at
 * 50% of the width — and the baseline is the rosette's own centre line, which is
 * also the point the rings turn about and the point the seascape leaves from, so
 * the mark and the water share one origin.
 *
 * Every rosette on the site is this component, and there are **six** of them on
 * the venue page: the hero at 486px, the chapter divider at 112px, three house
 * signatures at 92px, and one closing the story at 112px. The story page carries
 * a seventh, a 386px `full`.
 *
 * Three sizes, not four. BUILD-BRIEF §10's fourth — large rosettes drifting
 * behind sections at 7% opacity — is cancelled: on a page whose cost is
 * compositing, a decorative layer at 7% opacity is not worth a layer. See
 * DECISIONS.
 */
export function Emblem({
  variant = "mark",
  wordmark = false,
  as: Name = "div",
  className,
}: {
  variant?: Variant;
  /** Only the masthead carries the name. */
  wordmark?: boolean;
  /**
   * The element the wordmark is set in. The hero passes "h1", because the search
   * hierarchy is the opposite of the visual one: the page's heading is the
   * restaurant's name, not the lead line above the fold. §12 is explicit that the
   * h1 and the title carry Vajana, and that the two must not be swapped to match
   * the visual emphasis.
   */
  as?: "div" | "h1";
  className?: string;
}) {
  const rings = ROSETTE[variant].rings;
  const motion = RING_MOTION[variant];

  return (
    <div
      className={[styles.emblem, styles[variant], className].filter(Boolean).join(" ")}
      /* The seascape measures its origin and its exclusion ellipse off these, so
         the water and the mark can never drift apart at any viewport. */
      data-vj-emblem={variant}
    >
      <div className={styles.dome} data-vj-dome={variant}>
        <div className={styles.dial}>
          <svg
            viewBox={ROSETTE_VIEWBOX}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            strokeLinejoin="round"
            strokeLinecap="round"
            aria-hidden="true"
            focusable="false"
          >
            {rings.map((_, i) => (
              <use
                key={i}
                href={`#${ringId(variant, i)}`}
                className={styles.ring}
                style={{
                  animationDuration: `${motion[i].seconds}s`,
                  animationDirection: motion[i].reverse ? "reverse" : "normal",
                }}
              />
            ))}
            <use href={`#${frameId(variant)}`} className={styles.frame} />
          </svg>
        </div>

        <div className={styles.core}>
          <svg viewBox={FISH_VIEWBOX} fill="none" aria-hidden="true" focusable="false">
            <use href={`#${FISH_ID}`} />
          </svg>
        </div>
      </div>

      <div className={styles.base} />

      {wordmark ? (
        <Name className={styles.name} data-vj-wordmark="">
          {/* The lockup inverts the brand hierarchy — Vajana large, the
              endorsement small — because that is how it already reads on the
              menus and on the chef's jacket. */}
          {/* The space matters: both spans are display:block, so it changes
              nothing visually, but without it the accessible name and the
              crawler both read "Vajanaby La Bohème". */}
          <span className={styles.vaj}>Vajana</span>{" "}
          <span className={styles.lb}>by La Bohème</span>
        </Name>
      ) : null}
    </div>
  );
}
