# Browser checks

The acceptance checks that cannot live in `npm test`. They need a running server,
and two of them need thirty to sixty seconds of live motion, because both failures
they exist to catch are invisible in a single frame: the water empties over about a
minute, and a creature crosses the mark on a pass a screenshot misses.

Every check exits non-zero on failure, so they can be wired into CI unchanged.

```bash
npm run dev                 # in one terminal
npm run check               # all five, in the order below
npm run check:seascape      # or one at a time
```

Chrome is resolved from the usual install paths; `CHROME_PATH` overrides it. The
base URL defaults to `http://localhost:3000`; `VAJANA_URL` or `--url=` overrides:

```bash
VAJANA_URL=http://localhost:3400 npm run check
node scripts/checks/seascape.mjs --seconds=120
```

| check | what it asserts |
|---|---|
| `page.mjs` | The descent runs `rgb(24,64,84)` → `rgb(3,10,16)` and bottoms out at 54 m. Both interior separators measure 50/50 between visible edges. One JSON-LD graph, every image has alt text, no page errors, emblems render off the sprite. Reports the depth band of each section against BUILD-BRIEF §9 without gating on it. |
| `viewports.mjs` | The CTA clears the fold by 40px at 1920×1080, 1600×900, 1440×900 and 1280×800, and the hero is exactly one screen at each. On phones the CTA clears the call bar and the hero drops its duplicate WhatsApp button. No horizontal overflow anywhere. |
| `seo.mjs` | Both locales: `lang`, one `h1` carrying *Vajana by La Bohème*, canonical, hreflang sq/en/x-default, and a schema graph whose `parentOrganization` and `hasMenu` actually resolve. That "Vajana" never appears alone in a title, meta field, alt text or schema name. That every offer carries its unit. Then the floor: 360px, heading order, the skip link, visible focus. |
| `entrance.mjs` | Runs once on a fresh session and lands under 2.5s; skipped on a second load, on a hash deep link, and under `prefers-reduced-motion`. |
| `seascape.mjs` | Population holds across six ten-second windows. Nothing reaches the mark. The hard clamp never fires. Nothing settles on the wordmark. Checks the keep-out is where the dome is *before* reading anything else. |

## Things that produced wrong numbers during the build

Each of these cost real time. They are guarded in the scripts, but they will bite
anything new written alongside them.

**`sea.clamps()` is cumulative since mount.** Read it as a delta against a baseline
or you report the settling period as steady state. That mistake turned 0 firings
into a reported "804".

**Measure in the real hero, never a placeholder.** The seascape checks came back
completely clean against a placeholder layout, then failed the moment the emblem
and the water sat in their true relationship. A placeholder will tell you it is
fine.

**Poll the entrance from document creation.** `evaluateOnNewDocument`, not after
`load`. The whole thing lasts ~2.3s and on a cold dev server `load` fires after it
has finished — a probe that starts there reports it never ran, repeatably and
convincingly.

**`scroll-behavior: smooth` is on `html`.** A plain `scrollTo` is still animating a
second later and reports 53.8 m instead of 54.0. Use `behavior: "instant"` and then
poll until the value stops changing.

**Sixty seconds, not thirty.** The wordmark crossing below appears at 60s and not
at 30s. Short runs on this page are a way of not finding things.

## What "nothing settles on the wordmark" means

The keep-out is the **dome**, not the whole lockup. That is deliberate: type on a
solid baseline tolerates a creature passing behind it far better than the rosette
does, and an ellipse over the whole mark left the water column with no middle at
all. So a brief crossing is the accepted behaviour and the check does not fail on
it — it fails if something *settles* there, defined as more than two seconds
continuous.

Currently measured: 4 crossings in 2,431 creature-samples, longest 1.0s, all
octopus. See `docs/DECISIONS.md`.
