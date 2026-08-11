"use client";

import { useEffect } from "react";

/**
 * Publish an element's rendered height as a custom property on <html>, so other
 * components can reserve space for it instead of guessing.
 *
 * Every measurement bug on this project has been one component assuming another's
 * size — a hardcoded 69px call bar that was really 89, a 26px media-query padding,
 * a bottom bar reserving a fixed 50px strip that pushed the hero's CTA off the
 * fold. The heights all move: labels are translated, buttons wrap at narrow
 * widths, safe-area insets differ per device, and the type scale is fluid. So
 * anything another component depends on publishes itself.
 *
 * The stylesheet still declares a default for the property. That is the no-JS
 * value and should be the realistic measured one, not a guess — this corrects it,
 * it does not supply it from nothing.
 *
 * Writes to the same inline-style channel the DepthEngine uses, and like it,
 * nothing re-renders.
 *
 * Takes a resolver rather than a ref so the element can be found at effect time —
 * PublishHeight uses it to measure its own parent.
 */
export function usePublishedHeight(getElement: () => HTMLElement | null, property: string) {
  useEffect(() => {
    const el = getElement();
    if (!el) return;

    const root = document.documentElement;
    let last = -1;

    const observer = new ResizeObserver(([entry]) => {
      const height = Math.round(
        entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height,
      );
      // A hidden element measures 0. Publishing that would collapse whatever
      // reserves space for it, so leave the stylesheet's default standing.
      if (height === last || height === 0) return;
      last = height;
      root.style.setProperty(property, `${height}px`);
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty(property);
    };
    // getElement is a closure over a ref; re-running on identity changes would
    // only churn the observer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [property]);
}
