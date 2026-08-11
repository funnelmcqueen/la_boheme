import type { ReactNode } from "react";
import { ChromeState } from "@/components/chrome/ChromeState";
import { DepthEngine } from "@/components/depth/DepthEngine";
import { DepthReadout } from "@/components/depth/DepthReadout";
import { Ground } from "@/components/depth/Ground";

/**
 * The document body, shared by both root layouts.
 *
 * Albanian has no path prefix and English lives under /en, so <html lang> differs
 * per locale and App Router needs two root layouts to express that. Everything
 * below <body> is identical, and it lives here so the two cannot drift apart.
 *
 * Venue chrome is not here — it belongs to [venue]/layout.tsx, which is the first
 * layout that knows which venue it is rendering. The group page that eventually
 * lands at / will not want a header pointing at one restaurant.
 */
export function Shell({ children }: { children: ReactNode }) {
  return (
    <body>
      <Ground />
      <DepthEngine />
      <ChromeState />
      {children}
      {process.env.NODE_ENV !== "production" ? <DepthReadout /> : null}
    </body>
  );
}
