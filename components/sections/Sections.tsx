import Image from "next/image";
import { Emblem } from "@/components/emblem/Emblem";
import { Button } from "@/components/ui/Button";
import type { Copy } from "@/content/copy/types";
import { imageBySlug } from "@/content/images";
import { MENU, SIGNATURES, formatPrice } from "@/content/menu";
import type { Venue } from "@/content/venues";
import { displayPhone, telHref, whatsappHref } from "@/lib/actions";
import styles from "./Sections.module.css";

type Props = { copy: Copy; venue: Venue };

function Photo({ slug, copy, className, sizes, priority = false }: {
  slug: string;
  copy: Copy;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  const photo = imageBySlug(slug);
  return (
    <Image
      src={`/img/${photo.slug}.jpg`}
      alt={photo.alt[copy.lang]}
      width={1400}
      height={1750}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}

/** 3–8m. Music and the crowd, the three frames of the day. */
export function Atmosfera({ copy }: Props) {
  return (
    <>
      <section id="atmosfera" className={styles.intro}>
        <div className="vj-column">
          <p className="vj-eyebrow">{copy.atmosfera.eyebrow}</p>
          <h2>{copy.atmosfera.heading}</h2>
          <p>{copy.atmosfera.body}</p>
        </div>
      </section>

      {/* A triptych. The labels sit under the frames rather than on them: white
          type laid over a photograph is legible or not depending on the
          photograph, and these three are a DJ booth, white loungers and a sunset.
          Clock times went with the overlay — the copy already says "from midday",
          and three timestamps read as a schedule for something that is not one. */}
      <section className={styles.strip} aria-label={copy.atmosfera.eyebrow}>
        {["dj", "loungers", "golden-hour"].map((slug, i) => (
          <figure key={slug} className={styles.frame}>
            <Photo slug={slug} copy={copy} sizes="(max-width: 900px) 100vw, 33vw" />
            <figcaption className={styles.frameCaption}>
              {copy.atmosfera.frames[i].label}
            </figcaption>
          </figure>
        ))}
      </section>
    </>
  );
}

/**
 * 10–16m. The chef leads the restaurant half, because he is the only thing on the
 * page a competitor cannot copy. A beach club can buy the same loungers and book
 * the same DJ; it cannot have Gabriel.
 */
export function Kuzhina({ copy }: Props) {
  return (
    <section id="kuzhina">
      <div className={`vj-column ${styles.split} vj-split`}>
        <div className={styles.portrait}>
          {/* Blocked: the source is a screen capture that is not in the supplied
              set — see content/images.ts. The slot keeps its shape so the section
              does not have to be re-laid out when it arrives. */}
          <div className={styles.portraitPending} aria-hidden="true" />
        </div>

        <div>
          <p className="vj-eyebrow">{copy.kuzhina.eyebrow}</p>
          <h2 className={styles.chefName}>{copy.kuzhina.name}</h2>
          <p className={styles.role}>{copy.kuzhina.role}</p>
          <blockquote className={styles.quote}>„{copy.kuzhina.quote}"</blockquote>
          {copy.kuzhina.body.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p className={styles.instagram}>{copy.kuzhina.instagram}</p>
        </div>
      </div>
    </section>
  );
}

/** 18–21m. Ornament only, no photograph. Names, ingredients and the price. */
export function Signatures({ copy }: Props) {
  return (
    <section id="signatures">
      <div className={`vj-column ${styles.signatures}`}>
        <p className="vj-eyebrow">{copy.signatures.eyebrow}</p>
        <h2 className={styles.signatureHeading}>{copy.signatures.heading}</h2>
        <p className={styles.signatureNote}>{copy.signatures.note}</p>

        <ul className={styles.dishes}>
          {SIGNATURES.map((item) => (
            <li key={item.id} className={styles.dish}>
              <Emblem variant="mark" className={styles.dishMark} />
              <h3 className={styles.dishName}>{item.name[copy.lang]}</h3>
              <p className={styles.dishDesc}>
                {item.desc ? `${item.desc[copy.lang]}. ` : ""}
                <span className={styles.dishPrice}>{formatPrice(item, copy.lang)}</span>
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/**
 * 30–36m. The proof behind the prices just read. All twelve species render from
 * menu.ts — the mockup showed eight, which was an oversight.
 */
export function Peshku({ copy }: Props) {
  const group = MENU.find((g) => g.id === "catch")!;

  return (
    <section id="peshku">
      <div className={`vj-column ${styles.split} vj-split`}>
        <div>
          <p className="vj-eyebrow">{copy.catch.eyebrow}</p>
          <h2>{copy.catch.heading}</h2>
          <p>{copy.catch.body}</p>

          <ul className={styles.species}>
            {group.items.map((item) => (
              <li key={item.id}>
                <span>{item.name[copy.lang]}</span>
                <span className={styles.perKilo}>{formatPrice(item, copy.lang)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.stack}>
          <Photo slug="catch-ice" copy={copy} sizes="(max-width: 900px) 100vw, 42vw" />
          <Photo slug="lobster" copy={copy} sizes="(max-width: 900px) 100vw, 42vw" />
        </div>
      </div>
    </section>
  );
}

/** 32–38m. The cellar runs on type and one portrait. */
export function Vererat({ copy }: Props) {
  return (
    <>
      <section id="vererat">
        <div className="vj-column">
          <p className="vj-eyebrow">{copy.wines.eyebrow}</p>
          <h2>{copy.wines.heading}</h2>
          <p>{copy.wines.body}</p>
        </div>
        <Houses note={copy.wines.housesNote} />
      </section>

      <section id="tavoline">
        <div className={`vj-column ${styles.split} vj-split`}>
          <Photo slug="wine" copy={copy} sizes="(max-width: 900px) 100vw, 42vw" />
          <div>
            <p className="vj-eyebrow">{copy.wines.tableEyebrow}</p>
            <h2>{copy.wines.tableHeading}</h2>
            <p>{copy.wines.tableBody}</p>
          </div>
        </div>
      </section>
    </>
  );
}

/**
 * The eight houses actually on the list, checked against menu.ts. Set as
 * wordmarks, not logos, and deliberately so: the marks are trademarks, several of
 * these houses restrict third-party use, and a row of producer logos on a
 * restaurant site can imply an endorsement that does not exist. Swapping a
 * wordmark for an <img> needs no other change.
 *
 * A seamless marquee: the track holds the list twice and translates by exactly
 * -50%, so at the moment it restarts the second copy stands where the first began
 * and there is no seam.
 */
const HOUSES = [
  { name: "Gaja", where: "Barbaresco · Piemonte" },
  { name: "Luce della Vite", where: "Montalcino · Toscana" },
  { name: "Livio Felluga", where: "Rosazzo · Friuli" },
  { name: "Philipponnat", where: "Mareuil-sur-Aÿ · Champagne" },
  { name: "Bellavista", where: "Erbusco · Franciacorta" },
  { name: "Ceretto", where: "Alba · Piemonte" },
  { name: "Cantina Terlano", where: "Terlano · Alto Adige" },
  { name: "Castello del Terriccio", where: "Castagneto · Toscana" },
];

function Houses({ note }: { note: string }) {
  return (
    <div className={styles.marquee} aria-label={note}>
      <div className={styles.track}>
        {[0, 1].map((copyIndex) => (
          <div key={copyIndex} className={styles.run} aria-hidden={copyIndex === 1}>
            {HOUSES.map((house) => (
              <span key={house.name} className={styles.house}>
                <span className={styles.houseName}>{house.name}</span>
                <span className={styles.houseWhere}>{house.where}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Footer({ copy, venue }: Props) {
  return (
    <footer className={styles.footer}>
      <div className={`vj-column ${styles.footerInner}`}>
        {/* The mark closes the page the way it opened it. */}
        <Emblem variant="mark" className={styles.footerMark} />

        <span className={styles.footerMaster}>La Bohème</span>
        <span className={styles.footerVenue}>
          {venue.name} · {venue.city[copy.lang]}
        </span>

        <div className={styles.footerGrid}>
          <div>
            <p className="vj-eyebrow">{copy.footer.address}</p>
            <p className={styles.footerLine}>
              {venue.address.street}, {venue.address.locality} {venue.address.postalCode}
              <br />
              {venue.address.country[copy.lang]}
            </p>
          </div>

          <div>
            <p className="vj-eyebrow">{copy.footer.hours}</p>
            <p className={styles.footerLine}>{copy.chrome.open}</p>
          </div>

          <div>
            <p className="vj-eyebrow">{copy.footer.bookings}</p>
            <p className={styles.footerLine}>
              <a href={telHref(venue)} className={styles.footerLink}>
                {displayPhone(venue)}
              </a>
              <br />
              <a
                href={whatsappHref(venue, copy, "table")}
                target="_blank"
                rel="noopener"
                className={styles.footerLink}
              >
                {copy.cta.whatsapp}
              </a>
              <br />
              <a href={venue.instagram} target="_blank" rel="noopener" className={styles.footerLink}>
                {copy.footer.instagram}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
