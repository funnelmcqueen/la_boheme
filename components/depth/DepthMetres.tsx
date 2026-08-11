"use client";

import { useEffect, useRef } from "react";
import { subscribeToVar } from "./subscribe";

/**
 * The live depth reading. Writes textContent directly — no state, no re-render.
 *
 * Rendered whole on the server at 0, so it is correct before hydration and there
 * is nothing to shift.
 */
export function DepthMetres({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(
    () =>
      subscribeToVar("--depth", (value) => {
        if (ref.current) ref.current.textContent = String(Math.round(Number(value) || 0));
      }),
    [],
  );

  return (
    <span className={className} ref={ref}>
      0
    </span>
  );
}
