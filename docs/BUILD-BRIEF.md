# Vajana by La Bohème — Build Brief

For Claude Code. Read this file, `VAJANA-COPY.md` and `menu.ts` before writing anything.
`vajana-mockup.html` is the visual target. Match its restraint, not its markup.

---

## 1. What this is

A single-page site for a beach restaurant on the bay of Vlorë, Albania. Two conversions,
both offline: call, and WhatsApp. No booking engine, no payments, no accounts.

**La Bohème is the master brand.** The owner will open more venues under it. Build the venue
as a repeatable content type from day one so the second one is a data entry, not a project.

---

## 2. Stack

- Next.js 15, App Router, TypeScript
- Tailwind, tokens defined in `globals.css` as CSS custom properties
- No CMS. Content lives in typed files under `/content`
- Deploy to Vercel
- No client-side data fetching, no state library, no animation library

---

## 3. Routing

```
/                    -> redirect to /vajana
/vajana              the venue page (everything lives here)
/vajana/la-boheme    the story page
/en, /en/vajana...   English
```

Root redirects now, becomes the group page when venue two exists. Do not build the venue page
at `/`. Moving it later costs the search equity this site is being built to capture.

Albanian is the default locale, no prefix. English at `/en`. Add `hreflang` pairs on both.

---

## 4. Content model

```
/content
  venues/vajana.ts     name, address, hours, phone, coordinates, gallery manifest
  menu.ts              supplied, do not restructure
  copy/sq.ts
  copy/en.ts
```

Menu prices change every season. Everything renders from `menu.ts`. No price string is
allowed anywhere else in the codebase.

---

## 5. Design tokens

**The hero is composed out of the dish.** Every tone on the first screen was sampled off the
octopus photograph, not chosen, and each element was given a different one so the palette
reads as a composition rather than a tint:

```css
.hero,.rail,.hbar{
  --lamp:#B57652;   /* charred arm, from #904D34 */
  --acc:#A0421F;    /* deepest crust, from #7F311A */
  --shell:#9A8474;  /* from #AA7761 */
  --oil:#C79A62;    /* the oil pooled at the rim, from #BE976C */
  --bed:#9B8AA0;    /* the purple potato bed, from #8C7B90 */
  --plate:#C6BCB2;  /* the bowl, from #C0BCBD */
}
```

Assignment: line work and the mechanism take `--lamp`; the lead and the prawns take `--acc`;
the octopuses take `--bed`, so the violet of the potato appears in the water; caustics, shafts
and the surface take `--oil`; suspended matter and the panel hairline take `--plate`. The
water column runs warm at the surface into violet at depth, which is the dish's own structure
turned on its side.

Sample, don't pick. It is why the column and the photograph read as one image instead of as
artwork placed next to a photo.

```css
--ink:   #12100E;  /* ground. warm near-black, from the night terrace */
--ink-2: #1B1714;  /* raised sections */
--sand:  #E9DCCB;  /* the printed menu paper */
--bone:  #F2EBE1;  /* body text on ink */
--lamp:  #C69A5C;  /* the only accent. lamp glow, embroidery gold */
--shell: #8E7F70;  /* captions, muted */
--line:  rgba(242,235,225,.14);
```

Ink on sand: `#3E3225` body, `#2E251A` headings, `#8A6E45` accents.

**The ink palette**

Bohemian Paris was a colour culture, but its colour arrived through stone lithography, which
limited a poster to a handful of inks. That constraint is the palette:

```css
--ink-verm:  #C0442E;  /* vermilion, madder */
--ink-abs:   #9FAE4F;  /* absinthe */
--ink-prus:  #3E6B84;  /* Prussian */
--ink-aub:   #7A4359;  /* aubergine */
--ink-ochre: #C69A5C;  /* ochre, the house gold */
```

