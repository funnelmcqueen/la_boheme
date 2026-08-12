# Handoff

Written at the end of the first build session. Assumes you have the repo and no
memory of that session.

Read `docs/DECISIONS.md` before `docs/BUILD-BRIEF.md`. The brief is stratified —
its §5 and §7 describe a design that §9 onward replaced — and DECISIONS records
every ruling that overrides it.

---

## Where it stands

All six slices are built. The site runs on Next 15.5.7, `npm test` is 52 green,
`npm run check` is five browser checks green, `npm run typecheck` and `npm run
build` are clean, and all four routes prerender static.
It is pushed to `funnelmcqueen/la_boheme` on `main`. **It is not deployed
anywhere** — that push is the whole of the deployment so far.

| slice | what it is | state |
|---|---|---|
| 1 | Tokens, the fixed ground layer, the depth engine | done |
| 2 | Type via `next/font`, header, status bar, call bar, buttons, section rhythm | done |
| 3 | The emblem: `mandala_mech` ported, `<symbol>` sprite, four sizes | done |
| 4 | The seascape: one rAF, bounded basin, three species, the emblem field | done |
| 5 | The hero: emblem, headline, photograph, the entrance | done |
| 6 | Sections in page order, the carte from `menu.ts`, schema and metadata | done |

Measured on the finished page at 1440×900: the descent runs 0 → 54 m over one
scroll, all three separators measure 50/50 between visible edges, the page is
12,883px and 2,041 DOM nodes, and six emblems render off one sprite.

## Nothing is in flight

There is no half-finished work. The seascape thread that ran across slices 4 and 5
is closed — the numbers below are the record of it, not a queue.

## The seascape thread, and how it closed

This is the part most likely to be misremembered, so here it is in full.

At the end of slice 5 the seascape was re-measured in the real hero for the first
time, and came back:

    804 clamp firings, 116 wordmark overlaps, 111 dome overlaps over 30s

All three are resolved. What each turned out to be:

**The 804 was a measurement error.** The probe printed `sea.clamps()`, a cumulative
counter since mount, instead of a delta over the sampling window. The true
steady-state figure was 799 in thirty seconds — the same order, but arrived at
honestly. If you write a new probe, subtract a baseline.

**Every one of the 799 was an octopus.** Broken down by species: fish 0, prawn 0,
mote 0. Closest approach at the time — fish 2.16, prawn 2.72, mote 1.68, octopus
0.968, where 1.0 is the exclusion surface.

**The cause was the field's onset being expressed in ellipse units.** `um < 3.4`
scales with the shape, so scoping the keep-out from the whole lockup to the dome
alone shrank the *warning distance* with it: vertical onset fell from ~833px to
~639px, and the octopus — the one creature that cannot turn off its axis — arrived
with 200px less room. Reach is now `FIELD_REACH × column width` in
`components/sea/swim.ts`, set to **0.78** to reproduce the original distance. A
first attempt at 0.34 changed nothing (920 firings); the replacement has to match
what it replaced.

**What that left was structural.** Sixty wordmark overlaps survived, all octopus:
"only rise" and "never touch the mark" cannot both hold for a creature whose path
crosses a mark spanning most of the column, and the wordmark sits directly under
the dome, in its lane. Octopuses now have the water *below* the mark and re-enter
at the bottom on reaching the underside of the lockup, fading over the last stretch.

Final, over thirty seconds in the real hero:

    wordmark overlaps 0 · dome overlaps 0 · clamp firings 0
    closest approach — mote 1.72, fish 2.44, prawn 2.81, octopus 1.77

No separate exclusion around the label was needed.

## Three bugs found in the mockup

All three exist in `vajana-mockup-final.html` and were carried in before being
caught. Each is fixed here and written up in DECISIONS.

**`shortestArc` is wrong beyond ±540°.** `((to - from + 540) % 360) - 180` assumes a
non-negative remainder; JavaScript's `%` keeps the sign of the dividend. A prawn's
drawn angle accumulates — measured between −1035° and +448° over half a minute — so
the gap does exceed 540, and when it does the creature takes the long way round.
Which is the spinning the chase exists to prevent.
→ `components/sea/swim.ts`, `shortestArc` and `normaliseAngle`.

