/**
 * The hero's CTA against the fold, and the page against narrow screens.
 *
 *   node scripts/checks/viewports.mjs
 *
 * "Done means" names four desktop viewports the CTA has to clear. It clears each
 * by 40px — not by zero, which is what the mockup did and what a collapsing URL
 * bar turns into a clipped button.
 *
 * Mobile is not in that list, because the call bar carries both actions from the
 * top of the page. It is still measured: the CTA must not sit under the bar.
 */
import { open, reporter, withBrowser } from "./harness.mjs";

const DESKTOP = [
  [1920, 1080],
  [1600, 900],
  [1440, 900],
  [1280, 800],
];

const PHONES = [
  [390, 844],
  [360, 780],
];

const CLEARANCE = 40;

await withBrowser(async (browser) => {
  const report = reporter("Viewports — CTA clearance and overflow");

  for (const [width, height] of DESKTOP) {
    const page = await open(browser, "/vajana", { width, height });
    const measured = await page.evaluate(() => {
      const cta = document.querySelector('.vj-hero [class*="Hero_buttons"]');
      const hero = document.querySelector(".vj-hero");
      return {
        clear: Math.round(innerHeight - cta.getBoundingClientRect().bottom),
        heroFitsViewport: Math.round(hero.getBoundingClientRect().height) <= innerHeight,
        overflows: document.documentElement.scrollWidth > innerWidth,
      };
    });
    await page.close();

    report.check(
      `${width}×${height} — CTA clears the fold`,
      measured.clear >= CLEARANCE,
      `${measured.clear}px`,
    );
    report.check(`${width}×${height} — hero is one screen`, measured.heroFitsViewport);
    report.check(`${width}×${height} — no horizontal overflow`, !measured.overflows);
  }

  for (const [width, height] of PHONES) {
    const page = await open(browser, "/vajana", {
      width, height, isMobile: true, hasTouch: true,
    });
    const measured = await page.evaluate(() => {
      const cta = document.querySelector('.vj-hero [class*="Hero_buttons"]');
      const bar = document.querySelector('[class*="CallBar_bar"]');
      const buttons = [...cta.querySelectorAll("a")].map((a) => getComputedStyle(a).display);
      return {
        gapToBar: Math.round(bar.getBoundingClientRect().top - cta.getBoundingClientRect().bottom),
        hiddenInHero: buttons.filter((d) => d === "none").length,
        overflows: document.documentElement.scrollWidth > innerWidth,
      };
    });
    await page.close();

    report.check(
      `${width}×${height} — CTA clears the call bar`,
      measured.gapToBar > 0,
      `${measured.gapToBar}px`,
    );
    // The call bar already carries WhatsApp; a second copy in the hero is noise.
    report.check(
      `${width}×${height} — hero drops its WhatsApp button`,
      measured.hiddenInHero === 1,
      `${measured.hiddenInHero} hidden`,
    );
    report.check(`${width}×${height} — no horizontal overflow`, !measured.overflows);
  }

  report.finish();
});
