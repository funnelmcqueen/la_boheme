import { Carte } from "@/components/sections/Carte";
import {
  Atmosfera, Footer, Kuzhina, Peshku, Signatures, Vererat,
} from "@/components/sections/Sections";
import { Chapter, Fleuron } from "@/components/sections/Separator";
import { Hero } from "@/components/hero/Hero";
import type { Copy } from "@/content/copy/types";
import type { Venue } from "@/content/venues";

/**
 * The page, in order.
 *
 * Narrative and tone agree with the descent: you arrive at the water, spend the
 * afternoon in it, and then the restaurant begins — and it begins with the person
 * cooking. Meet the chef, read what he cooks, see the fish he is given to work
 * with, get poured a wine, sit down to the evening, and end in the dark with the
 * story of the name.
 *
 * The carte follows the chef immediately because that is the order of interest:
 * someone who has just met the person cooking wants to know what he cooks, not yet
 * where the fish comes from. The catch then sits after it, as the proof behind the
 * prices they have just read.
 *
 * There is no separator under the hero divider's opposite number by accident —
 * separators are used only between two sections that both have content at the
 * boundary.
 */
export function VenuePage({
  copy,
  venue,
  venues,
}: {
  copy: Copy;
  venue: Venue;
  venues: Venue[];
}) {
  return (
    <>
      <Hero copy={copy} venue={venue} />
      <Fleuron />
      <Atmosfera copy={copy} venue={venue} />
      <Chapter label={copy.chapter} />
      <Kuzhina copy={copy} venue={venue} />
      <Signatures copy={copy} venue={venue} />
      <Carte copy={copy} />
      <Peshku copy={copy} venue={venue} />
      <Vererat copy={copy} venue={venue} />
      <Fleuron />
      <Footer copy={copy} venue={venue} />
    </>
  );
}