**Octopuses pin at the ceiling.** "Only rise" forces `vy` negative *after* the soft
wall runs, so the ceiling can never turn one back. Measured: both parked against the
backstop at y = −28 within four seconds and stayed there.
→ `components/sea/swim.ts`, the re-entry block at the end of `step`.

**Octopuses stall beneath the mark.** The field pushes down, "only rise" flips it
back up, and capping horizontal speed against `|vy|` made it unrecoverable — as the
conflict crushed `vy` the cap collapsed with it and closed the only way out.
Measured `vy ≈ −1.4` against a cruising speed of 25.9.
→ `components/sea/swim.ts`, the octopus branch: cap against cruising speed, and both
species relax their axis constraint near the mark.

The general lesson is in DECISIONS under *Axis constraints need a stated exception*.

## Blocked, and on whom

**The chef's portrait — on the client.** §11's crop implies a screen capture at
least 1380px wide; the delivered photography is all camera originals at 2160×2700
and up, and none can take it. The owner said the source is an Instagram capture on
his side and a camera original may exist with the client. The slot renders at the
crop's own proportion so the section will not need re-laying out, and the frame runs
**ungraded** when it arrives.

**A night table set for a celebration — on the client.** Mbrëmje currently runs a
dusk-graded daylight frame darkened in CSS. That is a placeholder, not a grade.

**A cellar photograph — on the client.** Verërat runs on type and one portrait.

**Gabriel's quote — on the owner.** It is his own words from Instagram and ships as
a direct quote. Needs sign-off before it goes live.

**Two wine houses — on the sommelier.** Tassinaia → Castello del Terriccio and
Blangé → Ceretto are inferred; the menu lists only the wine names.

**The domain.** `SITE` in `lib/schema.tsx` is `https://vajana.al`. Every canonical,
hreflang and schema `@id` derives from it. Set it before anything goes public.

## Open decisions

**The depth bands have drifted from §9's table.** Rendering the full carte inline is
mandated and its length is the argument, but it pushes the lower sections deeper
than the table describes — Verërat now sits at 39–46.1 m against 32–38, Mbrëmje at
46.1–49.4 against 38–46. The descent itself is intact. But photographs were assigned
by measured luminance to bands, so those two sit in water several metres darker than
their frames were chosen for. Either the table describes the mockup's shorter menu
and this is fine, or the page order wants rebalancing. Not touched.

## What I would do next, in this order

1. **Set `SITE`** to the real domain and deploy to Vercel. Import the repo at
   vercel.com/new — it needs no configuration and no environment variables. Nothing
   downstream can be verified until the site has a URL.
2. **Run Lighthouse on mobile** against the deployed URL and close whatever it
   finds. The target is ≥ 90. The sprite and `next/image` were the two structural
   moves toward it; it has never actually been measured, and a claim about a score
   nobody has run is worthless.
3. **Rule on the depth bands** above, and rebalance the page order if that is the
   call. Do it before anyone photographs anything new, since it changes which band
   each frame has to match.
4. **Land the three photographs** as they arrive. The chef is ungraded and never
   composited onto a new background; the other two go through
   `scripts/grade-images.ts`.
5. **Delete `docs/` from the public repo, or make the repo private.** It carries
   candid working notes — pending sign-off on a direct quote, GBP fixes, a trademark
   filing, commentary on the mockup — and the repo is public and the client can find
   it.
6. **The English copy needs a final pass.** It is a faithful translation, not
   English written first.

