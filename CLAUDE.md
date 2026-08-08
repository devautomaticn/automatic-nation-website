# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Commands

```bash
npm install        # Node >= 22.12 required (engines field; CI pins Node 22)
npm run dev        # local dev server
npm run build      # static build to dist/
npm run preview    # serve the built dist/ — the only honest way to check BASE_URL
```

There is no test suite, linter, or formatter, and none should be added. `npm run build` is
the verification gate; CI runs exactly `npm ci && npm run build`.

## Architecture

Astro 6 static site. `src/pages/index.astro` is the landing page; `src/styles/global.css`
holds every style; `src/scripts/` holds the two client modules.

```
src/
  pages/index.astro     markup + page data in frontmatter
  styles/global.css     Tailwind v4 @theme tokens, @layer base, @layer components
  scripts/tetris.js     the hero's tetromino well (ES module, no dependencies)
  scripts/smooth-scroll.js  Lenis wrapper
docs/design/tetris-hero/README.md   the written spec for the hero
```

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

Two mechanisms carry the base, and both must keep working:

1. Frontmatter reads `import.meta.env.BASE_URL` and strips the trailing slash into
   `basePrefix`, used for the `<link rel="preload">` tags.
2. `tetris.js` gets the base at runtime from `data-base` on `.dot-card`.

The trailing-slash strip is duplicated on both sides **on purpose**: the preload URL and the
runtime `img.src` must match character-for-character, or the browser fetches all 15 hero icons
twice. A stray `//` produces a working page that is merely slower — no error, nothing in CI.

Verify asset-path changes with `npm run build && npm run preview`, never `dev` alone.

### The hero

`src/scripts/tetris.js` drops tetrominoes of logo tiles and brand-colour blocks on a 10×10
grid inside `.dot-card`. Pure grid collision, no physics engine — a piece can't drift out of
its column. Full rows flash and collapse; the stack settles at `holdDepth` and holds; the
board re-deals.

- The engine works in a fixed 608px design space (`size: 608` → 61px cells) and scales via
  `ResizeObserver`. `.dot-card`'s `max-width: 608px` is part of that contract — changing it
  desyncs the guide lines from the cells.
- `LOGOS` / `PHOTOS` in `tetris.js` are mirrored by hand into `heroAssets` in
  `index.astro`'s frontmatter, which generates the preload tags. **Adding or renaming a hero
  icon means editing both.**
- The boot script is *not* `is:inline` — it needs Astro's bundling to resolve the import.
  That became safe when the Matter.js CDN tag was removed; the old `is:inline` everywhere was
  about execution order against that tag.

Design intent — motion timings, tile treatment, grid pitch — is specified in
`docs/design/tetris-hero/README.md`. Read it before changing how the well looks or moves.

## Repo conventions

- `public/logos/` contains files with doubled extensions (`Symbol.svg.svg`,
  `Google Gemini.svg.svg`). These names are referenced verbatim from `tetris.js`. **Don't
  "fix" them.**
- `.gitignore` anchors root-level asset duplicates with a **leading slash** (`/logos/`,
  `/image.png`) so the patterns don't also match the real assets under `public/`. Those
  `public/` copies must stay committed or the deployed build 404s.
- Comments in `index.astro` and `global.css` document decisions that were arrived at by
  getting them wrong first. When you move code, move its comment with it.

## Unfinished copy

Intentional placeholders, not bugs — but they must be filled before a real launch:
`BOOKING_URL = ''` in `index.astro` frontmatter (every CTA falls back to `#book` while it's
empty), `[CLIENT QUOTE …]` and `— [Name], [Role] · [Company]` in the use-cases section,
`[FILL IN RANGE]` in the pricing FAQ, `[CITY]` and the placeholder LinkedIn `href="#"` in the
footer. `public/og-image.png` is referenced by the OG tags but does not exist yet, so social
cards currently 404.
