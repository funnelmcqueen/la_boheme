"use client";

import { useEffect, useRef } from "react";
import styles from "./ChromeState.module.css";

/**
 * Scroll-derived chrome state, as two data attributes on <html>:
 *
 *   data-stuck  the header has left the top of the page
 *   data-past   we are past 55% of the first screen
 *
 * Two zero-cost IntersectionObservers rather than a scroll handler, and no state,
 * so nothing re-renders and the CSS does the rest.
 *
 * Deliberately independent of the DepthEngine even though that already listens to
 * scroll: under reduced motion the engine detaches entirely, and a header that
 * never becomes legible would be a real bug for the people least able to absorb it.
 */
export function ChromeState() {
  const top = useRef<HTMLSpanElement>(null);
  const fold = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;

    const watch = (el: HTMLElement | null, attribute: "stuck" | "past") => {
      if (!el) return () => {};
      const observer = new IntersectionObserver(
        ([entry]) => {
          root.dataset[attribute] = String(!entry.isIntersecting);
        },
        { threshold: 0 },
      );
      observer.observe(el);
      return () => observer.disconnect();
    };

    const stop = [watch(top.current, "stuck"), watch(fold.current, "past")];
    return () => {
      stop.forEach((fn) => fn());
      delete root.dataset.stuck;
      delete root.dataset.past;
    };
  }, []);

  return (
    <div className={styles.sentinels} aria-hidden="true">
      <span ref={top} className={styles.top} />
      <span ref={fold} className={styles.fold} />
    </div>
  );
}
