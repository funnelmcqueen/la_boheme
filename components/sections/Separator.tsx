import { Emblem } from "@/components/emblem/Emblem";
import styles from "./Separator.module.css";

/**
 * A separator belongs to neither side, so it is its own block carrying the whole
 * gap — a flat 50px above and below at every viewport, the one measurement on the
 * page that does not scale. The sections either side give up their adjacent
 * padding in rhythm.css.
 *
 * Grid, not flex: `1fr auto 1fr` puts the mark exactly on the centre line, which
 * two flex:1 rules do not, because the rules' intrinsic content biases the
 * distribution. And the patterned rules tile away from the centre so both sides
 * meet the mark at the same point in the motif — tiling from the outside leaves
 * each side ending mid-tile in a different place, which is what makes a perfectly
 * centred divider look off.
 */
export function Fleuron() {
  return (
    <div className="vj-sep">
      <div className="vj-sep__inner">
        <span className="vj-sep__rule" />
        <span className={styles.fleuron} aria-hidden="true">
          <svg viewBox="0 0 200 120" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M100,14 C132,44 168,58 196,60 C168,62 132,76 100,106 C68,76 32,62 4,60 C32,58 68,44 100,14 Z" />
            <circle cx="100" cy="60" r="4.5" />
          </svg>
        </span>
        <span className="vj-sep__rule" />
      </div>
    </div>
  );
}

/**
 * The one full-width break, marking where the beach ends and the restaurant
 * begins: a hairline running out to both margins, broken in the middle by the
 * emblem itself and the chapter name beneath it. One only — a second turns a
 * structural signal into decoration.
 */
export function Chapter({ label }: { label: string }) {
  return (
    <div className="vj-chapter">
      <div className="vj-chapter__inner">
        <span className="vj-chapter__rule" />
        <span className={styles.chapter}>
          <Emblem variant="mark" className={styles.chapterMark} />
          <span className={styles.chapterLabel}>{label}</span>
        </span>
        <span className="vj-chapter__rule" />
      </div>
    </div>
  );
}