Every accent-coloured thing reads `var(--lamp)`. Re-inking a whole section is therefore one
declaration: `#catch{--lamp:var(--ink-prus)}`. Current assignment: catch Prussian, cellar
aubergine, kitchen and evenings vermilion, story absinthe, day strip mixed, everything else
ochre.

**Colour never becomes a background.** The ground stays `--ink` and the menu stays `--sand`.
Inks appear in rules, eyebrows, engravings, headings and marks. A restaurant selling a
45 000 L Barbaresco cannot afford saturated furniture.

**Type**

- Display: Bodoni Moda, 400/500. A true Didone, which is what 19th-century French print
  looked like. Fallback stack `'Didot','Bodoni 72',Georgia,serif`.
- Body: Archivo, 300/400. Quiet grotesk, wide range.
- Utility: Archivo at 10–11px, `letter-spacing:.3em`, uppercase. Eyebrows and labels only.

Self-host both via `next/font`. Do not link Google Fonts.

**One accent colour only.** Every hover, rule, eyebrow and border uses `--lamp`. Introducing
a second accent is the fastest way to make this look like a template.

---

## 6. The entrance

The signature element. Ships first, gets the most care.

An SVG line engraving of a fish draws itself stroke by stroke, holds, dissolves, and the
wordmark resolves in its place. Nineteenth-century natural-history plate. No text during
the animation.

Path data is in the mockup. Technique: `stroke-dasharray` / `stroke-dashoffset` transition,
then an opacity crossfade to the wordmark.

Hard rules:

- Total under 2.5s
- Fires **once per session** (`sessionStorage`), never on repeat navigation
- Dismissed by tap, click, scroll or Escape
- Rendered as an overlay above fully-hydrated page content, never as a gate. It must not
  delay LCP or block the crawler
- Skipped for `prefers-reduced-motion` and for anyone arriving on a hash deep link
- No layout shift when it leaves

Someone at the table checking the menu on 4G must never wait for this.

---

## 7. Page order

```
1  Hero              full-bleed terrace at dusk, both CTAs
2  The day           three frames: 8:00 / golden hour / midnight
3  The paper         signatures + full menu, on --sand
4  The catch         split, 12 species with per-kilo prices
5  The cellar        raised block, the label names set large
6  The kitchen       Gabriel Islami, portrait + quote
7  Evenings          full-bleed, the events CTA
8  La Bohème         short passage, links to the story page
9  Footer            hours, address, call, WhatsApp, venue list
```

**Section 3 is the second signature.** The whole site is dark except the menu, which sits on
sand and reads as the printed menu laid on the page. It is the only tonal break. Do not add
a second one.

The full menu renders inline, all ~90 items, with a sticky category bar that jumps within
the page. No PDF, no modal, no separate route. The wine list renders in full, all 38 labels
across three groups. Its length is the argument.

The footer venue list renders from a collection holding one entry.

---

## 8. Conversions

Two actions, repeated at the end of every section, each with intent in the label:

| Label (sq) | Label (en) | Action |
|---|---|---|
| Rezervo tavolinë | Book a table | call + WhatsApp |
| Organizo një mbrëmje | Plan an evening | call + WhatsApp |

`tel:+355699845030` and `wa.me/355699845030?text=` with prefilled messages from
`VAJANA-COPY.md` section 11. The prefill differs by intent so the owner reads date, headcount
and occasion before he replies.

Sticky bottom bar on mobile carrying both. Fire a `gtag` event on every `tel:` and `wa.me`
click, since there is no tracking line and GBP insights are the only other signal.

---

## 9. The descent

The page **is** the water column, and this is the thing the site should be remembered for.
La Meridiana tracked the sun because the name meant sundial. Vajana is named for a fish these
waters no longer hold, so the page goes down: sunlit surface at the hero, dark at the story.
Because the restaurant opens at 8:00 and closes at 24:00, it reads as the day arriving as well
as depth — the site performs the thing it sells.

**The page opens underwater, not above it.** A pale near-white surface implies standing on the
shore, which the shoal in the hero immediately contradicts. It begins a few metres down, in
clear blue with the sun still reaching, and goes to the dark.

