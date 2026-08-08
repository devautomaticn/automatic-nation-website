# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Commands

```bash
npm install        # Node >= 22.12 required (engines field; CI pins Node 22)
npm run dev        # local dev server
npm run build      # static build to dist/
npm run preview    # serve the built dist/ — the only honest way to check BASE_URL
npm run check      # astro check — type-checks every component's props
```

There is no test suite, linter, or formatter, and none should be added. `npm run check`
plus `npm run build` is the gate. Every component declares `interface Props`, so
`astro check` is the type-level test suite this repo would otherwise lack.

## Architecture

Astro 6 static site, built as a template system: a page picks sections and hands each one
its copy.

```
src/
  pages/            one file per page; structure only, ~60 lines
  data/landings/    the copy for each page, as typed objects
  data/process.ts   the delivery timeline, rendered two ways
  layouts/          BaseLayout — <head>, nav, footer, site-wide scripts
  components/
    ui/             Container Section SectionHeader Eyebrow Button Card Chip Metric
    sections/       FeatureGrid UseCases Process Steps Faq CtaStrip ClosingCta Quote
    heroes/         HeroShell + HeroCopy HeroImage HeroForm HeroTetris
    chrome/         Nav Footer
    seo/            Seo
    deco/           TetrominoDeco
  lib/              url site design tetromino hero-assets jsonld
  styles/global.css Tailwind v4 @theme tokens, @layer base, @layer components
  scripts/          tetris.js (the well), smooth-scroll.js (Lenis)
docs/design/tetris-hero/README.md   the written spec for the hero
```

### Adding a landing page

Two files. Copy `src/data/landings/airtable-consulting.ts`, rewrite the strings; copy
`src/pages/lp/airtable-consulting.astro`, pick the sections you want. That page is the
worked example — read it first.

Rules that keep this cheap:

- **Copy goes in `src/data/landings/`, never in the `.astro` file.** Typed objects, not
  JSON: a missing or misspelled field is a build error instead of an empty `<p>` in
  production.
- **Sections are components you import, not a `blocks[]` array in frontmatter.** A generic
  block renderer would collapse every section's props to `Record<string, unknown>` and need
  a parallel schema kept in sync by hand — the exact failure this refactor removed.
- **Default to `HeroCopy`.** `HeroTetris` costs a JS module and fifteen preloaded images;
  a page should only pay that when the well is the point.
- **Never write a raw colour, size, or spacing value in markup.** Use the tokens — see
  below. If a value doesn't exist as a token, add the token.

### Design tokens

Everything visual comes from `@theme` in `global.css`:

