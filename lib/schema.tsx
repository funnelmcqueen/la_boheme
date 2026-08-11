import type { Copy } from "@/content/copy/types";
import { ALLERGY_NOTE, MENU, formatPrice } from "@/content/menu";
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
        offers: {
          "@type": "Offer",
          price: item.price,
          priceCurrency: "ALL",
          // The rendered string carries the unit — per kilo, per piece, per gram —
          // which `price` alone cannot express.
          description: formatPrice(item, copy.lang),
        },
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
