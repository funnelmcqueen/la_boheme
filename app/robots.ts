import type { MetadataRoute } from "next";

/**
 * Keeps the site out of the index until it is being served from its own domain.
 *
 * The deployment at `vajana.vercel.app` is public — no login, no `X-Robots-Tag` —
 * and every page on it carries `<link rel="canonical" href="https://vajana.al/…">`,
 * because that is what `SITE` in lib/schema.tsx says. So a crawler reaching the
 * Vercel URL is told the real version of each page lives somewhere that may not
 * serve anything yet. That is worse than not being indexed at all: it spends the
 * site's first impressions on a canonical pointing into the void.
 *
 * Until the domain is settled, everything is disallowed.
 *
 * **It fails safe on purpose.** The default is blocked, and the only way to open
 * it is to set `VAJANA_LAUNCHED=1` in the environment — a deliberate act by
 * someone who knows the domain resolves. Forgetting the variable costs a day of
 * indexing; forgetting to *add* a block would have cost the canonical.
 *
 * To launch: point the domain at the deployment, set `SITE` to it, set
 * `VAJANA_LAUNCHED=1` in the Vercel project's environment, redeploy. Then check
 * `/robots.txt` actually says `Allow` before telling anyone it is live.
 */
const LAUNCHED = process.env.VAJANA_LAUNCHED === "1";

export default function robots(): MetadataRoute.Robots {
  if (!LAUNCHED) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
  };
}
