"use client";

import { useRef } from "react";
import { usePublishedHeight } from "./usePublishedHeight";

/**
 * Drop into any element to publish that element's height as a custom property.
 *
 *   <header>… <PublishHeight property="--vj-header-h" /></header>
 *
 * Renders a zero-size marker and measures its parent, so the host can stay a
 * server component and does not need a ref or a client boundary of its own.
 */
export function PublishHeight({ property }: { property: string }) {
  const marker = useRef<HTMLSpanElement>(null);
  usePublishedHeight(() => marker.current?.parentElement ?? null, property);

  return <span ref={marker} hidden aria-hidden="true" />;
}
