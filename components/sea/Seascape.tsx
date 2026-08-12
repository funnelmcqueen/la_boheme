"use client";

import { useEffect, useRef, useState } from "react";
import { WAVE_FRONTS } from "@/lib/waves";
import { CREATURES, MOTES } from "./roster";
import { BASIN, orient, step, transformFor, type Basin, type Swimmer } from "./swim";
import styles from "./Seascape.module.css";

/**
 * What runs, and where.
 *
 * The shoal is expensive and the light is not, and those are two different
 * decisions. Measured on Lighthouse mobile, medians of five runs against a
 * production build:
 *
 *     everything          perf 52   TBT 1069ms   paint 2093ms   CLS 0.025
 *     nothing             perf 66   TBT  382ms   paint 2010ms   CLS 0.004
 *     light, no swimmers  perf 64   TBT  376ms   paint 2360ms   CLS 0.004
 *
 * Seventy-five elements, each promoted to its own compositing layer and each
 * written a fresh transform every frame, is most of a phone's main thread: it is
 * worth 14 points and 687ms of blocking time.
 *
 * The light is a different order of cost entirely — two points, inside the
 * run-to-run spread, and all of it paint rather than blocking time, because
 * rasterising a 26px blur once is not the same kind of work as writing 75
 * transforms a frame. So the caustics, the shafts, the surface and the wave
 * fronts stay everywhere and only the swimmers are desktop-only.
 *
 * That distinction matters beyond the number. The page's whole claim is that you
 * arrive already underwater, and light moving in the water is most of what says
 * so. Dropping it would have made the idea desktop-only on the device this
 * restaurant's visitors actually hold.
 *
 * It has to be *absence*, not `display:none` — hiding leaves the nodes and the
 * loop, which is where the blocking time lives.
 *
 * 1000px is the width Seascape.module.css already treats as the breakpoint where
 * the column stops being a column and goes full-bleed.
 */
const DESKTOP = "(min-width: 1000px)";
const STILL = "(prefers-reduced-motion: reduce)";

type Mode = "none" | "light" | "full";

/**
 * The gate.
 *
 * Renders nothing on the server and nothing on the first client render, so the
 * markup is identical on both and there is no hydration mismatch. The water then
 * mounts after hydration. Arriving one frame late is invisible: the layer is
 * `aria-hidden` decoration behind the masthead, so neither a crawler nor a screen
 * reader can tell, and the hero's own paint no longer waits on it.
 */
export function Seascape() {
  const [mode, setMode] = useState<Mode>("none");

  useEffect(() => {
    const wide = window.matchMedia(DESKTOP);
    const still = window.matchMedia(STILL);
    // Under reduce nothing runs at all — every layer here is motion in the
    // vestibular sense, the light included.
    const decide = () => setMode(still.matches ? "none" : wide.matches ? "full" : "light");

    decide();
    wide.addEventListener("change", decide);
    still.addEventListener("change", decide);
    return () => {
      wide.removeEventListener("change", decide);
      still.removeEventListener("change", decide);
    };
  }, []);

  return mode === "none" ? null : <Water swimmers={mode === "full"} />;
}

/**
 * The water.
 *
 * One requestAnimationFrame drives every creature and every mote. Nothing here
 * reads layout inside the loop and nothing writes anything but a transform.
 *
 * The propulsion cues are CSS animations on an inner element, deliberately not on
 * the one the loop writes to: a creature rotated to fake swimming reads as
 * tumbling and fights its own heading, so the cue has to live on its own layer.
 * A fish undulates on scaleX/scaleY, a prawn flicks laterally, an octopus pulses
 * its mantle — see Seascape.module.css.
 *
 * `swimmers: false` keeps the light and drops the shoal. The measurement still
 * has to run in that mode — the mask's hole and the wave fronts' start radius are
 * both read off the emblem's measured position, so light without a measure() is
 * light in the wrong place.
 */
