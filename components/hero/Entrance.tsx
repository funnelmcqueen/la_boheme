"use client";

import { useEffect } from "react";
import styles from "./Entrance.module.css";

/**
 * The entrance.
 *
 * There is no separate intro graphic. The hero's own emblem is scaled up and
 * centred on the screen, then travels to its resting position, so the rings never
 * stop turning and there is no cut between the intro and the page. The rest of the
 * column resolves behind it.
 *
 * It is an overlay above fully-hydrated content, never a gate:
 *
 *   - the page is complete and readable underneath from first paint
 *   - it does not delay LCP and the crawler never sees it
 *   - under 2.5s, once per session, dismissed by tap, click, scroll or Escape
 *   - skipped for prefers-reduced-motion and for anyone on a hash deep link
 *   - no layout shift when it leaves — it only ever writes transform and opacity
 *
 * Someone at the table checking the menu on 4G must never wait for this.
 */
export function Entrance() {
  useEffect(() => {
    const root = document.documentElement;

    // Whether it runs at all was already decided, synchronously, before paint —
    // see entrance-script.ts. This only lands it.
    if (root.dataset.entrance !== "running") {
      root.dataset.entrance = "done";
      return;
    }

    const land = () => {
      if (root.dataset.entrance === "done") return;
      root.dataset.entrance = "done";
      window.removeEventListener("scroll", land);
      window.removeEventListener("pointerdown", land);
      window.removeEventListener("keydown", onKey);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") land();
    };

    // The pre-paint script owns the duration; this only adds the ways out.
    window.addEventListener("scroll", land, { passive: true, once: true });
    window.addEventListener("pointerdown", land, { once: true });
    window.addEventListener("keydown", onKey);

    // Only the listeners come off. Landing the entrance here would end it the
    // instant React's development double-invoke unmounted the effect, which looks
    // exactly like the animation never running.
    return () => {
      window.removeEventListener("scroll", land);
      window.removeEventListener("pointerdown", land);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // A scrim only — the emblem itself is the hero's, moved by CSS. Nothing here
  // occludes content or takes pointer events.
  return <div className={styles.scrim} aria-hidden="true" />;
}
