# Vajana by La Bohème — build prompt

Paste this whole file as your first message to Claude Code, with the attached files in the repo.

---

## What you are building

A production Next.js site for **Vajana by La Bohème**, a beach restaurant on the bay of Vlorë,
Albania. A complete single-page design already exists as a static mockup. Your job is to
rebuild it as a real application without losing anything, not to redesign it.

**Read `vajana-mockup-final.html` in a browser before writing any code.** It is a single 2.4MB
file with every image inlined as base64. Everything in it is intentional. `BUILD-BRIEF.md`
explains why each decision was made and records the bugs that were hit getting there — read it
second, and keep it open while you work.

### Inputs

| File | What it is |
|---|---|
| `vajana-mockup-final.html` | The approved design, fully working. The reference for everything. |
| `build_final.py` | The Python generator that produces the mockup. Source of truth for the CSS and the JS. |
| `BUILD-BRIEF.md` | Rationale, exact values, and every trap already hit. |
| `VAJANA-COPY.md` | All site copy, Albanian and English. |
| `menu.ts` | The full menu, ~90 items, typed and bilingual. Already production-shaped. |
| `patterns.py` / `engravings.py` | Generators for the rosettes, the fish, the prawn, the octopus. |

### Stack

Next.js 15 App Router · TypeScript · Tailwind for layout only · CSS custom properties for the
colour system · no CMS, content in typed files under `/content` · deploy to Vercel.

Routes: `/` redirects to `/vajana` · `/vajana` · `/vajana/la-boheme` · `/en/...` for English.
A La Bohème group page lands at root when a second venue exists.

---

## The one idea

**The page is a descent.** It opens a few metres underwater in clear blue and gets darker as
you scroll, reaching near-black at the story. Everything else follows from that. If a change
makes the descent less legible, it is the wrong change.

The visitor is already submerged on arrival — there is a shoal of engraved fish swimming in the
hero. Do not lighten the top of the page toward a surface; that was tried and it contradicts
the page's own content.

---

## Build in this order

Each slice must run and look right before you start the next one.

**1 — Tokens and the ground.** The fixed `#ground` layer, the six-stop colour ramp, and the
`ramp()` interpolation driven by one scroll fraction. Every accent on the page comes from this.
Get it working with placeholder blocks before any real section exists.

**2 — Type and the shell.** Bodoni Moda and Archivo self-hosted via `next/font`. Header, the
bottom status bar, buttons, section rhythm.

**3 — The emblem.** The half-rosette dome with the vajana inside it, the seven counter-rotating
rings, the wordmark on the baseline. This is the hardest component and everything else depends
on its measured position — build it before the seascape.

**4 — The seascape.** The physics loop: swimmers, suspended matter, the repulsion field, the
wave fronts. One `requestAnimationFrame`, transform only.

**5 — The hero.** Emblem, headline, panel photograph, the entrance animation.

**6 — Sections in page order**, then the carte from `menu.ts`, then schema and metadata.

---

## Things that must not change

These were each arrived at by fixing something. Changing them re-breaks it.

### The descent

```
GROUND  0m rgb(24,64,84)   8m rgb(19,53,71)   18m rgb(14,41,57)
       30m rgb(10,29,43)  42m rgb(6,18,28)    54m rgb(3,10,16)
```

Warm accents run **orange to blue-white**, because red is the first wavelength seawater absorbs
and blue the last:

```
--lamp  0m rgb(222,133,115) → 34m rgb(162,192,210) → 54m rgb(228,241,248)
--acc   0m rgb(232,120,96)  → 40m rgb(200,224,236) → 54m rgb(226,240,248)
--bone --body --shell all ramp warm→cold across the same scale
```

There is **one type zone**. The ground is dark throughout, so text is light throughout and only
its temperature changes. Do not reintroduce a light/dark handover.

### The logo colour

