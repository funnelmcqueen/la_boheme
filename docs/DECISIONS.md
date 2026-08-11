# Decisions

Rulings that override the two spec documents. Read this before BUILD-BRIEF.md.

## Struck from BUILD-BRIEF.md

- **§5 Design tokens** — dead. The `--ink:#12100E` near-black palette, the
  dish-sampled hero (`--lamp:#B57652` etc.) and the lithograph ink palette
  (`--ink-verm` …) all belong to the design §9 replaced. None of them survive in
  the approved mockup. Type (Bodoni Moda / Archivo) is still live — it is
  restated in CLAUDE-CODE-PROMPT.md.
- **§7 Page order** — dead. The live order is the one in CLAUDE-CODE-PROMPT.md:
  Hero → Atmosfera → *divider* → Kuzhina → house signatures → Menuja → Peshku →
  Verërat → Mbrëmje → La Bohème → *divider* → footer.

§9 onward is authoritative.

## Corrections to the mockup

1. **The hero joins the ramp.** `.hero,.hbar{--lamp:#B57652;--acc:#A0421F;
   --shell:#9A8474}` in the mockup is leftover from the dead palette and shadowed
   the engine's `:root` values inside the hero — the one screen where the ramp's
   0m colours are meant to be visible. Deleted. A filled button's label is
   `--btn-label: #10303F` (5.08:1 on the surface lamp colour), not the logo brown
   (3.58:1, fails AA at 11px).
2. **`footer` is in the separator collapse rules.** The last separator is followed
   by a footer, not a section, so `.sep + section{padding-top:0}` never matched
   and the final gap measured 50 above / 120 below.
3. **The hero keeps 40px clear below its CTA.** Driving it to 0 to make the hero
   divider measure 50/50 put the button's bottom edge exactly on the fold at every
   desktop size. The hero divider is kept and its asymmetry (90 above / 50 below)
   is accepted. The 50/50 rule stands for the two interior separators.
4. **`--logo` and `--logo-true` exist as named tokens.** The mockup only had
   `--brand`, which is now an alias of `--logo-true`.
5. **Small marks use three rings**, per CLAUDE-CODE-PROMPT and the mockup, not the
   four in §10.
6. **Every price renders through `formatPrice`**, one format, no `lekë` in the
   signature lines. The catch renders all 12 items from `menu.ts`; the mockup
   showed 8.
7. **The rosettes ship as a `<symbol>` sprite** with `<use>` per ring. Ten
   identical 32KB copies of the 3-ring mark are ~300KB of the mockup's markup.
   `vector-effect` must be a presentation **attribute** inside the symbol — CSS
   cannot select into a `<use>` shadow tree, so the current
   `.rot path{vector-effect:non-scaling-stroke}` fix would silently stop working.
   A test must fail if that regresses. *(Slice 3.)*

8. **The descent runs under `prefers-reduced-motion`**, overriding BUILD-BRIEF §9's
   "holds at the surface values". A colour change tied to scroll position is not
   motion, and depth is this page's meaning. What stops is the seascape, the ring
   rotation, the entrance and the wave. The one requirement: no transition or
   easing on anything the depth engine writes, or the stepped read becomes an
   animated one.
9. **The header carries nav only**, no booking button. `VAJANA-COPY.md` §11 lists
   one; the mockup does not have one and the copy doc is stale there. The mobile
   call bar carries the action.
10. **Anything whose height another component depends on publishes it** rather
    than being guessed at — `usePublishedHeight` / `<PublishHeight>`. Every
    measurement bug on this project has been one component assuming another's
    size. Stylesheets still declare a default for the no-JS case; it must be the
    measured value, not a guess.
11. **The emblem's short-viewport rule fires at `max-height: 860px`**, not the
    mockup's 780px, which misses 1280×800 — one of the four viewports the CTA has
    to clear — by twenty pixels. Survivable when the CTA sat on the fold; not with
    40px of clearance, where 800-high screens came up 24px short.

`VAJANA-COPY.md` is being replaced by the owner — do not edit it.

## Measured against the spec, not changed

Locked values that do not quite hold. Reported rather than fixed.

