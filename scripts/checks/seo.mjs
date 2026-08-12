/**
 * The rules that are not preferences: the brand rule, the search hierarchy, the
 * structured data, and the accessibility floor.
 *
 *   node scripts/checks/seo.mjs
 */
import { baseUrl, open, reporter, withBrowser } from "./harness.mjs";

const LOCALES = [
  { path: "/vajana", lang: "sq", altPrefix: "" },
  { path: "/en/vajana", lang: "en", altPrefix: "/en" },
];

await withBrowser(async (browser) => {
  const report = reporter("SEO, schema and the accessibility floor");

  for (const locale of LOCALES) {
    const page = await open(browser, locale.path);

    const data = await page.evaluate(() => {
      const ld = document.querySelector('script[type="application/ld+json"]');
      const graph = ld ? JSON.parse(ld.textContent)["@graph"] : [];
      const node = (type) => graph.find((n) => n["@type"] === type);
      const restaurant = node("Restaurant");
      const menu = node("Menu");

      return {
        lang: document.documentElement.lang,
        title: document.title,
        h1Count: document.querySelectorAll("h1").length,
        h1: document.querySelector("h1")?.textContent.trim() ?? "",
        alts: [...document.images].map((i) => i.alt),
        alternates: [...document.querySelectorAll('link[rel="alternate"]')].map((l) => ({
          lang: l.getAttribute("hreflang"),
          href: l.getAttribute("href"),
        })),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href"),
        types: graph.map((n) => n["@type"]),
        parentMatches: restaurant?.parentOrganization?.["@id"] === node("Organization")?.["@id"],
        menuMatches: restaurant?.hasMenu?.["@id"] === menu?.["@id"],
        restaurantName: restaurant?.name,
        sections: menu?.hasMenuSection?.length ?? 0,
        items: menu?.hasMenuSection?.reduce((n, s) => n + s.hasMenuItem.length, 0) ?? 0,
        /**
         * Two different assertions, because the prose and the machine-readable
         * quantity are read by different consumers and only one of them existed.
         *
         * `description` is the rendered string a person sees. `priceSpecification
         * .referenceQuantity` is what stops a crawler reading "9 000 L / kg" as a
         * 9,000 lekë dish. An item is qualified if it is flat-priced (nothing to
         * qualify), or a pair of sizes (two Offers), or carries the quantity.
         */
        offersCarryUnit: menu?.hasMenuSection
          ?.flatMap((s) => s.hasMenuItem)
          .every((i) =>
            [i.offers].flat().every(
              (o) => typeof o?.description === "string" && /\d/.test(o.description),
            ),
          ),
        offersQualifyQuantity: menu?.hasMenuSection
          ?.flatMap((s) => s.hasMenuItem)
          .every((i) => {
            const offers = [i.offers].flat();
            if (offers.length > 1) return offers.every((o) => typeof o.price === "number");
            const q = offers[0]?.priceSpecification?.referenceQuantity;
            // Flat-priced items carry no quantity, and should not.
            const perUnit = / \/ /.test(offers[0]?.description ?? "");
            return perUnit ? Boolean(q?.unitCode && q?.value) : !q;
          }),
        /** "Vajana" alone collides with anatomical misspellings in search. It must
            never appear without "by La Bohème" in a title, meta field, alt text or
            structured data. */
        loneVajana: [
          document.title,
          document.querySelector('meta[name="description"]')?.content ?? "",
          ...graph.map((n) => String(n.name ?? "")),
          ...[...document.images].map((i) => i.alt),
        ].filter((text) => /\bVajana\b(?! by La Bohème)/.test(text)),
      };
    });

    await page.close();
    const tag = locale.lang.toUpperCase();

    report.check(`${tag} — <html lang>`, data.lang === locale.lang, data.lang);
    report.check(`${tag} — title carries the full name`, data.title.includes("Vajana by La Bohème"), data.title);
    report.check(`${tag} — exactly one h1`, data.h1Count === 1, `${data.h1Count}`);
    // §12: the visual hierarchy favours La Bohème, the search hierarchy does not.
    report.check(`${tag} — h1 carries Vajana`, data.h1 === "Vajana by La Bohème", `"${data.h1}"`);
    report.check(`${tag} — "Vajana" never appears alone`, data.loneVajana.length === 0, data.loneVajana[0] ?? "");
    report.check(`${tag} — every image has alt text`, data.alts.every(Boolean), `${data.alts.length} images`);
    report.check(
      `${tag} — canonical`,
      data.canonical?.endsWith(`${locale.altPrefix}/vajana`),
      data.canonical,
    );
    report.check(
      `${tag} — hreflang sq/en/x-default`,
      ["sq", "en", "x-default"].every((l) => data.alternates.some((a) => a.lang === l)),
      data.alternates.map((a) => a.lang).join(", "),
    );

    report.check(
      `${tag} — schema graph`,
      ["Organization", "Restaurant", "Menu", "WebPage"].every((t) => data.types.includes(t)),
      data.types.join(", "),
    );
    report.check(`${tag} — parentOrganization resolves`, data.parentMatches === true);
    report.check(`${tag} — hasMenu resolves to the Menu`, data.menuMatches === true);
    report.check(
      `${tag} — menu is generated from menu.ts`,
      data.sections >= 10 && data.items >= 80,
      `${data.sections} sections, ${data.items} items`,
    );
    // `price` alone cannot express per kilo, per piece or per gram.
    report.check(`${tag} — offers carry their unit`, data.offersCarryUnit === true);
    report.check(
      `${tag} — per-unit offers carry a machine-readable quantity`,
      data.offersQualifyQuantity === true,
    );
  }

  // ---- the accessibility floor ----
  const page = await open(browser, "/vajana", { width: 360, height: 780, isMobile: true });
  const floor = await page.evaluate(() => ({
    overflows: document.documentElement.scrollWidth > innerWidth,
    headings: [...document.querySelectorAll("h1, h2, h3")].map((h) => Number(h.tagName[1])),
  }));
  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => {
    const active = document.activeElement;
    return { text: active.textContent.trim().slice(0, 28), outline: getComputedStyle(active).outlineColor };
  });
  await page.close();

  report.check("360px — no horizontal overflow", !floor.overflows);
  report.check(
    "heading order never skips a level",
    floor.headings.every((level, i) => i === 0 || level - floor.headings[i - 1] <= 1),
    floor.headings.join(""),
  );
  report.check("first tab reaches the skip link", /Kalo|Skip/.test(focus.text), `"${focus.text}"`);
  report.check("focus is visible in the accent", focus.outline !== "rgba(0, 0, 0, 0)", focus.outline);

  report.finish();
});
