# Handoff

Written at the end of the second session. Assumes you have the repo and no memory
of either.

Read `docs/DECISIONS.md` before `docs/BUILD-BRIEF.md`. Both spec documents are now
stratified — BUILD-BRIEF's §5 and §7 describe a design its own §9 replaced, and
several rulings in §6 and §11 have been overruled since. DECISIONS records every
override and is the file that wins.

---

## Where it stands

The site is built, verified and merged to `main`. It runs on Next 15.5.7. `npm
test` is 52 green, `npm run check` is five browser checks green, `npm run
typecheck` and `npm run build` are clean, and all four routes plus the icon
prerender static.

**It is deployed, but not published.** The Vercel project `funnelmcqueen/vajana`
has a dozen deployments, several of them Production, and this directory is linked
to it. They are not public: Vercel deployment protection redirects them to a login,
and they carry `X-Robots-Tag: noindex`, so nothing is readable or indexable without
the account. There is no custom domain attached.

So the site can be shown to someone with access and cannot be found by anyone else
— which is the right state for it, because of the first item under *Before it goes
live*. That one is not optional.

Measured on the finished page at 1440×900: the descent runs 0 → 54 m over one
scroll, both interior separators measure 50/50 between visible edges, the page is
9,838px and 1,938 DOM nodes, and six emblems render off one sprite.

## What changed in the second session

The first session built it. The second one verified it, and the verification found
that three of the things it was most proud of were not true.

**The shoal was never drawn.** Eleven creatures, sixty seconds of physics tests, a
tuned repulsion field, and a whole thread in DECISIONS about clamp firings — all of
it invisible. The stroke rule matched a class the generator never emits, so every
creature computed to `stroke: none`. Every check passed, because they all measured
where the creatures *were* and none of them touched a pixel.

**The entrance was never visible either.** The scrim is full-bleed at z-index 150
and the emblem it exists to reveal sat at z-index 2. It played a flat blue
rectangle. It also fired once per session, so the first load consumed it and every
reload after that skipped it — which is why nobody caught it.

**The last separator measured 50 above and 147 below.** The rule that was supposed
to fix it had been correct and unreachable since it was written: a CSS Module
compiles unlayered, and unlayered beats every `@layer`. `page.mjs` reported it as
passing because it measured to the section box, and padding lives inside the box.

Each is fixed, and in each case the check that should have caught it is fixed
alongside — that is the pattern to keep. The full write-ups are in DECISIONS under
*Slice 7*.

Also landed: the seascape is gated by width, the fonts are vendored, Gabriel's
portrait is in, two sections were removed, the section rhythm was tightened twice,
the footer was rebuilt around the emblem, and the ground carries light.

## Nothing is in flight

There is no half-finished work and no uncommitted state. `main` is at `1fd0cfb`.

## Before it goes live

**1. `SITE` is a placeholder.** `lib/schema.tsx:17` reads `https://vajana.al`.
Every canonical, every hreflang pair and every schema `@id` derives from it.
Deployed anywhere else, each page tells Google the real version lives at a domain
that may serve nothing — on a site built to capture search. One line, and nothing
downstream can be verified until it is right.

**2. Gabriel's quote has no sign-off.** It ships as a direct quote from a named
person. He co-authored the Instagram post his portrait came from, so he is party to
the venue's marketing, but that is not approval to publish his words.

**3. The Instagram handle disagrees with itself.** The portrait came from a post by
`vajana_beach`; `content/venues/vajana.ts` gives the venue's Instagram as
`vajana.vlore`. That value is both the footer link and the schema's `sameAs`.

**4. `docs/` is candid working notes in a public repo** — pending sign-off on a
quote, GBP fixes, a trademark filing, commentary on the mockup. Delete it from the
public repo or make the repo private. The client can find it.

**5. Lighthouse has only ever been run against localhost**, on a machine that was
competing for the CPU — never against a deployment. Mobile measured 69 → 82 across the performance pass. 82 is
the accepted number and 90 was explicitly ruled out — see DECISIONS — but it should
be re-measured once there is a real URL.

## Blocked on the client

**A cellar photograph.** Verërat runs on type and one bottle. It works; a real
image is better. It is the last genuinely missing photograph — the chef arrived,
and the night-table frame stopped mattering when Mbrëmje was removed.

**Two wine houses.** Tassinaia → Castello del Terriccio and Blangé → Ceretto are
inferred; the menu lists only the wine names. Confirm with the sommelier.

## Open decisions

**BUILD-BRIEF §8's second conversion is unreachable.** Mbrëmje was the only entry
point for the "evening" intent, so `Intent` is now `"table"` alone and
`cta.evening` / `prefill.evening` are gone. Either that is fine or the evening CTA
needs a home somewhere else.

