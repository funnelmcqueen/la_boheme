"use client";

import { useRef } from "react";
import { usePublishedHeight } from "@/components/layout/usePublishedHeight";
import { Button } from "@/components/ui/Button";
import type { Copy } from "@/content/copy/types";
import type { Venue } from "@/content/venues";
import { telHref, whatsappHref } from "@/lib/actions";
import styles from "./CallBar.module.css";

/**
 * Mobile only. Both conversions, always reachable.
 *
 * Someone at the table checking the menu on 4G is the person this is for, so it
 * reserves its own height at the bottom of the hero rather than floating over the
 * CTA. It publishes that height as --vj-callbar-h instead of the stylesheet
 * guessing it: the labels are translated, the buttons wrap at narrow widths, and
 * the safe-area inset differs per device, so any constant here would be wrong on
 * something. rhythm.css carries a sane default for the no-JS case.
 */
export function CallBar({ copy, venue }: { copy: Copy; venue: Venue }) {
  const bar = useRef<HTMLDivElement>(null);
  usePublishedHeight(() => bar.current, "--vj-callbar-h");

  return (
    <div className={styles.bar} ref={bar}>
      <Button
        href={telHref(venue)}
        variant="solid"
        className={styles.action}
        track={{ channel: "tel", intent: "table" }}
      >
        {copy.cta.table}
      </Button>
      <Button
        href={whatsappHref(venue, copy, "table")}
        className={styles.action}
        target="_blank"
        rel="noopener"
        track={{ channel: "whatsapp", intent: "table" }}
      >
        {copy.cta.whatsapp}
      </Button>
    </div>
  );
}
