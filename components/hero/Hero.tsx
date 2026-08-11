import Image from "next/image";
import { Emblem } from "@/components/emblem/Emblem";
import { Entrance } from "@/components/hero/Entrance";
import { ENTRANCE_SCRIPT } from "@/components/hero/entrance-script";
import { Seascape } from "@/components/sea/Seascape";
import { Button } from "@/components/ui/Button";
import type { Copy } from "@/content/copy/types";
import { imageBySlug } from "@/content/images";
import type { Venue } from "@/content/venues";
import { telHref, whatsappHref } from "@/lib/actions";
import styles from "./Hero.module.css";

/**
 * The first screen.
 *
 * The hero is the room, not a dish. Four plated shots were tried here and all four
 * failed the same way: a plate photographed flat reads as a menu photograph, and a
 * menu photograph at the top of a page reads as stock however good the food is. The
 * frame that works is a table laid facing the water — it answers the only question
 * a first-time visitor actually has, which is what it is like to sit there. On a
 * page whose first line is "Rezervo tavolinë", the hero shows the table. The food
 * starts one section down, where a diner would meet it.
 *
 * Type left, photograph right, water behind the type, the emblem at the top of the
 * column with the wave fronts leaving its baseline.
 */
export function Hero({ copy, venue }: { copy: Copy; venue: Venue }) {
  const photo = imageBySlug("hero-terrace");

  return (
    <section className={`vj-hero ${styles.hero}`}>
      <Seascape />
      <Entrance />

      <div className={styles.text}>
        <Emblem variant="full" wordmark as="h1" className={styles.emblem} />

        <p className={`vj-eyebrow ${styles.eyebrow}`}>{copy.hero.eyebrow}</p>

        {/* The lead line, not the page's heading — see the note on Emblem's `as`.
            It is display type doing display work; the h1 is the name above it. */}
        <p className={styles.headline}>
          {copy.hero.line1}
          <em>{copy.hero.line2}</em>
        </p>

        <span className={styles.rule} />

        <p className={styles.lede}>{copy.hero.lede}</p>

        <div className={styles.buttons}>
          <Button
            href={telHref(venue)}
            variant="solid"
            track={{ channel: "tel", intent: "table" }}
          >
            {copy.cta.table}
          </Button>
          <Button href="#menuja">{copy.cta.menu}</Button>
          <Button
            href={whatsappHref(venue, copy, "table")}
            target="_blank"
            rel="noopener"
            className={styles.whatsapp}
            track={{ channel: "whatsapp", intent: "table" }}
          >
            {copy.cta.whatsapp}
          </Button>
        </div>
      </div>

      <div className={styles.panel}>
        <Image
          src={`/img/${photo.slug}.jpg`}
          alt={photo.alt[copy.lang]}
          width={1600}
          height={2000}
          priority
          sizes="(max-width: 1000px) 100vw, 42vw"
          className={styles.photo}
        />
        {/* On the cream tab the logo brown is the real thing, exactly as printed. */}
        <span className={styles.caption}>{copy.hero.caption}</span>
      </div>

      {/* Last in the hero on purpose: it measures the emblem above it, and it must
          resolve before first paint. */}
      <script dangerouslySetInnerHTML={{ __html: ENTRANCE_SCRIPT }} />
    </section>
  );
}
