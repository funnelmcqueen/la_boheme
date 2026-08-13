import type { Lang } from "@/content/menu";

/**
 * Both locales satisfy this, so a string added to Albanian and forgotten in
 * English is a type error rather than a blank on the page.
 *
 * No price string appears anywhere in here. Every price on the site renders from
 * content/menu.ts through formatPrice, and that is the only place one exists.
 *
 * Copy rule: say what is there. Numbers, ingredients, times. If a line would
 * survive being moved to a competitor's website unchanged, it is not saying
 * anything.
 */
export interface Copy {
  lang: Lang;
  /** Path prefix for this locale. Albanian is the default and has none. */
  prefix: "" | "/en";
  nav: { href: string; label: string }[];

  hero: {
    eyebrow: string;
    /** Set in two lines, the second in the lifted logo colour. */
    line1: string;
    line2: string;
    lede: string;
    caption: string;
  };

  atmosfera: {
    eyebrow: string;
    heading: string;
    body: string;
    frames: { label: string }[];
  };

  /** The one full-width break, where the beach ends and the restaurant begins. */
  chapter: string;

  chrome: {
    /** Master brand, carried in the header lockup. */
    master: string;
    /** Venue and city, set small under it. Never the venue name alone. */
    venue: string;
    open: string;
    depth: string;
  };

  kuzhina: {
    eyebrow: string;
    name: string;
    role: string;
    /** His own words, from Instagram. Confirm before this ships as a quote. */
    quote: string;
    body: string[];
    instagram: string;
  };

  signatures: {
    eyebrow: string;
    heading: string;
    note: string;
  };

  menu: {
    eyebrow: string;
    heading: string;
    tabs: { id: string; label: string }[];
    allergy: string;
  };

  catch: {
    eyebrow: string;
    heading: string;
    body: string;
  };

  wines: {
    eyebrow: string;
    heading: string;
    body: string;
    tableEyebrow: string;
    tableHeading: string;
    tableBody: string;
    housesNote: string;
  };


  /** Only the story *page* survives; the venue page's story section is gone. */
  story: {
    passage: string[];
    caption: string;
  };

  footer: {
    address: string;
    hours: string;
    bookings: string;
    instagram: string;
  };

  cta: {
    table: string;
    menu: string;
    call: string;
    whatsapp: string;
  };

  /** wa.me prefill, so the owner reads date and headcount before he replies. The
      evening prefill went with the Mbrëmje section — see lib/actions.ts. */
  prefill: {
    table: string;
  };

  a11y: {
    skip: string;
    primary: string;
    menuSections: string;
  };

  meta: {
    title: string;
    description: string;
    storyTitle: string;
    storyDescription: string;
  };
}