`#482720` is the logo brown. Measured against the surface water it is **1.20:1** — invisible,
at every depth. Against the cream menu sheet it is 9.81:1.

- `--logo-true: #482720` on light grounds only. The carte's prices and marks.
- `--logo: #DE8573` on the water — the same hue at 10.5°, value lifted until it separates.
- The fish inside the emblem carries `--logo` at every size. The rings stay pure white.

### The emblem

Flat `#FFFFFF`, fully opaque, at every depth. It is the one fixed point in the descent — the
water changes around the mark, the mark does not change.

- Rings turn at 210 / 150r / 118 / 86r / 64 / 46r / 32 seconds. Alternating directions and
  non-harmonic periods, so the figure never visibly repeats.
- The rosette's outermost ring must sit at **≤ 0.454 of the viewBox** or the dome's
  `overflow:hidden` shaves the crown.
- The hollow is `0.23 × size`. The fish is 26% of the dome at `bottom:6%`. Re-check
  `hypot(w/2, h_centre + h/2) < 0.21` if either changes.
- **Every rosette on the site is this emblem**, at four sizes: hero 486px, chapter divider
  112px, house signatures 92px, drifting watermarks. Small marks use the same generator at
  three rings — seven turns to mush below 90px.

### The seascape physics

- Fish hold a horizontal axis: vertical velocity damped and capped at 22% of horizontal. They
  face their run by **mirroring with `scaleX(-1)`**, never by rotating through 180°.
- Octopuses only rise: vertical velocity forced negative, horizontal capped at 28%.
- The drawn angle **chases** the heading through the shortest arc; it never snaps to it.
- Propulsion cues never rotate the body. Fish undulate on `scaleX/scaleY`, prawns flick
  laterally, octopuses pulse the mantle.
- Nothing touches the emblem. An **ellipse** around the whole mark, wordmark included, expanded
  by the creature's own half-width, plus an inverse-square repulsion field from `um < 3.4` that
  turns them long before contact. The hard clamp is a safety net that should never fire.
- The water is a **bounded basin**, not a wrapping plane: soft walls at 3–67% × 3–72% of the
  column. Wrapping empties the frame once the wave force reaches everything.

### Separators

Exactly **50px above and below**, measured between visible edges, at every viewport.

```css
.sep + section, .chapter + section            { padding-top: 0 }
section:has(+ .sep), section:has(+ .chapter)   { padding-bottom: 0 }
.sep + section .split, .chapter + section .split { align-items: start }
```

Grid, not flex — `1fr auto 1fr` guarantees a centred middle. Patterned rules tile **away from
the centre** so both sides meet the mark at the same point in the motif.

---

## Traps already hit

Every one of these cost real time. They are in `BUILD-BRIEF.md` with more detail.

**Class name collisions, four times.** `.in`, `.plate` twice, `.dish`, `.mark`. Prefix every
component class. The failures are silent — an element inherits `opacity:.09` from an unrelated
rule and simply disappears.

**Never name a variable `t` inside the animation loop.** A transform string declared as
`var t = 'translate3d(...)'` shadowed the rAF timestamp, so `t/1000` was `NaN` for every
particle after the first and the wave force silently did nothing to 13 of 14 creatures. Nothing
threw. Three rounds of tuning force constants failed because the numbers were never the problem.

**`vector-effect` is not inherited.** A stroke set on an `<svg>` scales with the viewBox, so at
90px from a 760 box it renders at a tenth of a pixel and vanishes. Re-declare on the paths.

**`p.x`/`p.y` are the creature's centre.** Offset the transform by half the width *and half the
height*. Only the width was subtracted, so everything rendered half its own height below where
the collision maths believed it was.

**Masked line reveals clip descenders.** `.lines .ln{overflow:hidden}` crops the tails on `g`
and `j`. Fix with `padding-bottom:.16em; margin-bottom:-.16em`. Only shows in languages that
use descenders — Albanian does.

