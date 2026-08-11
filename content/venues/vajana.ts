import type { Venue } from "./types";

/**
 * La Bohème is the master brand; Vajana is one venue. The second one is a file
 * beside this one, not a project — which is why the page lives at /[venue] from
 * day one rather than at /.
 *
 * Brand rule: "Vajana" never appears alone in a title, meta field, alt text or
 * structured data. Always "Vajana by La Bohème".
 */
export const vajana: Venue = {
  slug: "vajana",
  name: "Vajana",
  fullName: "Vajana by La Bohème",
  city: { sq: "Vlorë", en: "Vlorë" },
  address: {
    street: "SH8",
    locality: "Vlorë",
    postalCode: "9401",
    country: { sq: "Shqipëri", en: "Albania" },
  },
  geo: { lat: 40.392, lon: 19.479 },
  phone: "+355699845030",
  whatsapp: "355699845030",
  instagram: "https://www.instagram.com/vajana.vlore/",
  hours: { opens: "08:00", closes: "24:00" },
  priceRange: "$$$$",
  servesCuisine: ["Seafood", "Mediterranean", "Albanian"],
};