- **The fish is 24% of the dome, not 26%.** CLAUDE-CODE-PROMPT says 26%; the
  mockup and BUILD-BRIEF §10's own arithmetic both use 24%, and the arithmetic
  only works at 24% — the corner lands at 0.181 against a clear radius of 0.194,
  exactly as §10 states. The small mark separately uses 26% at `bottom:7%`.
- **The small mark's fish sits 0.003 of the viewBox inside the inner lip's
  scalloped excursion** — about a third of a pixel at 112px, so invisible, but it
  is not the clean clearance the masthead has. It clears the lip *circle*, which
  is the check CLAUDE-CODE-PROMPT actually states (`< 0.21`). Pinned by a test so
  it cannot quietly get worse.
- **64s and 32s are harmonic.** In the seven-ring table those two realign every
  64 seconds, and both turn forward. Every other pair is clean. The table is
  locked, so it stands; the test allows this one pair by name and would fail on a
  new one.

## Standing rules

- Prefix every component class. CSS Modules make collisions structurally
  impossible for components; anything cross-cutting stays global and carries
  `vj-`.
- Never name a variable `t` inside the animation loop.
- The depth engine never re-renders.
- No price string anywhere except `content/menu.ts`.

## Traps hit in this build

Add to the list in CLAUDE-CODE-PROMPT.

**`next/font` does not quote the `fallback` array.** It joins the entries verbatim
into the CSS custom property, so `fallback: ["Didot", "Bodoni 72", …]` produces
`… Didot, Bodoni 72, Georgia, serif`. `72` is not a valid CSS identifier, which
makes the whole `font-family` list invalid *at computed-value time* — and
`font-family` is inherited, so the declaration does not fall through to the next
name in the list, it falls back to the **inherited** value. Every heading on the
site rendered in Archivo. Nothing threw, no CSS was reported invalid, and
`font-size` in the same rule kept working, so it read as "my h1 rule isn't
applying" when the rule was applying perfectly. Any multi-word family containing a
digit needs its own quotes inside the array: `'"Bodoni 72"'`.

**CSS Modules compile unlayered, and unlayered CSS beats every `@layer`** no matter
the specificity. A module can therefore silently defeat the `:has()` separator
collapse rules exactly the way the inline `padding` did in the mockup. Component
modules must not set section padding.

## Local gotcha

`next build` and `next dev` share `.next`, so building while the dev server is up
overwrites its chunks and the dev server starts throwing `MODULE_NOT_FOUND` for
files it had a second ago — a failure that looks exactly like a code bug and is
not one. Stop the dev server before building. A separate `distDir` for builds was
tried and is worse: both dirs emit generated route types, tsconfig picks up both,
and the two `LayoutRoutes` unions collide.

## Blocked on material we do not have

Three photographs are missing. Each ships as a slot that is visibly unfinished
rather than a stand-in that would read as a decision — a substitute photograph in
the right shape is the hardest kind of placeholder to notice later.

**The chef's portrait.** BUILD-BRIEF §11 gives the crop as `150, 372, 1230, 1722`
and notes that anything above y=372 includes "the screenshot's own chrome". That
makes the source a screen capture at least 1380px wide; the delivered set is all
camera originals at 2160×2700 and above, and no frame in it can take that crop. The
owner has said the source is an Instagram capture on his side and a camera original
may exist with the client. Until it arrives, `components/sections/Sections.module.css`
renders `.portraitPending` at the crop's own proportion so the section will not need
re-laying out. It runs **ungraded** when it lands — see `content/images.ts`.

**A night table set for a celebration**, for Mbrëmje. The section currently runs a
dusk-graded daylight frame darkened in CSS, which is a placeholder, not a grade.

**A cellar photograph.** Verërat runs on type and one portrait, which works, but a
real image is better.

## Open

- The eight items in CLAUDE-CODE-PROMPT "Still open" are untouched. No invented
  species name, no invented quote, no producer logos.
- **The depth bands have drifted from §9's table** — see the last section of this
  file. Needs a ruling: either the table describes the mockup's shorter menu and
  this is fine, or the page order wants rebalancing.

## Slice 4 — the seascape