**One ground for the whole page.** A fixed `#ground` behind everything, its colour lerped
through a six-stop ramp by the same scroll fraction that drives the rest:

```
 0 m  rgb(24,64,84)   clear water, sunlight still in it
 8 m  rgb(19,53,71)
18 m  rgb(14,41,57)
30 m  rgb(10,29,43)
42 m  rgb(6,18,28)
54 m  rgb(3,10,16)    the deep
```

**Every accent runs warm to cold, because that is what the sea does.** Red is the first
wavelength seawater absorbs and blue the last, so the whole system inverts across the descent
rather than merely dimming:

| | 0 m | 27 m | 54 m |
|---|---|---|---|
| `--lamp` rules, buttons, ornament | `238,176,86` amber-gold | `204,198,182` | `228,241,248` blue-white |
| `--acc` the lead, prices | `246,158,70` | `192,192,190` | `226,240,248` |
| `--bone` headings | `246,235,222` warm cream | | `228,241,249` cold white |
| `--body` copy | `232,218,203` | | `206,226,238` |

**The brand colour is `#482720`, and it cannot be used as text on this page.** It is the ground
of the printed logo — a burnt umber with a relative luminance of **0.19**, which is *darker than
the water at the surface* (0.21). Set as type on the blue it disappears completely; there is no
opacity or weight that rescues it.

So it is used two ways:

- **At full strength wherever the surface is light.** Prices and the ornament dot on the cream
  carte, the caption tab under the hero panel, the label inside a filled button, the hairline
  around the menu sheet. On cream it is the real logo colour, exactly as printed.
- **Lifted for the water.** Its hue (11°) and character are kept and only the value raised until
  it separates — `#E17B64` at the surface, running to blue-white at depth. Same pigment, seen in
  light rather than in ink.

This is the standard move when a brand colour is an ink meant for light stock: hold the hue,
move the value. Substituting a different hue would lose the brand; using the raw value would
lose the text.

**Inside the emblem the brand marks the living thing.** The rosette and VAJANA stay flat white;
the vajana itself and *by La Bohème* take the lifted brand colour. Two tones, and the warm one
falls on the fish the restaurant is named after.

**The logo brown is `#482720`, and it is used in two forms.**

Measured: its luminance is 0.029. The surface water is 0.045. That is **1.20 : 1** — not dim,
not subtle, but literally invisible, and it stays under 1.5 : 1 at every depth on the page.
Against the cream menu sheet the same colour is **9.81 : 1**.

So it is carried two ways, both of them the logo:

- `--logo-true: #482720` on light grounds. The carte's prices, section marks and ornament are
  now the exact logo brown on cream, where it is the strongest ink on the page.
- `--logo: #DE8573` on the water — the same hue (10.5°) with the value lifted until it
  separates: 4.06 : 1 at the surface. Same pigment, seen in light rather than in shadow.

The whole warm accent ramp now starts from that hue rather than from amber, so every rule,
button and hairline in the shallow water is the logo colour before the sea takes the red out of
it. **The fish inside the emblem carries `--logo` at every size** — it is the mark, so it
carries the mark's colour, while the rings stay white.

**Lifted, not literal.** An earlier attempt used a red-orange around `222,126,60`. It
looked dirty on the water for a measurable reason: its value sat close to the ground's, and its
chroma was low, so it muddied rather than separated. Amber is both lighter and more saturated
than the blue behind it, and gold is the true complement of teal — the same reason it works on
navy in print. Solid buttons take a deep water-blue label (`#10303F`) rather than the page's
near-black, so the fill reads as lit rather than as a hole.

The contrast at the top is the point: amber on clear blue. By the bottom the same elements
are pale blue on near-black, and nothing has moved but the light.

**One type zone, not two.** The earlier build had a light-on-pale state handing over to
light-on-dark, with all the contrast risk that carries at the crossover. Starting underwater
removes the problem entirely — the type is light throughout and only its *temperature* changes,
which can be interpolated safely because the ground is always dark behind it.