function Water({ swimmers: withSwimmers }: { swimmers: boolean }) {
  const sea = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = sea.current;
    if (!root) return;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-swimmer]"));

    let basin: Basin;
    let swimmers: Swimmer[] = [];
    let maxRadius = 1;
    let s0 = 0.26;

    /** Layout position relative to the page, ignoring transforms — so the origin
        stays right while the emblem is still travelling in during the entrance. */
    const offset = (el: HTMLElement | null) => {
      let x = 0;
      let y = 0;
      let node: HTMLElement | null = el;
      while (node) {
        x += node.offsetLeft;
        y += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      return [x, y] as const;
    };

    const measure = () => {
      const box = root.getBoundingClientRect();
      const width = box.width;
      const height = box.height;

      // The masthead specifically. Small marks elsewhere on the page carry the
      // same attributes and would otherwise be picked up by document order.
      const dome = document.querySelector<HTMLElement>('[data-vj-dome="full"]');
      const emblem = document.querySelector<HTMLElement>('[data-vj-emblem="full"]');
      const here = offset(root);

      if (dome && emblem) {
        const d = offset(dome);
        const e = offset(emblem);
        // The origin is the emblem's baseline centre — measured rather than
        // guessed, so the water and the mark can never drift apart at any
        // viewport. It is also the point the rings turn about.
        const originX = d[0] - here[0] + dome.offsetWidth / 2;
        const originY = d[1] - here[1] + dome.offsetHeight;
        basin = {
          width,
          height,
          originX,
          originY,
          // The keep-out is the dome, not the whole lockup.
          //
          // It grew to cover the wordmark because creatures were crossing the
          // VAJANA lettering, and that over-solved it: type on a solid baseline
          // tolerates a fish passing behind it far better than the rosette does,
          // and an ellipse over the whole mark leaves the water column with no
          // middle at all — the shoal ends up pinned against the side walls and
          // the hero's opening instruction is delivered by an empty frame.
          emblemX: d[0] - here[0] + dome.offsetWidth / 2,
          emblemY: d[1] - here[1] + dome.offsetHeight / 2,
          emblemRX: (dome.offsetWidth / 2) * 1.05,
          emblemRY: (dome.offsetHeight / 2) * 1.07,
          // The whole lockup, wordmark included — the octopuses' ceiling.
          markBottom: e[1] - here[1] + emblem.offsetHeight,
          hole: (dome.offsetWidth / 2) * 1.02,
        };
        root.style.setProperty("--vj-ox", `${originX.toFixed(1)}px`);
        root.style.setProperty("--vj-oy", `${originY.toFixed(1)}px`);
        root.style.setProperty("--vj-hole", `${(emblem.offsetWidth * 0.78).toFixed(1)}px`);
        // Each front begins at the dome's own radius. The wave svg is 70vw wide,
        // so its untransformed radius is 0.35 of the viewport; measuring it with
        // getBoundingClientRect would return the animated scale instead.
        s0 = Math.min(0.55, Math.max(0.1, dome.offsetWidth / 2 / (window.innerWidth * 0.35)));
        root.style.setProperty("--vj-s0", s0.toFixed(3));
      } else {
        const originX = width * 0.36;
        const originY = height * 0.255;
        const hole = Math.min(width, height) * 0.16;
        basin = {
          width, height, originX, originY,
          emblemX: originX, emblemY: originY,
          emblemRX: hole, emblemRY: hole, markBottom: originY + hole, hole,
        };
      }
      maxRadius = window.innerWidth * 0.35;
    };

    // Light-only: measure, so the mask's hole and the wave fronts' start radius
    // land on the emblem, and stop there. No spawn, no loop, no per-frame write,
    // and none of the closures below ever built.
    if (!withSwimmers) {
      measure();
      const onMeasure = () => measure();
      window.addEventListener("resize", onMeasure);
      return () => window.removeEventListener("resize", onMeasure);
    }

    const init = () => {
      measure();
      swimmers = nodes.map((el) => {
        const kind = el.dataset.swimmer as Swimmer["kind"];
        const speed = Number(el.dataset.speed) || 20;
        const facing: 1 | -1 = Math.random() < 0.5 ? -1 : 1;
        // A fish starts level, an octopus starts rising, everything else anywhere.
        const heading =
          kind === "fish" ? (facing > 0 ? 0 : Math.PI)
          : kind === "octopus" ? -Math.PI / 2
          : Math.random() * Math.PI * 2;

        const width = el.offsetWidth || (kind === "mote" ? 3 : 60);
        /**
         * Never start inside the exclusion ellipse. The hard clamp is a safety
         * net for the running simulation; a creature spawned on top of the mark
         * fires it on frame one, which looks identical to a physics failure and
         * is not one. Measured before this: seven firings per session, all in the
         * first second.
         *
         * The margin is deliberately thin. At 486px the emblem's padded ellipse
         * spans the whole width of the water column, so demanding real clearance
         * pushes every spawn into the two low corners, and from there the outward
         * field walks the entire population to the same edge — measured, eleven
         * creature centres between −30 and 89 across a 749px column. Just outside
         * the clamp is all this needs to be.
         */
        const pad = kind === "mote" ? 3 : width * 0.55 + 6;
        let x = 0;
        let y = 0;
        for (let attempt = 0; attempt < 40; attempt++) {
          x = basin.width * 0.05 + Math.random() * basin.width * 0.6;
          y = basin.height * 0.05 + Math.random() * basin.height * 0.66;
          const clear = Math.hypot(
            (x - basin.emblemX) / (basin.emblemRX + pad),
            (y - basin.emblemY) / (basin.emblemRY + pad),
          );
          if (clear > 1.02) break;
        }

        return {
          kind,
          x,
          y,
          vx: Math.cos(heading) * speed,
          vy: Math.sin(heading) * speed,
          speed,
          width,
          height: el.offsetHeight || (kind === "mote" ? 3 : 26),
          facing,
          angle: null,
          wobble: Math.random() * Math.PI * 2,
          wobbleRate: 0.1 + Math.random() * 0.14,
          slip: Math.random() < 0.5 ? -1 : 1,
          fade: 1,
        };
      });
    };

    // The roster's own opacity, so the octopus fade multiplies it rather than
    // replacing it.
    const base = nodes.map((el) => Number(getComputedStyle(el).opacity) || 1);

    let frame = 0;
    let previous = 0;
    let started = 0;
    // The hard clamp is a safety net that should never fire. Counted so the
    // acceptance test can assert that over thirty seconds of motion.
    let clamps = 0;
    const clampsByKind: Record<string, number> = {};

    // `now` is the rAF timestamp and `dt` the elapsed step. Never `t` — see the
    // note at the top of swim.ts.
    const tick = (stamp: number) => {
      if (!started) started = stamp;
      const dt = Math.min(0.05, (stamp - previous) / 1000) || 0;
      previous = stamp;
      const now = (stamp - started) / 1000;

      for (let i = 0; i < swimmers.length; i++) {
        const swimmer = swimmers[i];
        const { clamped } = step(swimmer, basin, now, dt, maxRadius, s0);
        if (clamped) {
          clamps++;
          clampsByKind[swimmer.kind] = (clampsByKind[swimmer.kind] ?? 0) + 1;
        }
        const { angle, mirror } = orient(swimmer, dt);
        nodes[i].style.transform = transformFor(swimmer, angle, mirror);
        if (swimmer.kind === "octopus") nodes[i].style.opacity = String(base[i] * swimmer.fade);
      }

      frame = requestAnimationFrame(tick);
    };

    init();
    const onResize = () => init();
    window.addEventListener("resize", onResize);
    frame = requestAnimationFrame(tick);

    // Exposed for the acceptance test, which samples population and the closest
    // approach to the emblem over thirty seconds of real motion.
    (window as typeof window & { __vjSea?: unknown }).__vjSea = {
      swimmers: () => swimmers,
      basin: () => basin,
      clamps: () => clamps,
      clampsByKind: () => ({ ...clampsByKind }),
      nodes: () => nodes,
    };

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      delete (window as typeof window & { __vjSea?: unknown }).__vjSea;
    };
  }, [withSwimmers]);

  return (
    <div className={styles.sea} ref={sea} aria-hidden="true">
      <div className={`${styles.caustics} ${styles.a}`} />
      <div className={`${styles.caustics} ${styles.b}`} />
      <div className={styles.shaft} style={{ left: "12%", animationDuration: "38s" }} />
      <div className={styles.shaft} style={{ left: "46%", animationDuration: "51s", animationDelay: "-12s" }} />
      <div className={styles.surface} />

      {withSwimmers
        ? MOTES.map((mote, i) => (
            <i
              key={i}
              data-swimmer="mote"
              data-speed={mote.speed}
              className={styles.mote}
              style={{ width: mote.size, height: mote.size, opacity: mote.opacity }}
            />
          ))
        : null}

      {withSwimmers
        ? CREATURES.map((spec, i) => (
            <div
              key={i}
              data-swimmer={spec.kind}
              data-speed={spec.speed}
              className={`${styles.creature} ${styles[spec.kind]}`}
              style={{ width: `${spec.vw}vw`, opacity: spec.opacity, filter: `blur(${spec.blur}px)` }}
            >
              {/* The propulsion cue lives here, one layer in, so it can never
                  fight the heading the loop writes to the parent. */}
              <i className={styles.cue} style={{ animationDuration: `${spec.beat}s` }}>
                <svg
                  viewBox={spec.art.viewBox}
                  fill="none"
                  dangerouslySetInnerHTML={{ __html: spec.art.body }}
                />
              </i>
            </div>
          ))
        : null}

      {/* Light crossing the water, so nothing in the water occludes it. */}
      <div className={styles.wave}>
        {WAVE_FRONTS.map((front, i) => (
          <svg
            key={i}
            viewBox="0 0 1000 1000"
            style={{ animationDuration: `${front.duration}s`, animationDelay: `-${front.delay}s` }}
          >
            <path d={front.d} />
          </svg>
        ))}
      </div>
    </div>
  );
}