Three bugs found by measuring over time rather than in a frame. All three exist in
the mockup.

**`shortestArc` is wrong beyond ±540°.** `((to - from + 540) % 360) - 180` relies on
`%` returning a non-negative remainder, which JavaScript's does not — it keeps the
sign of the dividend. A prawn's drawn angle accumulates (measured between −1035°
and +448° over half a minute), so the gap does exceed 540, and when it does the
creature takes the long way round. Which is the spinning the chase exists to
prevent. Fixed, and accumulated angles are now normalised into ±180.

**Octopuses pinned at the ceiling.** "Only rise" forces `vy` negative *after* the
soft wall runs, so the ceiling can never turn one back. Measured: both octopuses
parked against the hard backstop at y = −28 within four seconds and stayed there.
They now re-enter from below — a species rule on one axis, not the wrapping plane
the basin replaced, and the population is constant.

**Octopuses stalled beneath the mark.** The emblem field pushes down, "only rise"
flips it straight back up, and capping horizontal speed against `|vy|` made it
unrecoverable: as the conflict crushed `vy` the cap collapsed with it and closed
the only way out. Measured: `vy ≈ −1.4` against a cruising speed of 25.9. The cap
is now taken against cruising speed, and both species relax their axis constraint
near the mark — the fish already had that; the octopus had no equivalent.

### The shoal swims at the edges — *resolved, see below*

At 486px the emblem's exclusion ellipse, padded by a creature's half width, spans
the entire usable width of the 749px water column. There is no clear middle, so the
outward field parks most creatures against the side walls. The mockup does this
too — measured centres across a 749px column, after ten seconds:

    mockup  −30 −30 −30 −30 −30 −15 −5 101 112 584 584
    ours    −30 −30 −30 −30 −30 −30 −30 −24 −10 85 115

The ellipse then covered the whole mark including the wordmark, which is what
CLAUDE-CODE-PROMPT specifies. Scoping it to the dome was ruled in, and the rest of
this file records what that took. Creatures now split both sides, as the mockup
does. **Do not act on this section on its own** — it is the start of a thread, not
its conclusion.

### Axis constraints need a stated exception

Both octopus bugs were the same shape: a species rule stated absolutely, colliding
with a general one. "Only rise" ran after the soft wall, so the ceiling could never
turn it back; and capping horizontal speed against `|vy|` meant that when the
emblem field crushed `vy`, the cap collapsed with it and closed the creature's only
escape. A constraint that removes a degree of freedom has to say where it stops —
near the mark and near the walls — or it closes its own way out. The fish already
had this (`(0.22 + 1.30 × near)`); the octopus did not.

### The keep-out is the dome, and the wordmark is fine without one

The lockup did not need covering. Type on a solid baseline tolerates a fish passing
behind it far better than the rosette does, and an ellipse over the whole mark left
the water column with no middle at all.

Measured twice, and the first measurement was misleading. In the **placeholder**
layout it came back clean immediately — zero wordmark overlaps, zero dome overlaps,
zero clamp firings over thirty seconds. In the **real hero**, where the emblem and
the water finally sit in their true relationship, the same measurement came back
799 clamp firings and 60 wordmark overlaps, every one of them an octopus. Both
numbers below were needed to get back to zero. Do not tune the seascape against a
placeholder layout; it will tell you it is fine.

It did not open up the column, though, and the reason is geometric rather than
tunable. With a 486px mark in a 749px water column:

    basin right wall (0.67)        502px
    keep-out right edge            595px   ← the whole right half of the basin
    field reach (um < 3.4)         867px   ← wider than the column itself

Both numbers come from locked values — the basin at 3–67% × 3–72% and the
inverse-square field from `um < 3.4`. The field is effectively a constant outward
wind across the entire water, so everything settles against a wall. Re-measure once
the hero puts the emblem and the water in their real relationship; do not tune it
against a placeholder layout.

### `sharp.tint()` works off luminance

`tint()` converts to greyscale and colours the result, so using it to warm a
photograph desaturates it first. The graded hero came out sepia — the sea grey,
the wood flat — and it reads as a taste problem rather than a bug, so it survives
review. Warmth is a per-channel gain instead: `linear([1.035, 1.0, 0.945], …)`.