Sections paint no background of their own. `body`, `.paper`, `.cellar`, `footer` and the story
are all transparent; only the carte's cream sheet keeps a fill, because it is paper — and on
blue water it now reads as the one warm object on the page, which is exactly right for a menu.

**Section order follows the descent**, and each photograph was chosen by measured luminance so
its own tone matches the water it sits in:

| Depth | Section | Photograph |
|---|---|---|
| 0 m | Hero | 7933, a table laid facing the bay |
| 3–8 m | **Atmosfera** — music and the crowd | 7918 the DJ, 7934 the loungers, 7897 two glasses at sunset |
| 10–16 m | **Kuzhina** — Gabriel | the portrait |
| 18–21 m | The house signatures | none, ornament only |
| 21–30 m | **Menuja** — the carte | none, cream paper |
| 30–36 m | **Peshku i ditës** — the catch | 7920 the crate on ice, 7926 live lobster over water |
| 32–38 m | **Verërat** — the wines | 7914, the bottle carried to the table |
| 38–46 m | **Mbrëmje** — the evening | 7905, the terrace after dark |
| 46–54 m | **La Bohème** — the deep | 7900, the painter's easel facing the bay |

**The hero is the room, not a dish.** Four plated shots were tried at the top and all four
failed the same way: a plate photographed flat reads as a menu photograph, and a menu
photograph at the top of a page reads as stock, however good the food is. The frame that works
is a table laid facing the water — timber, white linen, glasses, the bay behind it. It answers
the only question a first-time visitor actually has, which is *what is it like to sit there*,
and it carries the sea, the light and the invitation in one image.

The food starts one section down, where a diner would meet it. On a page where the first line
is `Rezervo tavolinë`, the hero should show the table.

The whole set was ranked by mean luminance before assigning: bright, blue, high-key frames live
in the first ten metres; the fish on ice and the live shellfish sit in the cool middle; the
night terrace and the easel go at the bottom. Anything that has to be graded heavily to fit its
band is in the wrong band.

Narrative and tone agree: you arrive at the water, spend the afternoon in it, then the
restaurant begins — and it begins with the person cooking. Meet the chef, read what he cooks, see the fish
he is given to work with, get poured a wine, sit down to the evening, and end in the dark with
the story of the name.

The menu follows the chef immediately because that is the order of interest: someone who has
just met the person cooking wants to know what he cooks, not yet where the fish comes from.
The catch then sits after the carte as the proof behind the prices they have just read.

The chef leads because he is the only thing on the page a competitor cannot copy. A beach
club can buy the same loungers and book the same DJ; it cannot have Gabriel.

**The type handover fires on the ground's own luminance**, not on a section or a depth number:
`deep` on below 0.44, off above 0.52, with the hysteresis gap so it cannot flap. It lands
around 21 m, inside the carte, where the cream sheet hides it. If the ramp is retuned the
handover follows automatically.

Checked at 1600×900 desktop and 390×844 mobile, top to bottom.

## 9b. The wine houses

A seamless right-to-left marquee. The track holds the list **twice** and translates by exactly
`-50%`, so at the moment the animation restarts the second copy is standing where the first
one began and there is no seam. 46s, paused on hover, masked at both edges so names enter and
leave rather than popping. Disabled under reduced motion.

**The old list was wrong and could not have been done as logos.** It read *Gaja, Luce,
Brunello, Amarone, Philipponnat, Chablis, Terre Alte* — a mix of producers and appellations.
Brunello di Montalcino, Amarone della Valpolicella and Chablis are places, not brands. They
have no logo, and hundreds of estates make each of them. Terre Alte is a wine, not a house; its
producer is Livio Felluga.

Corrected against `menu.ts` to the eight houses actually on the list:

