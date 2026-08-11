import { vajana } from "./vajana";
import type { Venue } from "./types";

/** The collection. The footer venue list renders from this, holding one entry. */
export const VENUES: Venue[] = [vajana];

export const venueBySlug = (slug: string): Venue | undefined =>
  VENUES.find((v) => v.slug === slug);

export type { Venue };
