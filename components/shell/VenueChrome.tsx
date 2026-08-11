import type { ReactNode } from "react";
import { CallBar } from "@/components/chrome/CallBar";
import { Header } from "@/components/chrome/Header";
import { StatusBar } from "@/components/chrome/StatusBar";
import { EmblemSprite } from "@/components/emblem/EmblemSprite";
import type { Copy } from "@/content/copy/types";
import type { Venue } from "@/content/venues";
import styles from "./VenueChrome.module.css";

/** Header, the two bars, and the content landmark. Shared by both locales. */
export function VenueChrome({
  copy,
  venue,
  children,
}: {
  copy: Copy;
  venue: Venue;
  children: ReactNode;
}) {
  return (
    <>
      <a href="#content" className={styles.skip}>
        {copy.a11y.skip}
      </a>
      {/* Every rosette on the page references this. Once per document. */}
      <EmblemSprite />
      <Header copy={copy} venue={venue} />
      <main id="content">{children}</main>
      <StatusBar copy={copy} />
      <CallBar copy={copy} venue={venue} />
    </>
  );
}
