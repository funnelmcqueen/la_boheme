"use client";

import { useState } from "react";

type Copy = {
  headline: string;
  subheadline: string;
  bullets: string[];
  cta: string;
};

// Simple template banks — copy is built right here in the browser.
// No API, no key, no server. Works instantly wherever it's hosted.
const HEADLINES = [
  (t: string) => `Your Trusted Local ${t}`,
  (t: string) => `${t} Services You Can Count On`,
  (t: string) => `Expert ${t} Work, Done Right`,
  (t: string) => `Reliable ${t} — When You Need It Most`,
];

const SUBHEADS = [
  (t: string) =>
    `Fast, dependable ${t.toLowerCase()} services with upfront pricing and workmanship you can trust.`,
  (t: string) =>
    `Local ${t.toLowerCase()} pros who show up on time, do it right, and stand behind every job.`,
  (t: string) =>
    `Quality ${t.toLowerCase()} solutions for your home — no surprises, no hassle, just great results.`,
];

const BULLETS = [
  "Licensed & fully insured",
  "Free, no-obligation quotes",
  "Same-day service available",
  "Upfront, honest pricing",
  "100% satisfaction guaranteed",
  "5-star rated by local homeowners",
  "Locally owned & operated",
];

const CTAS = [
  "Get Your Free Quote",
  "Book Your Free Estimate",
  "Request a Callback",
  "Schedule Service Today",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function titleCase(s: string): string {
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function generateCopy(rawTrade: string): Copy {
  const t = titleCase(rawTrade.trim());
  // three distinct bullets
  const bullets: string[] = [];
  while (bullets.length < 3) {
    const b = pick(BULLETS);
    if (!bullets.includes(b)) bullets.push(b);
  }
  return {
    headline: pick(HEADLINES)(t),
    subheadline: pick(SUBHEADS)(t),
    bullets,
    cta: pick(CTAS),
  };
}

export default function Home() {
  const [trade, setTrade] = useState("");
  const [copy, setCopy] = useState<Copy | null>(null);

  function generate() {
    const value = trade.trim();
    if (!value) return;
    setCopy(generateCopy(value));
  }

  return (
    <main className="wrap">
      <header className="head">
        <h1>Funnel Copy Generator</h1>
        <p>Type a trade and get ready-to-use landing-page copy instantly.</p>
      </header>

      <div className="bar">
        <input
          value={trade}
          onChange={(e) => setTrade(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder="e.g. roofer, plumber, landscaper…"
          aria-label="Trade"
        />
        <button onClick={generate} disabled={!trade.trim()}>
          Generate
        </button>
      </div>

      {copy ? (
        <section className="card">
          <h2>{copy.headline}</h2>
          <p className="sub">{copy.subheadline}</p>
          <ul>
            {copy.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <button className="cta">{copy.cta}</button>
          <p className="regen">↻ Click Generate again for a new version</p>
        </section>
      ) : (
        <p className="hint">Your generated copy will appear here.</p>
      )}
    </main>
  );
}