- Type: `text-2xs` through `text-2xl` (11–24px; 12–24 are Tailwind's stock steps), plus
  `text-display-sm|md|lg|xl`. **A display step carries size, line-height, tracking and
  weight together** — `<h2 class="text-display-md">` is the whole declaration. Don't add
  `font-bold` or `tracking-*` next to it.
- Spacing: `px-gutter`, `py-section`, `py-section-sm`, `py-section-xs`, `mt-block`,
  `mt-block-sm`. Don't reintroduce `py-24`-style values for section rhythm.
- Radius: `rounded-chip|cell|control|card|panel|pill`.
- Containers: `max-w-page|narrow|prose`.
- Colour: `ink paper mute dim faint line line-hi line-dk accent`, plus
  `piece-yellow|blue|red|orange|green` (the brand palette; `accent` is the yellow).

`--spacing` itself must never be redefined — it is v4's 0.25rem multiplier behind every
`p-1`…`p-96`, and overriding it silently rescales the site.

### Tailwind v4, and the layer trap

Tailwind is a **build step** (`@tailwindcss/vite`), configured CSS-first: the palette and
fonts are `@theme` custom properties at the top of `global.css`, not a `tailwind.config.js`.
There is no config file on disk and there should not be one. Token keys are kebab-case —
`--color-line-dk` is what generates `border-line-dk`.

**Every rule in `global.css` must stay inside an `@layer`.** Tailwind v4 emits its utilities
inside cascade layers, and unlayered CSS beats every layered rule regardless of specificity.
An unlayered `* { margin: 0 }` silently cancels every `p-*`, `m-*`, and `gap-*` on the page —
no error, the site just loses its spacing. This has bitten the repo twice; the comment at
`global.css:51-57` is the long version.

The same trap has a second face: **never name a component class inside a Tailwind namespace**
(`.text-*`, `.p-*`, `.leading-*`, `.rounded-*`…). v4 mints `leading-95` as a real utility of
`calc(0.25rem × 95)` ≈ 380px, which is why the old `.h2-display` helper had to be deleted.

Prefer adding a token in `@theme` over adding a class in `@layer components` — theme keys emit
as *utilities*, which can't lose the layer fight.

### Deployment and the BASE_URL trap

GitHub Pages via `.github/workflows/deploy.yml` on push to `main`. `astro.config.mjs` sets
`base: '/automatic-nation-website'`, so **the site is not served from the domain root**. Any
path to a `public/` asset needs the base prefix or it 404s in production while working fine
in `npm run dev`.

**`src/lib/url.ts` is the only place this is handled.** Use `asset('logos/n8n.svg')` for
anything under `public/`, `href()` for a link, `absolute()` for canonical/OG. Never
concatenate `import.meta.env.BASE_URL` by hand — that is what produced the four divergent
copies this replaced.

The one place the base crosses into client code: `tetris.js` reads it from `data-base` on
`.dot-card`, already normalised. That normalisation must stay exact — the preload URL and
the runtime `img.src` have to match character-for-character or the browser fetches all 15
hero icons twice. A stray `//` produces a working page that is merely slower: no error,
nothing in CI. `grep` the built HTML for `//` after any change here.

Also note `Astro.site` is the bare origin with no base, so `new URL(path, Astro.site)`
silently drops it. `Seo.astro` is the only component that absolutises URLs; leave it that way.

Verify asset-path changes with `npm run build && npm run preview`, never `dev` alone.

### The hero

`src/scripts/tetris.js` drops tetrominoes of logo tiles and brand-colour blocks on a 10×10
grid inside `.dot-card`. Pure grid collision, no physics engine — a piece can't drift out of
its column. Full rows flash and collapse; the stack settles at `holdDepth` and holds; the
board re-deals.

- The engine works in a fixed 608px design space (`size: 608` → 61px cells) and scales via
  `ResizeObserver`. `.dot-card`'s `max-width: 608px` is part of that contract — changing it
  desyncs the guide lines from the cells.
- The tile list is `src/lib/hero-assets.ts`, used by both the engine and the preload tags.
  One list — adding an icon is a one-line change.
- Palette, shapes and the fused-corner radius rule are `src/lib/tetromino.ts`, shared with
  the static decorations in `ClosingCta`. The `SHAPE_LIST` **order is load-bearing**: the
  hero runs off a fixed seed, so reordering it changes the tuned piece sequence.
- **`HeroTetris` cannot emit its own preload tags.** Astro doesn't hoist `<head>` content
  out of nested components, and a preload discovered in `<body>` has already lost the race.
  A page using `HeroTetris` must also pass `preloadImages={HERO_ASSETS}` to `BaseLayout` —
  see `src/pages/index.astro`.
- The boot script is *not* `is:inline` — it needs Astro's bundling to resolve the import.
  That became safe when the Matter.js CDN tag was removed; the old `is:inline` everywhere was
  about execution order against that tag.
- It lives in `HeroTetris.astro`, separate from the layout's smooth-scroll script, so pages
  without a well don't pull the engine's module graph. Verified in `dist/`; keep it that way.

Design intent — motion timings, tile treatment, grid pitch — is specified in
`docs/design/tetris-hero/README.md`. Read it before changing how the well looks or moves.

## Repo conventions

- `public/logos/` contains files with doubled extensions (`Symbol.svg.svg`,
  `Google Gemini.svg.svg`). These names are referenced verbatim from `src/lib/hero-assets.ts`.
  **Don't "fix" them.**
- `.gitignore` anchors root-level asset duplicates with a **leading slash** (`/logos/`,
  `/image.png`) so the patterns don't also match the real assets under `public/`. Those
  `public/` copies must stay committed or the deployed build 404s.
- Every component writes `Astro.props as Props` rather than a `: Props` annotation. See the
  comment in `src/lib/design.ts` — Astro's own inference is unreliable here, and the cast
  costs nothing: callers are still checked by the generated component types.
- Comments in `global.css` and the components document decisions that were arrived at by
  getting them wrong first. When you move code, move its comment with it.
- FAQ JSON-LD is emitted by the *page*, not by `Faq.astro`, because it must appear on exactly
  one URL. Two landings reusing the same FAQ copy must not both emit it.

## Unfinished copy

Intentional placeholders, not bugs — but they must be filled before a real launch:

- `BOOKING_URL = ''` in `src/lib/site.ts`. Every CTA falls back to `#book` while it's empty —
  which works only because nothing hardcodes `#book` on its own. Keep it that way.
- `SITE.linkedin` and `SITE.city` in the same file. The footer hides the LinkedIn icon
  entirely until a real URL exists, rather than linking to `#`.
- The client quote in `src/data/landings/home.ts` (`[CLIENT QUOTE …]`, `[Name]`, `[Role]`,
  `[Company]`) and `[FILL IN RANGE]` in the pricing FAQ.
- `public/og-image.png` is referenced by the OG tags but **does not exist**, so every social
  card 404s today. Ship a static 1200×630 PNG; don't add a runtime OG generator.
