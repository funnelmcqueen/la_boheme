/**
 * The photography manifest.
 *
 * Photographs are assigned by measured luminance, so each one sits at its own
 * depth: bright, blue, high-key frames in the first ten metres, the fish on ice and
 * the live shellfish in the cool middle, the night terrace and the easel at the
 * bottom. Do not reshuffle them without re-checking tone — anything that has to be
 * graded heavily to fit its band is in the wrong band.
 *
 * Alt text is in the page's language and never says "Vajana" alone.
 */
export const SOURCE_DIR = "C:/Users/HP/Downloads/Vajana photos/Vajana photos";
export const PUBLIC_DIR = "public/img";

export interface ImageSpec {
  slug: string;
  source: string;
  /** Longest edge after grading. */
  width: number;
  /** [left, top, width, height] on the source. */
  crop?: [number, number, number, number];
  /** Skip the warm grade. */
  ungraded?: boolean;
  alt: { sq: string; en: string };
}

export const IMAGES: ImageSpec[] = [
  {
    slug: "hero-terrace",
    source: "IMG_7933.JPG",
    width: 1600,
    alt: {
      sq: "Tavolinë e shtruar përballë gjirit të Vlorës",
      en: "A table laid facing the bay of Vlorë",
    },
  },
  {
    slug: "dj",
    source: "IMG_7918.JPG",
    width: 1200,
    alt: { sq: "DJ mbi gjirin", en: "The DJ above the bay" },
  },
  {
    slug: "loungers",
    source: "IMG_7934.JPG",
    width: 1200,
    alt: { sq: "Shezlongët përballë detit", en: "Loungers facing the sea" },
  },
  {
    slug: "golden-hour",
    source: "IMG_7897.JPG",
    width: 1200,
    alt: { sq: "Dy gota në perëndim", en: "Two glasses at sunset" },
  },
  {
    slug: "catch-ice",
    source: "IMG_7920.JPG",
    width: 1400,
    alt: { sq: "Peshku i ditës mbi akull", en: "The day's catch on ice" },
  },
  {
    slug: "lobster",
    source: "IMG_7926.JPG",
    width: 1200,
    alt: { sq: "Aragostë e gjallë", en: "A live lobster" },
  },
  {
    slug: "wine",
    source: "IMG_7914.JPG",
    width: 1200,
    alt: { sq: "Vera e sjellë në tavolinë", en: "The wine carried to the table" },
  },
  {
    slug: "evening",
    source: "IMG_7905.JPG",
    width: 1600,
    alt: { sq: "Tarraca pas errësirës", en: "The terrace after dark" },
  },
  {
    slug: "easel",
    source: "IMG_7900.JPG",
    width: 1200,
    alt: { sq: "Kavaleti përballë gjirit", en: "The easel facing the bay" },
  },
];

/**
 * Blocked — the source file is not in the supplied set.
 *
 * BUILD-BRIEF §11 gives the chef's crop as `150, 372, 1230, 1722` and notes that
 * anything above y=372 includes "the screenshot's own chrome". That makes the
 * source a 1380px-wide screen capture, and the delivered photography is all camera
 * originals at 2160×2700 and above. No frame in the set can take that crop.
 *
 * He runs ungraded when he arrives: he was cropped tight, desaturated and darkened
 * to survive a near-black page that no longer exists. On blue water the original
 * needs nothing — he is photographed against the same sea, in the Vajana jacket,
 * and it is the only image on the site where the brand appears in the world rather
 * than on the screen. Never composite him onto a new background.
 */
export const BLOCKED = [
  { slug: "chef", need: "the original screen capture, 1380px wide or larger" },
] as const;

export const imageBySlug = (slug: string) => IMAGES.find((i) => i.slug === slug)!;