## Running the checks

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # 52 tests
npm run typecheck
npm run build        # stop the dev server first — they share .next
```

`npx vite-node scripts/grade-images.ts` regrades the photography into `public/img`
from the sources listed in `content/images.ts`.

### What the tests assert

**`components/depth/depth.test.ts` — 14.** Ramp endpoints, clamping outside the
table, linear interpolation, that the ground darkens monotonically, and that the
warm accents genuinely invert rather than dim. Plus one that reads `styles/tokens.css`
and fails if its `:root` values drift from `depthVars(0)` — that duplication is
deliberate, so first paint is already at the surface with nothing to hydrate, and
this is what stops it rotting.

**`components/emblem/geometry.test.ts` — 9.** That the crown stays inside the
dome's cut, that each variant is its own geometry rather than a subset, the locked
ring periods, and that the vajana clears the inner lip — recomputing §10's own
arithmetic, because the lip, the hollow and the fish all move it.

**`components/emblem/Emblem.test.ts` — 3.** The `vector-effect` regression test. It
renders the small mark at 92px in headless Chrome and measures *painted weight*, not
the presence of the attribute — because the failure it guards against is precisely
one where the attribute is present and has no effect, since CSS cannot select into a
`<use>` shadow tree. The discriminator is the fraction of pixels past half intensity:
**28.4% with the effect, 0.0% without.** The middle test asserts that zero. Keep it:
it is the only thing proving the other two still measure something.

**`components/sea/swim.test.ts` — 16.** Sixty simulated seconds of physics with no
browser: that nothing leaves the basin, that nothing reaches the mark, that a fish
mirrors and never rotates through 180°, that an octopus only ever rises, that only a
prawn chases a full heading, and that every drawn angle changes no faster than its
own chase rate — which is what "chases, never snaps" means as an assertion. Also a
sweep of `shortestArc` over every angle pair, which is what caught the >540° bug.

**`content/menu.test.ts` — 10.** That no price string exists anywhere outside
`content/menu.ts`, by walking every `.ts`/`.tsx`/`.css` file for the shapes a price
takes. Includes a guard-the-guard case, so it cannot pass by finding no files.

### The browser checks

`npm test` cannot cover everything: two of these need a running server and thirty to
sixty seconds of live motion, because both failures they catch are invisible in a
single frame. They live in `scripts/checks/` and each exits non-zero on failure.

```bash
npm run dev                 # one terminal
npm run check               # all five
npm run check:seascape      # or one at a time
```

`CHROME_PATH` overrides Chrome resolution; `VAJANA_URL` or `--url=` overrides the
base URL, which defaults to port 3000.

- **`page.mjs`** — the descent runs surface to deep and bottoms out at 54 m, both
  interior separators measure 50/50 between visible edges, one JSON-LD graph, alt
  text everywhere, no page errors, emblems off the sprite. Reports each section's
  depth band against §9 without gating on it.
- **`viewports.mjs`** — the CTA clears the fold by 40px at all four required
  desktop sizes and the hero is one screen at each; on phones it clears the call
  bar and drops its duplicate WhatsApp button.
- **`seo.mjs`** — both locales: `lang`, one `h1` carrying *Vajana by La Bohème*,
  canonical, hreflang, a schema graph whose `parentOrganization` and `hasMenu`
  resolve, offers carrying their unit, and that "Vajana" never appears alone. Then
  the floor: 360px, heading order, skip link, visible focus.
- **`entrance.mjs`** — runs once and lands under 2.5s; skipped on a second load, a
  hash deep link, and reduced motion.
- **`seascape.mjs`** — population across six ten-second windows, closest approach
  per species, clamp firings, and whether anything settles on the wordmark. Checks
  the keep-out is where the dome is before reading anything else.

`scripts/checks/README.md` lists the five mistakes that produced wrong numbers
during the build — the cumulative clamp counter, measuring against a placeholder,
polling the entrance after `load`, `scroll-behavior: smooth`, and running for
thirty seconds instead of sixty. Read it before writing anything new alongside them.

One thing the checks deliberately allow: a creature briefly crossing the wordmark.
The keep-out is the dome, not the lockup, because type on a solid baseline tolerates
a fish passing behind it and an ellipse over the whole mark left the water no middle.
The check fails only if something *settles* there. Currently ~5 crossings in ~2,500
creature-samples, longest 1.0s, all octopus.
