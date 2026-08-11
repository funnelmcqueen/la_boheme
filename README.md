# Vajana by La Bohème

A beach restaurant on the bay of Vlorë, Albania. Next.js 15, App Router,
TypeScript, deployed to Vercel.

## The one idea

**The page is a descent.** It opens a few metres underwater in clear blue and gets
darker as you scroll, reaching near-black at the story. A single fixed `#ground`
layer is lerped through a six-stop ramp by one scroll fraction, and every accent on
the page is interpolated off that same fraction — warm to cold, because red is the
first wavelength seawater absorbs and blue the last. There is one type zone: the
ground is dark the whole way, so the type is light the whole way and only its
temperature changes.

The emblem is the only thing that does not change. Flat white at every depth — it
is the fixed point the descent is measured against.

If a change makes the descent less legible, it is the wrong change.

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # 52 tests
npm run typecheck
npm run build        # stop the dev server first — they share .next
```

`npx vite-node scripts/grade-images.ts` regrades the photography into
`public/img` from the sources named in `content/images.ts`.

## Where things are

```
app/(sq)/…            Albanian, no path prefix
app/(en)/en/…         English
content/menu.ts       ~90 items. The only place a price exists.
content/copy/         one Copy interface, both locales satisfy it
components/depth/     the ramp and the one scroll listener
components/emblem/    the rosette generator and its <symbol> sprite
components/sea/       the seascape physics, testable without a browser
docs/DECISIONS.md     rulings that override the two spec documents — read first
```

## Rules that are not preferences

- **No price string outside `content/menu.ts`.** Prices change every season and the
  owner is not editing React. A test enforces this.
- **"Vajana" never appears alone** in a title, meta field, alt text or structured
  data. Always "Vajana by La Bohème".
- **Prefix every component class.** CSS Modules for components; anything
  cross-cutting is global and carries `vj-`.
- **Never name a variable `t` inside the animation loop.** See the note at the top
  of `components/sea/swim.ts`.
- **The depth engine never re-renders.** It writes custom properties and nothing
  else.

## Still open

Three photographs are missing and the build leaves clean slots for them rather
than stand-ins: the chef's portrait, a night table set for a celebration, and the
cellar. Gabriel's quote needs owner sign-off before it ships as a direct quote, and
the last two wine houses want confirming with the sommelier. See
`docs/DECISIONS.md`.
