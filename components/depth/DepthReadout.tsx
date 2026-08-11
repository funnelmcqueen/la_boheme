"use client";

import { useEffect, useRef } from "react";
import styles from "./DepthReadout.module.css";

/**
 * Development instrument, not a page element. Removed before slice 6.
 *
 * Like the engine it drives from, it holds no state and never re-renders: it reads
 * the inline custom property off <html> (cheap — no getComputedStyle, no layout)
 * and writes textContent directly.
 */
export function DepthReadout() {
  const metres = useRef<HTMLSpanElement>(null);
  const swatch = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    let last = "";

    const tick = () => {
      const style = document.documentElement.style;
      const d = style.getPropertyValue("--depth") || "0.0";
      if (d !== last) {
        last = d;
        if (metres.current) metres.current.textContent = d;
        if (swatch.current) {
          swatch.current.textContent = style.getPropertyValue("--ground") || "—";
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={styles.readout} aria-hidden="true">
      <span className={styles.metres} ref={metres}>
        0.0
      </span>
      <span className={styles.unit}>m</span>
      <span className={styles.ground} ref={swatch} />
    </div>
  );
}
