"use client";

import type { AnchorHTMLAttributes } from "react";
import { trackConversion, type Intent } from "@/lib/actions";
import styles from "./Button.module.css";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "outline" | "solid";
  /** Set on the two conversions so the click is counted. */
  track?: { channel: "tel" | "whatsapp"; intent: Intent };
};

export function Button({ variant = "outline", track, className, onClick, ...rest }: Props) {
  return (
    <a
      {...rest}
      className={[styles.btn, variant === "solid" ? styles.solid : "", className]
        .filter(Boolean)
        .join(" ")}
      onClick={(event) => {
        if (track) trackConversion(track.channel, track.intent);
        onClick?.(event);
      }}
    />
  );
}