**The depth bands have drifted a long way from §9's table.** Measured at 1440×900:
hero 0–5.4, atmosfera 6.3–7.5, kuzhina 12.1–16.7, signatures 16.7–19.6, menuja
19.6–39, peshku 39–48.4, verërat 48.4–51.1, tavolinë 51.1–54. The descent itself is
intact, but photographs were assigned to bands by measured luminance, and the deep
is now the cellar rather than the story. The wine photograph sits in water several
metres darker than it was chosen for.

**The English copy is a faithful translation, not English written first.**

**Small and pre-existing:** `cta.call` and `menu.eyebrow` are unreferenced copy; the
header's four `#anchor` links point at nothing on `/vajana/la-boheme`.

## Branches

    main                          the site
    design-pass                   identical to main, merged, safe to delete
    rescue/funnel-copy-generator  three commits of an unrelated project that were
                                  force-pushed over main by mistake and rescued
                                  before main was restored. Rehome it, then delete.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # 52 tests
npm run typecheck
npm run build        # stop the dev server first — they share .next
```

`npx vite-node scripts/grade-images.ts` regrades the photography into `public/img`
from the sources in `content/images.ts`. The chef is `ungraded: true` and the script
must leave him alone.

### What the tests assert

**`components/depth/depth.test.ts` — 14.** Ramp endpoints, clamping, interpolation,
that the ground darkens monotonically, and that the warm accents genuinely invert
rather than dim. Plus one that reads `styles/tokens.css` and fails if its `:root`
values drift from `depthVars(0)` — that duplication is deliberate, so first paint is
already at the surface, and this is what stops it rotting.

**`components/emblem/geometry.test.ts` — 9.** That the crown stays inside the dome's
cut, that each variant is its own geometry, the locked ring periods, and that the
vajana clears the inner lip.

**`components/emblem/Emblem.test.ts` — 3.** The `vector-effect` regression test. It
measures *painted weight* at 92px rather than the presence of the attribute, because
the failure it guards against is one where the attribute is present and has no
effect. 28.4% of pixels past half intensity with it, 0.0% without. **Read this one
before writing any new check** — the seascape had the same bug for the whole life of
the project precisely because nothing did this for the creatures.

**`components/sea/swim.test.ts` — 16.** Sixty simulated seconds of physics with no
browser. Note what that means: it cannot see whether anything paints.

**`content/menu.test.ts` — 10.** That no price string exists outside
`content/menu.ts`, by walking every `.ts`/`.tsx`/`.css` file. Includes a
guard-the-guard case.

### The browser checks

```bash
npm run dev                 # one terminal
npm run check               # all five
npm run check:seascape      # or one at a time
```

`CHROME_PATH` overrides Chrome resolution; `VAJANA_URL` or `--url=` overrides the
base URL.

- **`page.mjs`** — the descent surface to deep and 54 m, both interior separators
  50/50 measured to the first *painted* element and clamped to clipping ancestors,
  one JSON-LD graph, alt text everywhere, no page errors of any kind, emblems off
  the sprite. Reports each section's depth band without gating on it.
- **`viewports.mjs`** — the CTA clears the fold by 40px at four desktop sizes and
  the call bar on phones; the hero is one screen at each.
- **`seo.mjs`** — both locales: `lang`, one `h1` carrying *Vajana by La Bohème*,
  canonical, hreflang, a schema graph whose `parentOrganization` and `hasMenu`
  resolve, offers carrying their unit, and that "Vajana" never appears alone. Then
  the floor: 360px, heading order, skip link, visible focus.
- **`entrance.mjs`** — times the whole entrance, mark appearing to mark at rest,
  under 5.5s; asserts it runs *again* on a reload, and is skipped for reduced
  motion and hash deep links.
- **`seascape.mjs`** — that every creature resolves a real stroke and carries
  `non-scaling-stroke`, then population across ten-second windows, closest approach
  per species, clamp firings, and whether anything settles on the wordmark.

`scripts/checks/README.md` lists the mistakes that produced wrong numbers during the
first build. DECISIONS' *Slice 7* lists the ones from the second, which are worse,
because they are all the same mistake: **a check that passes because it is not
looking at anything.** Four separate instances — an error listener attached to a
closed page, a separator measured to a box instead of an edge, physics tested with
no DOM, and an entrance timed over its pause rather than itself.

The rule that came out of it, and the one worth keeping: **an A/B is not valid until
you have proved the two arms actually differ.** Read back the property you think you
changed, or check that the control still reproduces the symptom. A control that
cannot fail is not a control.

## The local gotcha, and how to recognise it

`next build` and `next dev` share `.next`, so building while a dev server is up —
even one on another port, even one you forgot about — overwrites its chunks. It bit
three times in one session.

What it looks like: 404s or 400s for `/_next/static/css/*.css` and
`app-pages-internals.js`, asset URLs carrying a `?v=<timestamp>` query, a served
document suddenly 100KB larger, and `document.getAnimations()` returning 0 on a page
whose animations obviously exist. Check for a stray `next dev` before believing any
of it is a code fault.