**Inline padding beats the collapse rule.** Section padding must live in the stylesheet or
`:has()` rules silently do nothing.

**Measure the rendered edge, not the element.** Parallax images are 114% tall inside a clipped
frame, so `getBoundingClientRect` reports them ending 43px below where the picture visibly
stops. This sent me chasing a spacing bug that did not exist.

**Regex deletion across CSS blocks is dangerous.** One eaten closing brace silently swallows
every rule after it, with no error and a blank white page.

---

## Page order

Hero → **Atmosfera** → *divider* → **Kuzhina** (Gabriel) → house signatures → **Menuja** →
**Peshku** → **Verërat** → **Mbrëmje** → **La Bohème** (the story) → *divider* → footer.

The chef leads the restaurant half because he is the only thing on the page a competitor cannot
copy. Any beach club can buy the same loungers and book the same DJ.

Photographs are assigned by measured luminance so each sits at its own depth. Do not reshuffle
them without re-checking tone.

---

## Copy rules

Everything is Albanian first, English second. `VAJANA-COPY.md` is the source.

**No slogans.** Several rounds were spent removing them. The test: *if a line would survive
being moved to a competitor's website unchanged, it is not saying anything.*

- Not "a list like this isn't expected on sand" → "Tridhjetë e nëntë etiketa. Dhjetë të kuqe,
  njëzet e katër të bardha, pesë shkumëzuese."
- Not "the hand of our kitchen, not the list" → name the ingredients and the price.
- Not "here the hours are not counted" → "DJ çdo ditë nga mesdita."

Say what is there. Numbers, ingredients, times, prices.

---

## Brand rules

- **Never write "Vajana" alone** in a title, meta description or alt text. Always
  "Vajana by La Bohème". Alone it collides with anatomical misspellings in search.
- La Bohème is the master brand; Vajana is one venue. Future venues take local nouns endorsed
  by the French parent. The emblem inverts this deliberately — Vajana large, endorsement small
  — because that lockup already exists on the menus and on the chef's jacket.
- Standardise on **Bohème** with the grave accent everywhere. The GBP listing currently mixes
  "Boheme" and "Bohème".

---

## Still open — do not invent answers

1. **Night photograph of a table set for an event.** The Mbrëmje section needs it. Missing.
2. **Cellar photograph.** The wine section runs on type and one portrait.
3. **The vajana species.** No documented name found for the extinct fish. The owner knows it.
   Get it before the story page copy is finalised.
4. **Gabriel's quote** needs owner sign-off before publishing as a direct quote.
5. **The wine houses** are set as wordmarks, not logos. Real logo files must come from each
   producer's press kit; several restrict third-party use, and a row of producer logos can imply
   an endorsement that does not exist. Confirm Tassinaia → Castello del Terriccio and Blangé →
   Ceretto with the sommelier.
6. **GBP fixes**: website URL, menu link, attributes, photo categorisation, NAP consistency.
7. **Domain and handles**, and a DPPI class 43 trademark filing.
8. **English copy** needs a final pass.

---

## Done means

- The descent is visible on a single scroll from top to bottom.
- The CTA is above the fold at 1920×1080, 1600×900, 1440×900 and 1280×800.
- All three separators measure 50px each side between visible edges.
- Nothing overlaps the emblem at any moment — verify by sampling over 30 seconds of motion.
- The menu renders entirely from `menu.ts`. **No price string exists anywhere else in the
  codebase.**
- `prefers-reduced-motion` disables the seascape, the entrance and the ring rotation.
- Lighthouse ≥ 90 on mobile. The mockup inlines 2.4MB of base64; the real build must use
  `next/image` throughout.
- Schema: `Restaurant` for Vajana with `parentOrganization` → La Bohème `Organization`, stable
  `@id` on both, `hasMenu` built from `menu.ts`.

Ask before changing anything in "must not change". Everything else is yours.
