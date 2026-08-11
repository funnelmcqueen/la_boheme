import { DepthMetres } from "@/components/depth/DepthMetres";
import type { Copy } from "@/content/copy/types";
import styles from "./StatusBar.module.css";

/**
 * The bottom status bar. Hours on the left, the depth reading on the right.
 *
 * It is hidden over the hero and fades in past 55% of the first screen, for two
 * reasons: a depth reading of 0 m on the first screen says nothing, and an earlier
 * version reserved a fixed strip at the bottom of the viewport which pushed the
 * hero's CTA upward. It reserves nothing now — it floats over the page.
 */
export function StatusBar({ copy }: { copy: Copy }) {
  return (
    <div className={styles.bar} aria-hidden="true">
      <span className={styles.open}>{copy.chrome.open}</span>
      <span className={styles.depth}>
        <span className={styles.label}>{copy.chrome.depth}</span>
        <DepthMetres className={styles.metres} />
        <span className={styles.unit}>m</span>
      </span>
    </div>
  );
}