Same shape as the `next/font` fallback trap: a function doing something adjacent
to its name, failing silently, and looking like a decision someone made.

### The field's reach is in pixels, not ellipse units

The onset was `um < 3.4` — a multiple of the exclusion ellipse — so scoping the
keep-out to the dome shrank the *warning* along with the shape. Vertical onset fell
from about 833px to 639px, and an octopus, the one creature that cannot turn off
its axis, arrived with 200px less room to turn in.

    clamp firings in 30s, by species
      before   octopus 799   fish 0   prawn 0   mote 0
      after    octopus  38   fish 0   prawn 0   mote 0

Reach is now `FIELD_REACH × column width`, set to 0.78 to reproduce the original
distance. Note the first attempt used 0.34 and changed nothing — the number has to
match what it replaced, or the fix looks like a failed hypothesis.

### Octopuses have the water below the mark

What the reach fix left behind was structural, not tunable: "only rise" and "never
touch the emblem" cannot both hold for a creature whose path crosses a mark
spanning most of the column. It has no way round, so it pressed into the keep-out
and slid along it — and the wordmark sits directly under the dome, in that path.
Every one of the 60 surviving overlaps of the VAJANA lettering was an octopus; fish
and prawns, which can turn off their axis, never came near it.

So the octopuses rise through the lower water and re-enter at the bottom when they
reach the underside of the lockup, fading over the last stretch so it dissolves
rather than blinks. Final, over thirty seconds:

    wordmark overlaps 0 · dome overlaps 0 · clamp firings 0
    closest approach — mote 1.72, fish 2.44, prawn 2.81, octopus 1.77

No separate exclusion around the label was needed.

## Slice 6 — sections, the carte, schema

**`section` matched nested sections.** The global rhythm rule `section { padding:
clamp(80px,11vw,150px) … }` also applied to every `<section>` inside the carte —
each menu group carries one for its `aria-labelledby` — so six groups each took
150px of *page* padding. Nearly a thousand pixels of blank cream through the middle
of the menu, which reads as a layout accident rather than a rule misfiring. Scoped
to `main > section`, and the collapse rules with it. The sheet went 4,769px → 2,969.

**The catch is not in the carte tab.** It is the whole of the Peshku section a
little further down — same twelve species, same per-kilo prices, same group in
menu.ts — and printing it twice on one page is the same list twice, not fidelity to
the printed card.

**The `<h1>` carries Vajana, not the headline.** §12 is explicit that the h1 and
the title carry the venue name and that the two must not be swapped to match the
visual emphasis. The wordmark inside the emblem is now the h1 and the lead line is
a paragraph doing display work. Note the spans need a literal space between them —
both are `display:block`, so it changes nothing visually, but without it the
accessible name reads "Vajanaby La Bohème".

**A CSS Module class ties with another module's class.** `.whatsapp { display:
none }` in a media query lost to Button's `.btn { display: inline-flex }`, because
they have equal specificity and a media query adds none — so the winner was
whichever module the bundler concatenated last. Scoped to `.buttons .whatsapp`.
Any rule meant to override a component's own class needs specificity, not a media
query.

### Depth bands have drifted from §9's table

Rendering the full carte inline — which is mandated, and whose length is the
argument — makes the page 12,883px, and the sections below the menu sit deeper than
§9's table describes:

    section      measured      §9
    hero         0–4.1 m       0
    atmosfera    4.7–5.6       3–8
    kuzhina      9.2–13.3      10–16
    signatures   13.3–16.2     18–21
    menuja       16.2–31.3     21–30
    peshku       31.3–39       30–36
    verërat      39–46.1       32–38
    mbrëmje      46.1–49.4     38–46
    story        49.4–54       46–54

The descent itself is intact — 0 to 54m over one scroll, all three separators
50/50. But photographs were assigned by measured luminance to depth bands, so
Verërat and Mbrëmje now sit in water several metres darker than the frames were
chosen for. Worth a decision: either the table is descriptive of the mockup's
shorter menu and this is fine, or the order needs rebalancing.
