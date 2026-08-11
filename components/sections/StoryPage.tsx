import Image from "next/image";
import Link from "next/link";
import { Emblem } from "@/components/emblem/Emblem";
import type { Copy } from "@/content/copy/types";
import { imageBySlug } from "@/content/images";
import type { Venue } from "@/content/venues";
import styles from "./StoryPage.module.css";

/**
 * The story page. La Bohème is the master brand, so this is its page, not the
 * venue's — it is what the name means, and why a restaurant on a beach in Vlorë
 * carries a word from 1840s Paris.
 *
 * `bohémiens` is set in italic in the passage, the way the copy marks it.
 */
export function StoryPage({ copy, venue }: { copy: Copy; venue: Venue }) {
  const photo = imageBySlug("easel");

  return (
    <article className={styles.page}>
      <div className={styles.inner}>
        <Emblem variant="full" wordmark className={styles.mark} />

        <h1 className={styles.title}>La Bohème</h1>

        {copy.story.passage.map((paragraph) => (
          <p key={paragraph} className={styles.paragraph}>
            {paragraph.split("bohémiens").flatMap((part, i, all) =>
              i < all.length - 1 ? [part, <em key={i}>bohémiens</em>] : [part],
            )}
          </p>
        ))}

        <figure className={styles.figure}>
          <Image
            src={`/img/${photo.slug}.jpg`}
            alt={photo.alt[copy.lang]}
            width={1200}
            height={1500}
            sizes="(max-width: 900px) 100vw, 660px"
            priority
          />
          <figcaption>{copy.story.caption}</figcaption>
        </figure>

        <Link href={`${copy.prefix}/${venue.slug}`} className={styles.back}>
          {venue.fullName}
        </Link>
      </div>
    </article>
  );
}
