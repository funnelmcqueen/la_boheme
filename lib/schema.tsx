import type { Copy } from "@/content/copy/types";
import { ALLERGY_NOTE, MENU, formatPrice, type MenuItem } from "@/content/menu";
import type { Venue } from "@/content/venues";

/**
 * Structured data.
 *
 * The visual hierarchy favours La Bohème; the search hierarchy does not. So the
 * Restaurant is Vajana, with `parentOrganization` pointing at a La Bohème
 * Organization, each with its own stable @id — and every name carries
 * "Vajana by La Bohème" in full. Alone, "Vajana" collides with anatomical
 * misspellings in search, which is why the rule exists.
 *
 * Prices come from menu.ts through the same formatter the page uses. Nothing here
 * hardcodes one.
 */
export const SITE = "https://vajana.al";

const ORG_ID = `${SITE}/#la-boheme`;
const restaurantId = (venue: Venue) => `${SITE}/${venue.slug}#restaurant`;
const menuId = (venue: Venue) => `${SITE}/${venue.slug}#menu`;

export function organization() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "La Bohème",
    url: SITE,
  };
}

/**
 * UN/CEFACT codes, which is what schema.org's `unitCode` expects.
 *
 * The rendered string ("9 000 L / kg") is for a reader; `unitCode` is for a
 * crawler, and without it a per-kilo fish reads as a 9,000 lekë dish. That is a
 * price a third higher than any plate on the menu, attached to the one section
 * whose whole argument is that you pick the fish and it is weighed in front of
 * you.
 */
const UNIT_CODE = { kg: "KGM", gram: "GRM", piece: "H87" } as const;

/**
 * An item's offer, or offers.
 *
 * `flat` is a plain Offer — a price with nothing to qualify. Everything else is a
 * UnitPriceSpecification carrying the quantity that price buys. `pair` is the odd
 * one: it is two sizes at two prices (S / L), so it is two Offers rather than one
 * with a range, because a range would say the dish costs somewhere between them.
 */
function offersFor(item: MenuItem, copy: Copy) {
  const rendered = formatPrice(item, copy.lang);
  const base = { "@type": "Offer", priceCurrency: "ALL", description: rendered } as const;

  if (item.unit === "pair") {
    return [
      { ...base, price: item.price, name: "S" },
      { ...base, price: item.price2, name: "L" },
    ];
  }

  if (item.unit === "flat") return { ...base, price: item.price };

  return {
    ...base,
    price: item.price,
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: item.price,
      priceCurrency: "ALL",
      referenceQuantity: {
        "@type": "QuantitativeValue",
        value: item.unit === "gram" ? item.gramWeight : 1,
        unitCode: UNIT_CODE[item.unit],
      },
    },
  };
}

export function menuSchema(venue: Venue, copy: Copy) {
  return {
    "@type": "Menu",
    "@id": menuId(venue),
    name: `${venue.fullName} — ${copy.menu.heading}`,
    inLanguage: copy.lang,
    hasMenuSection: MENU.map((group) => ({
      "@type": "MenuSection",
      name: group.title[copy.lang],
      ...(group.note ? { description: group.note[copy.lang] } : {}),
      hasMenuItem: group.items.map((item) => ({
        "@type": "MenuItem",
        name: item.name[copy.lang],
        ...(item.desc ? { description: item.desc[copy.lang] } : {}),
        offers: offersFor(item, copy),
      })),
    })),
    suitableForDiet: undefined,
  };
}

export function restaurant(venue: Venue, copy: Copy) {
  const path = `${SITE}${copy.prefix}/${venue.slug}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      organization(),
      {
        "@type": "Restaurant",
        "@id": restaurantId(venue),
        name: venue.fullName,
        url: path,
        parentOrganization: { "@id": ORG_ID },
        description: copy.meta.description,
        servesCuisine: venue.servesCuisine,
        priceRange: venue.priceRange,
        telephone: venue.phone,
        sameAs: [venue.instagram],
        address: {
          "@type": "PostalAddress",
          streetAddress: venue.address.street,
          addressLocality: venue.address.locality,
          postalCode: venue.address.postalCode,
          addressCountry: "AL",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: venue.geo.lat,
          longitude: venue.geo.lon,
        },
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
          ],
          opens: venue.hours.opens,
          closes: venue.hours.closes,
        },
        // Anchored at the inline menu, which is the only place it exists.
        hasMenu: { "@id": menuId(venue) },
        acceptsReservations: `tel:${venue.phone}`,
      },
      menuSchema(venue, copy),
      {
        "@type": "WebPage",
        "@id": `${path}#page`,
        url: path,
        name: copy.meta.title,
        inLanguage: copy.lang,
        isPartOf: { "@id": ORG_ID },
        about: { "@id": restaurantId(venue) },
        // Not a claim about the menu — the note the printed card carries.
        disambiguatingDescription: ALLERGY_NOTE[copy.lang],
      },
    ],
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
