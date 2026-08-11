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