| House | Where | Their wines on the list |
|---|---|---|
| Gaja | Barbaresco, Piemonte | Barbaresco, Promis, Rossj-Bass, Vistamare |
| Luce della Vite | Montalcino, Toscana | Luce, Lucente |
| Livio Felluga | Rosazzo, Friuli | Terre Alte, Sauvignon, Pinot Grigio |
| Philipponnat | Mareuil-sur-Aÿ, Champagne | Royale Réserve Brut |
| Bellavista | Erbusco, Franciacorta | Brut, Rosé |
| Ceretto | Alba, Piemonte | Blangé |
| Cantina Terlano | Terlano, Alto Adige | Quarz, Kreuth |
| Castello del Terriccio | Castagneto, Toscana | Tassinaia |

**These are set as wordmarks, not logos, and that is deliberate for now.** Real logo files have
to come from each producer's own press kit — they are trademarks, and several of these houses
restrict use of their marks by third parties. Before shipping logos, someone has to request the
asset packs and check each house's terms; a row of producer logos on a restaurant site can
imply an endorsement that does not exist. The marquee is built so that swapping the wordmark
for an `<img>` inside `.house` needs no other change.

The last two rows are the least certain and should be confirmed with the sommelier: Tassinaia
is Castello del Terriccio and Blangé is Ceretto to the best of my knowledge, but the menu lists
only the wine names.

## 10. Ornament and motion

The swimming creatures are drawn to natural-history-plate standard, not as pictograms:
`FISH_REAL` carries a forked caudal, spiny and soft dorsals with individual rays, pectoral,
pelvic and anal fins, gill cover, operculum line, eye with pupil, lateral line and scale arcs.
`prawn()` and `octopus()` are both generated: a spine is sampled from béziers, then `_taper()`
offsets it along its normals into a closed outline. That is the whole difference between an
octopus and a jellyfish — arms have to taper and curl, and single strokes never will. The
octopus carries a bulbous mantle, eyes on their own bulges, eight curling arms and suckers on
the two facing ones.
They sit beside each other in the same water, so any one of them drawn more simply than the
rest is immediately visible as the weak one.

**The rosette is built from a constant motif pitch, then given six different devices.**
`mandala_mech()` sets one pitch (`0.050 × size`) and derives each band's motif count from its
own circumference, so motif size stays equal across every ring and the count rises outward.
Each motif is drawn at 0.92–0.94 of the arc half-pitch so neighbours meet. That rule is what
separates a rosette from scattered shapes: guessing counts per ring leaves gaps in the outer
bands and crowding in the inner ones, and the eye reads it as noise.

The pitch gives it structure; the devices give it interest. Bands cycle:

0. Nested petals with a seed dot at the centre of each.
1. **Guilloche** — three closed curves of `rm + amp·sin(nθ + φ)` at 120° phase offsets. This is
   the banknote-engraving device and it does most of the work of making the whole thing read
   as engraved rather than drawn.
2. Interlaced loops: circles at the band's mid-radius, wider than the pitch so they overlap
   into a chain.
3. Beading with a double dot, between two scalloped edges facing each other.
4. Cusped diamonds with an inner diamond.
5. Trefoils.

Closed by paired hairlines at every edge, a scalloped inner lip and a beaded rim.

**The hollow is `0.23 × size`, not `0.21`.** The inner lip added lines *inside* the hollow, so
the fish's clear radius dropped to `0.90r − scallop`. With the fish at 24% of the dome the
corner sits at 0.181 against a clear radius of 0.194. Any change to the lip, the hollow or the
fish needs that recomputed.

Bohemian arrives as line, never as filled colour. `patterns.py` generates seeded rosettes in
two modes; only `mandala_line()` ships. Same geometry as the filled version, one weight of
gold stroke, no palette. A different seed gives a different rosette and all of them are usable,
so venue two gets its own family free.

**There is no separator directly under the hero.** The hero keeps roughly 90px clear below its
CTA so the fixed bottom bar does not sit on the button. A separator placed after it therefore
has dead hero space on one side and a heading on the other, and no padding value can make that
look centred — it will always read as marooned. The hero ends on its own edge, which is division
enough. Separators are used only between two sections that both have content at the boundary.

