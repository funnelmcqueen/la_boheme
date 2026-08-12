/**
 * Shared plumbing for the browser checks.
 *
 * These are the acceptance checks that cannot live in `npm test`: they need a
 * running server and, in two cases, thirty to sixty seconds of live motion. Both
 * of the failures they exist to catch are invisible in a single frame — the water
 * empties over a minute, and a creature crosses the mark on a pass a screenshot
 * misses.
 *
 * Every check exits non-zero on failure, so they can be wired into CI unchanged.
 */
import { existsSync } from "node:fs";
import puppeteer from "puppeteer-core";

/** Chrome is resolved, not hardcoded: the original probes pinned one absolute path
    and were useless on any other machine. CHROME_PATH overrides. */
const CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].filter(Boolean);

export function chromePath() {
  const found = CANDIDATES.find((path) => existsSync(path));
  if (!found) {
    throw new Error(
      `No Chrome found. Set CHROME_PATH. Looked in:\n  ${CANDIDATES.join("\n  ")}`,
    );
  }
  return found;
}

/** Defaults to `npm run dev`'s port. VAJANA_URL or --url= override. */
export function baseUrl() {
  const flag = process.argv.find((a) => a.startsWith("--url="));
  return (flag?.slice(6) ?? process.env.VAJANA_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export async function withBrowser(fn) {
  const browser = await puppeteer.launch({ executablePath: chromePath(), headless: true });
  try {
    return await fn(browser);
  } finally {
    await browser.close();
  }
}

/**
 * Opens a page and waits for the fonts and the entrance to settle. Anything that
 * samples before this sees a page mid-entrance and reports nonsense.
 */
export async function open(browser, path = "/vajana", viewport = { width: 1440, height: 900 }) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  const url = `${baseUrl()}${path}`;
  try {
    await page.goto(url, { waitUntil: "networkidle0", timeout: 120_000 });
  } catch (error) {
    throw new Error(`Could not reach ${url} — is the dev server running?\n${error.message}`);
  }
  await page.evaluate(() => document.fonts.ready);
  await wait(3200);
  return page;
}

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Minimal reporter. Collects results so one failure does not hide the rest. */
export function reporter(title) {
  const rows = [];
  let failed = 0;

  return {
    check(label, pass, detail) {
      rows.push({ label, pass, detail });
      if (!pass) failed++;
    },
    note(label, detail) {
      rows.push({ label, pass: null, detail });
    },
    finish() {
      console.log(`\n${title}\n${"─".repeat(title.length)}`);
      for (const { label, pass, detail } of rows) {
        const mark = pass === null ? "·" : pass ? "✓" : "✗";
        console.log(`${mark} ${label}${detail === undefined ? "" : `  ${detail}`}`);
      }
      if (failed) {
        console.log(`\n${failed} check${failed === 1 ? "" : "s"} failed.`);
        process.exitCode = 1;
      } else {
        console.log("\nAll checks passed.");
      }
    },
  };
}
