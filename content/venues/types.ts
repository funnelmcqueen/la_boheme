import type { Lang } from "@/content/menu";

export interface Venue {
  slug: string;
  /** The venue noun on its own. Never rendered alone — see `fullName`. */
  name: string;
  /** What goes in every title, meta field, alt text and schema record. */
  fullName: string;
  city: Record<Lang, string>;
  address: {
    street: string;
    locality: string;
    postalCode: string;
    country: Record<Lang, string>;
  };
  geo: { lat: number; lon: number };
  /** E.164, used for the tel: href. */
  phone: string;
  /** Digits only, used for the wa.me href. */
  whatsapp: string;
  instagram: string;
  hours: { opens: string; closes: string };
  priceRange: string;
  servesCuisine: string[];
}