**Every separator sits in the gap, not at the top of the next section.** A separator belongs to
neither side, so it is its own block — `.sep` for the fleuron, `.chapter` for the named divider
— with a flat **50px** of padding above and below at every viewport — the one measurement on the page that does not scale, and the sections either side give up
their adjacent padding:

```css
.sep + section, .chapter + section          { padding-top: 0 }
section:has(+ .sep), section:has(+ .chapter) { padding-bottom: 0 }
```

**Separators use grid, not flex.** `grid-template-columns: 1fr auto 1fr` puts the mark exactly
on the centre line; two `flex:1` rules either side of it do not, because the rules' intrinsic
content can bias the distribution. And the patterned rules tile **away from the centre** —
`background-position:right` on the left rule, `left` on the right — so both meet the mark at the
same point in the motif. Tiling from the outside leaves each side ending mid-tile at a different
place, which is what makes a perfectly centred divider look off.

**Measure the gap to the topmost element of the next section, not to the section box.** A
`.split` grid defaults to `align-items:center`, so its shorter column floats — the chef's
photograph sat 26px below the section's own top edge, and the air under the separator was
silently 118px against 92px above it. `.chapter + section .split{align-items:start}` makes the
photograph define the top, and the two sides come out identical.

Without the padding-collapse rule the separator's own padding is only half the gap — the next section's
`clamp(96px, 13vw, 190px)` top padding is added underneath it, and the mark ends up sitting
against the section above and floating far from the one below. **Inline padding beats the collapse rule.** The image strip carried its bottom padding in a
`style` attribute, so `section:has(+ .chapter){padding-bottom:0}` never applied and the divider
sat 89px from the images and 38px from the photograph. Section padding has to live in the
stylesheet for this to work.

**Measure against the clipped edge, not the element.** The strip's images are 114% tall inside
a clipped frame for the parallax, so `img.getBoundingClientRect()` reports 43px below where the
picture visibly ends. Measuring the wrong box is what sent me chasing a spacing bug that was
not there.

Measured between visible edges at 1920×1080, 1600×900 and 1440×900: 50/50 on all three.

For the hero's divider this required three things beyond the padding value, because anything
the hero holds in reserve at its bottom stacks on top of the separator's own space:

- `.hero .txt{align-self:end; padding-bottom:0}` — the column was centred in a full-height row,
  which left ~64px of dead space below the CTA. It now sits above the emblem instead.
- The short-viewport media query also set `padding-bottom:26px`; that had to go to 0 as well.
- `.hero .btns{margin-bottom:0}` — the last 2px.
- The bottom status bar fades in past 55% of the first screen. It was reserving a fixed 50px
  strip at the bottom of the viewport, which forced the CTA upward. Hiding it over the hero is
  better anyway: a depth reading of `0 m` on the first screen says nothing. The named divider runs taller because
the emblem and the word sit inside it, but the air either side is the same.

**The chapter divider.** One full-width break marks where the beach ends and the restaurant
begins: a patterned hairline running out to both margins, broken in the middle by the **emblem
itself** — a four-ring `mandala_mech` turning on 186 / 132 / 94 / 62s with alternating
direction, the vajana drifting in its hollow on a 15s loop — and the word **RESTORANTI**
beneath it. It sits between Atmosfera and the kitchen. One only; a second turns a structural
signal into decoration.

**The mark takes `--lamp`, not white.** This is the logo, so it carries the same colour as
every other non-white element on the page, fish included, and it warms and cools with the
descent along with them. The hero emblem stays white because it is the masthead; everywhere
the logo recurs at small size it is the accent.

Two things it needs at 88px: only four rings — the full seven turn to mush below about 90px —
and **`vector-effect` re-declared on the paths in CSS**, because it is not an inherited
property. A stroke set on the `<svg>` scales with the viewBox, so at 88px from a 760 box it
lands at a tenth of a pixel and the mark disappears entirely.

