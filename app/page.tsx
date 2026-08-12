"use client";

import { useState } from "react";

type Copy = {
  headline: string;
  subheadline: string;
  bullets: string[];
  cta: string;
};

export default function Home() {
  const [trade, setTrade] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copy, setCopy] = useState<Copy | null>(null);

  async function generate() {
    const value = trade.trim();
    if (!value) return;
    setLoading(true);
    setError("");
    setCopy(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trade: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setCopy(data.copy);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="wrap">
      <header className="head">
        <h1>Funnel Copy Generator</h1>
        <p>Type a trade and get ready-to-use landing-page copy in seconds.</p>
      </header>

      <div className="bar">
        <input
          value={trade}
          onChange={(e) => setTrade(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && generate()}
          placeholder="e.g. roofer, plumber, landscaper…"
          aria-label="Trade"
        />
        <button onClick={generate} disabled={loading || !trade.trim()}>
          {loading ? "Writing…" : "Generate"}
        </button>
      </div>

      {error && <div className="error">⚠️ {error}</div>}

      {copy && (
        <section className="card">
          <h2>{copy.headline}</h2>
          <p className="sub">{copy.subheadline}</p>
          <ul>
            {copy.bullets?.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          <button className="cta">{copy.cta}</button>
        </section>
      )}

      {!copy && !error && !loading && (
        <p className="hint">Your generated copy will appear here.</p>
      )}
    </main>
  );
}
