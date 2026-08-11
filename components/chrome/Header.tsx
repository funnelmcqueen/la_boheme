import Link from "next/link";
import { PublishHeight } from "@/components/layout/PublishHeight";
import type { Copy } from "@/content/copy/types";
import type { Venue } from "@/content/venues";
import styles from "./Header.module.css";

/**
 * The lockup inverts the brand hierarchy on purpose: La Bohème large, the venue
 * small beneath it. That is how it already reads on the menus and on the chef's
 * jacket. The search hierarchy is the other way round and lives in <title> and
 * <h1>, which is why the two must not be swapped to match each other.
 */
export function Header({ copy, venue }: { copy: Copy; venue: Venue }) {
  return (
    <header className={styles.header}>
      <Link href={`${copy.prefix}/${venue.slug}`} className={styles.mark}>
        <span className={styles.master}>{copy.chrome.master}</span>
        <span className={styles.venue}>{copy.chrome.venue}</span>
      </Link>

      <nav className={styles.nav} aria-label={copy.a11y.primary}>
        {copy.nav.map((item) => (
          <Link key={item.href} href={item.href} className={styles.link}>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Anchor targets and the sticky category bar need to clear the header, and
          its height changes when it sticks and again with the fluid padding. */}
      <PublishHeight property="--vj-header-h" />
    </header>
  );
}