Pattern appears in three places and nowhere else: the entrance, a hairline patterned rule at
section joins and around the menu sheet, and one small rosette above each signature dish.

**The drifting watermarks are cancelled.** They were a fourth place — large rosettes behind
sections at 7% opacity — and they were never built. Ruled out rather than added: the page's
measured cost is compositing, a full-width decorative layer earns a compositing layer of its
own, and 7% opacity is not worth one. Six emblems ship on the venue page. See DECISIONS.

The entrance draws a hollow-centred rosette ring by ring, then draws the vajana inside it,
then dissolves to the wordmark. Under 2.5s, once per session, skippable, overlay not gate.

Parallax at low rates, transform only, desktop above 820px, one rAF loop. Headings rise line
by line from `translateY(105%)` behind an `overflow:hidden` mask. Images wipe up from
`clip-path: inset(0 0 100% 0)` — **the clip-path goes on the `<img>`, never the frame**, since
clipping the frame zeroes its intersection box and the observer never fires.

Grain at 5.5% overlay, fixed, `pointer-events:none`.

**Namespace the reveal state class.** `.in` collided with layout selectors `.hero .in` and
`.ev .in`, so revealed children inherited container padding and a 1px rule rendered 110px tall
on mobile. Use `.is-in` or rename the containers.

All motion inside `@media (prefers-reduced-motion: no-preference)`. With reduced motion the
depth engine holds at the surface values and the page renders complete and still.

---

## 11. Images

Sources in `/public/img`, served through `next/image`, AVIF and WebP.

Grade every frame warm before it ships: the raw photography splits into hard midday turquoise
and warm evening gold, and only the warm half belongs to this brand. Reduce saturation on the
sea, lift warmth, drop contrast slightly. **The chef portrait now runs ungraded.** It was cropped tight, desaturated to 30% and darkened
to survive a near-black page — a page that no longer exists. On blue water the original frame
needs nothing: he is photographed against the same sea, in the Vajana jacket, and it is the
only image on the site where the brand appears in the world rather than on the screen. Crop
`150, 372, 1230, 1722` on the source; anything above 372 includes the screenshot's own chrome
and shows as a white bar. Never composite him onto a new background.

Hero and first-viewport images `priority`. Everything else lazy. Explicit `sizes` on all.

Target: LCP under 2.5s on 4G. Visitors are on a beach.

---

## 12. SEO

- `<h1>` and `<title>` carry **Vajana**. The visual hierarchy favours La Bohème; the search
  hierarchy does not. Do not swap these.
- "Vajana" never appears alone in a title, meta field, alt text or structured data. Always
  "Vajana by La Bohème".
- Schema: `Restaurant` for the venue, `parentOrganization` pointing at a La Bohème
  `Organization`, each with its own stable `@id`. Add `servesCuisine`, `priceRange` `$$$$`,
  `openingHours`, `geo`, `hasMenu` anchored to the inline menu, and `Menu` / `MenuSection` /
  `MenuItem` generated from `menu.ts`.
- Every dish name is indexable text. No dish name inside an image.
- GBP website field points at `/vajana`, and the GBP menu field at the menu anchor.

---

## 13. Quality floor

Responsive to 360px. Visible keyboard focus in `--lamp`. Reduced motion respected.
Real `lang` attributes per locale. Alt text in the page's language. Contrast checked on the
sand section, where `--shell` on `--sand` fails and must not be used.

---

## 14. Blocked

Three things are missing and the build should leave clean slots for them:

1. A photograph of a table set for a celebration at night. Section 7 ships with a
   dusk-graded daylight frame as a placeholder. Replace it.
2. A cellar photograph. Section 5 currently runs on type alone, which works, but a real
   image is better.
3. Gabriel's training and previous kitchens. One sentence, optional.

Do not invent copy to fill these.
