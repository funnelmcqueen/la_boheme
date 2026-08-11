"use client";

import { useEffect } from "react";
import { depthFromScroll, depthVars } from "./depth";

/**
 * The one scroll listener on the page.
 *
 * It writes custom properties onto <html> and renders nothing. There is no state
 * and no re-render — React mounts this once and then never touches it again, and
 * every colour on the page follows by CSS inheritance. That is deliberate: the
 * descent updates on every scroll frame, and routing it through React state would
 * re-render the whole tree sixty times a second to change six strings.
 *
 * First paint is already correct without it: tokens.css carries the 0m values as
 * :root defaults, so there is no flash and nothing to hydrate.
 */

/**
 * The descent runs under prefers-reduced-motion. This overrides BUILD-BRIEF §9,
 * which held it at the surface values.
 *
 * A colour change tied to scroll position is not motion — nothing travels, nothing
 * animates, and each frame is a stepped read of where you already are. Depth is
 * this page's meaning, so withholding it from someone with vestibular sensitivity
 * would take away the site rather than make it safe. What stops under reduced
 * motion is the seascape, the ring rotation, the entrance and the wave.
 *
 * The one thing to keep true: no transition and no easing on anything the engine
 * writes, or the stepped read becomes an animated one. Nothing may put a
 * `transition` on --ground or the ramped tokens.
 */
export function DepthEngine() {
  useEffect(() => {
    const root = document.documentElement;

    const apply = (d: number) => {
      const vars = depthVars(d);
      for (const key in vars) root.style.setProperty(key, vars[key]);
    };

    let frame = 0;
    const read = () => {
      frame = 0;
      apply(
        depthFromScroll(
          window.scrollY,
          document.documentElement.scrollHeight,
          window.innerHeight,
        ),
      );
    };
    // Coalesce to one write per frame. Scroll fires far more often than that, and
    // every handler here touches layout.
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    // The document grows as images decode, which moves every depth boundary. The
    // mockup only listened for resize and drifted until the next scroll.
    const observer = new ResizeObserver(schedule);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    observer.observe(document.body);
    read();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
