import { NextResponse } from "next/server";

// This runs on the SERVER (Vercel), so your API key stays secret —
// it is never sent to the visitor's browser.
export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing GROQ_API_KEY. Add it in your .env.local (local) or Vercel project settings (deployed)." },
      { status: 500 }
    );
  }

  let trade = "roofer";
  try {
    const body = await req.json();
    if (typeof body?.trade === "string" && body.trade.trim()) {
      trade = body.trade.trim().slice(0, 60);
    }
  } catch {
    // ignore bad body, fall back to default
  }

  const systemPrompt =
    "You are an expert direct-response copywriter for home-service contractors. " +
    "You write punchy, benefit-driven landing-page copy that converts visitors into leads. No fluff.";

  const userPrompt =
    `Write landing-page hero copy for a ${trade}.\n` +
    `Respond with ONLY valid JSON in exactly this shape, no markdown:\n` +
    `{"headline": string, "subheadline": string, "bullets": [string, string, string], "cta": string}\n` +
    `- headline: one bold promise (max ~8 words)\n` +
    `- subheadline: one supporting sentence\n` +
    `- bullets: three short benefit phrases\n` +
    `- cta: 3-5 word button text`;

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.8,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!groqRes.ok) {
      const detail = await groqRes.text();
      return NextResponse.json(
        { error: `AI request failed (${groqRes.status}). ${detail.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = await groqRes.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    const copy = JSON.parse(content);

    return NextResponse.json({ trade, copy });
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong generating copy. " + (err as Error).message },
      { status: 500 }
    );
  }
}
