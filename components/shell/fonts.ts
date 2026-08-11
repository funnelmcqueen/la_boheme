import { Archivo, Bodoni_Moda } from "next/font/google";

/**
 * Self-hosted. next/font downloads the files at build time and serves them from
 * our own origin — no request to Google at runtime, no render-blocking stylesheet,
 * and the fallback metrics are adjusted so there is no layout shift when the real
 * face swaps in.
 *
 * latin-ext is not optional: Albanian's ë and ç are the two most common characters
 * on this page after the vowels.
 */

/**
 * Display. A true Didone, which is what nineteenth-century French print looked
 * like. Italic ships because the hero's second line is set in it.
 */
export const bodoni = Bodoni_Moda({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
  /**
   * "Bodoni 72" must carry its own quotes. next/font joins this array verbatim
   * into the custom property, and `72` is not a valid CSS identifier, so an
   * unquoted entry makes the whole font-family list invalid at computed-value
   * time. font-family is inherited, so an invalid declaration does not fall back
   * to the next name in the list — it falls back to the *inherited* value, and
   * every heading on the site silently renders in Archivo. Nothing throws, and
   * font-size in the same rule keeps working, so it reads as "the rule isn't
   * applying" when the rule is applying fine.
   */
  fallback: ['Didot', '"Bodoni 72"', "Georgia", "serif"],
});

/** Body. Quiet grotesk, wide range. 500 is for the filled button's label only. */
export const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500"],
  display: "swap",
  variable: "--font-body",
  fallback: ["Helvetica Neue", "system-ui", "sans-serif"],
});

export const fontClassName = `${bodoni.variable} ${archivo.variable}`;
