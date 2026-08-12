import type { Copy } from "@/content/copy/types";
import type { Venue } from "@/content/venues";

/**
 * The two conversions. Both offline: call, and WhatsApp. No booking engine.
 *
 * Every button offers both, and the WhatsApp prefill differs by intent so the
 * owner reads date, headcount and occasion before he replies.
 */
export type Intent = "table" | "evening";

export const telHref = (venue: Venue) => `tel:${venue.phone}`;

/**
 * The number as a person reads it, derived from the one a machine dials.
 *
 * It used to be a literal in the footer next to an href built from the venue
 * file, which is the same failure as a price hardcoded next to menu.ts: two
 * copies of one fact, and nothing to stop the visible one going stale after the
 * dialled one is corrected. Albanian mobile numbers group +355 69 984 5030.
 */
export function displayPhone(venue: Venue) {
  const digits = venue.phone.replace(/[^\d+]/g, "");
  const match = digits.match(/^(\+355)(\d{2})(\d{3})(\d{4})$/);
  return match ? `${match[1]} ${match[2]} ${match[3]} ${match[4]}` : venue.phone;
}

export const whatsappHref = (venue: Venue, copy: Copy, intent: Intent) =>
  `https://wa.me/${venue.whatsapp}?text=${encodeURIComponent(copy.prefill[intent])}`;

/**
 * There is no tracking line on this business and GBP insights are the only other
 * signal, so every tel: and wa.me click is worth an event. Guarded because gtag
 * is not present in development and must never throw into a navigation.
 */
export function trackConversion(channel: "tel" | "whatsapp", intent: Intent) {
  const w = window as typeof window & { gtag?: (...args: unknown[]) => void };
  w.gtag?.("event", "contact", { channel, intent });
}
