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
                    [slug].astro = the 61 blog posts, at ROOT level
  content/blog/     one directory per post: index.md + its images
  content.config.ts the blog collection's zod schema
  data/landings/    the copy for each page, as typed objects
  data/process.ts   the delivery timeline, rendered two ways
  layouts/          BaseLayout — <head>, nav, footer, site-wide scripts
                    RedirectStub — meta-refresh for legacy URLs
  components/
    ui/             Container Section SectionHeader Eyebrow Button Card Chip Metric
    sections/       FeatureGrid UseCases Process Steps Faq CtaStrip ClosingCta Quote
    heroes/         HeroShell + HeroCopy HeroImage HeroForm HeroTetris
    blog/           PostCard PostMeta RelatedPosts
    chrome/         Nav Footer
    seo/            Seo
    deco/           TetrominoDeco
  lib/              url site design tetromino hero-assets jsonld blog rehype-prose
  styles/global.css Tailwind v4 @theme tokens, @layer base, @layer components
  scripts/          tetris.js (the well), smooth-scroll.js (Lenis)
tools/wp-migrate/   the one-shot WordPress importer — sibling package, own deps
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

### The blog, and the root namespace

61 posts were migrated from WordPress. **They answer at root-level URLs —
`/{slug}/`, not `/blog/{slug}/`** — because that is where they ranked for up to
two years, and GitHub Pages cannot serve a 301 to move them (only meta-refresh,
which passes link equity poorly). All 61 canonicals are byte-identical to the
WordPress ones, trailing slash included.

The consequences, which are not optional:

- **The root namespace belongs to the blog.** A new page at
  `src/pages/pricing.astro` would silently shadow a post with slug `pricing` —
  Astro gives static routes priority, so the post just stops being built, with no
  error. `RESERVED_SLUGS` in `src/lib/blog.ts` plus a `throw` in
  `[slug].astro`'s `getStaticPaths` turns that into a named build failure.
  **New marketing pages go under a prefix (`/lp/`, `/services/`); any new
  root-level page must be added to `RESERVED_SLUGS`.**
- **The post route is `[slug].astro`, never `[...slug].astro`.** A rest parameter
  at the root would also try to match `lp/airtable-consulting`.
- **The body is markdown; the frontmatter is a zod schema.** This does not
  contradict "copy goes in `src/data/` as typed objects" — that rule wants a
  missing field to be a *build error*, and zod delivers exactly that. It targets
  *structured slots*; an 82,000-word prose body is the case markdown is for. The
  long version is the comment at the top of `src/content.config.ts`.
- **Post images live beside `index.md` and are referenced as `./01.webp`.**
  A directory per post is what makes that work: the glob loader strips a trailing
  `/index` from the id, so the directory name is the id is the URL. Relative
  markdown images are resolved by Astro's own pipeline, which is the only reason
  the BASE_URL trap cannot reach the 79 migrated images. **Never put post images
  in `public/`** — nothing there can call `asset()` from inside a markdown file.
- **Renaming a post directory changes an indexed URL.** Don't.
- **Every page must render a `#book` target.** `BOOKING.href` falls back to
  `'#book'` while `BOOKING_URL` is empty, so a page without one has a dead nav
  CTA and dead migrated booking links.
- **A page that does not contain the home page's sections must pass the `-AWAY`
  link variants** (`NAV_AWAY`, `FOOTER_LINKS_AWAY`, `BOOKING_AWAY`) to
  `BaseLayout`. `NAV`'s hrefs are bare fragments, correct only on a page that
  owns those sections; elsewhere `#process` resolves against the current URL and
  silently goes nowhere. `src/lib/site.ts` has the full note.

`tools/wp-migrate/README.md` documents the importer and the cutover checklist.
Re-running it is safe: `alt-text.mjs` is read, never written, so review work
survives a re-migration.

### Prose typography

Markdown bodies are styled by **one class, `.article-body`**, in
`@layer components`. Not `@tailwindcss/typography`: it ships its own scale and
colour ramp, and matching it to the `@theme` tokens takes more `prose-*`
overrides than writing the ~120 lines outright.

It only works *because* it is in `@layer components`: `@layer base` sets
`* { margin: 0 }`, and components is a later layer, so these rules win on layer
order alone. Move the block out of the layer and every article collapses into a
zero-rhythm wall of text, with no error.

Two things it must not fight:

- **Shiki writes an inline `background-color` on `<pre>`.** An inline style beats
  every layered rule — the layer trap from the other direction. Style the box
  (radius, padding, scroll) and let Shiki own the fill.
- **Tables can be 9 columns wide** against a 704px measure, so the horizontal
  scroll lives on a `.article-scroll` wrapper that `src/lib/rehype-prose.ts`
  injects at build time. A `<table>` cannot scroll itself.

`src/lib/rehype-prose.ts` also adds `target="_blank" rel="noopener"` to external
links (one rule instead of the 219 attributes the migration stripped) and warns
per build on images with no alt text. It **warns rather than throws** on purpose:
WordPress shipped 94 of 148 images with empty alt, and a hard failure would block
the whole migration behind a copywriting pass. Generated pseudo-alt would be
worse than empty — a screen-reader user can skip an empty one.

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

GitHub Pages via `.github/workflows/deploy.yml` on push to `main`, at the **apex domain**:
`site: 'https://automaticnation.com'`, **no `base`**, `public/CNAME`. The project-subpath
`base: '/automatic-nation-website'` was removed when the blog was migrated — a base prefix
makes it impossible for the 61 posts to answer on the URLs they ranked on.

So `BASE` is the empty string today, and `asset('logos/n8n.svg')` yields `/logos/n8n.svg`.
The helpers are still the only sanctioned way to build a path: the base existed once and
could return on a preview deploy, and four hand-written copies of the same three lines is
what they replaced.

**Pushing requires DNS and the Pages custom domain to be configured first** — see the
cutover checklist in `tools/wp-migrate/README.md`.

`trailingSlash: 'always'`, because WordPress served every URL with one and every canonical
carried it. Note that setting governs *routing* only; it does not touch a URL string built
in `src/lib/url.ts`. That is why **`pageUrl()` exists alongside `absolute()`** — a page URL
needs the trailing slash, an asset URL must not have one. Using `absolute()` for a canonical
emits a self-canonical pointing one redirect away from itself.

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
  one URL. Two landings reusing the same FAQ copy must not both emit it. The same rule governs
  the blog: `blogIndex()` is emitted only by `blogs.astro`.
- `tools/` is excluded from `tsconfig.json`. The WordPress importer is a sibling package with
  its own dependencies and must stay out of the `npm run check` gate.

## Unfinished copy

Most of the launch placeholders are filled. What is left:

- `SITE.linkedin` in `src/lib/site.ts`. The footer hides the icon entirely until a real URL
  exists, rather than linking to `#`. Safe to leave empty.
- **7 in-content links were dropped**, all pointing at the two `/resources/` lead magnets that
  have no page here. See `tools/wp-migrate/out/links-unresolved.tsv`. The URLs now answer with
  a redirect stub, but the magnets themselves were not rebuilt, so the links stay unwritten.
- `tools/wp-migrate/out/triage.md` lists the 12 posts under 400 words and the 25 with no hero
  image — a content decision, not a bug.

### Settled, so don't "fix" them back

- **`BOOKING_URL` is `https://cal.com/mike-simmons/45min`** — the same cal.com event the
  WordPress site booked into. The `#book` fallback still exists and every page still renders
  a `#book` target, because the footer's Contact link and the migrated in-content links both
  point at it.
- **The pricing FAQ carries no number, on purpose.** It explains that the figure comes after
  the first call. Re-adding a public range is a business decision, not a missing value.
- **The home quote is Ryan Alexander's**, carried over verbatim from the live
  `/testimonials/ryan-alexander-ceo-permaplant/` page.
- **`SITE.city` is Buenos Aires.**
- **`public/og-image.png` exists** — a static 1200×630 card, no runtime generator. It uses the
  real wordmark, not a font-rendered title, so it does not depend on Space Grotesk being
  installed anywhere.
- **The icons are the site's own mark** — the same path `Nav.astro` renders in the header,
  which is the **only vector source for it**. `public/favicon.svg` used to be Astro's stock
  logo. The OG card uses the same mark plus the wordmark, so the header, the tab and the
  social card are one lockup. Don't reintroduce the WordPress wordmark here: it is the old
  logo, and a two-word lockup is an illegible smudge at the 16px a tab actually renders.
- **All 55 images with no alt text are answered** in `tools/wp-migrate/alt-text.mjs`, which the
  importer reads on every run. 21 carry a real description; **34 are deliberately empty** —
  they are title cards whose only content is the post title, and `[slug].astro` renders that
  same title as the `<h1>` directly above them, so alt text would make a screen reader say it
  twice. The long version is the comment in `alt-text.mjs`. Note `rehype-prose.ts` only warns
  on a *cold* markdown render: `astro check` warms the cache, so verify with
  `rm -rf .astro && npm run build`.
- **The 14 orphaned WordPress URLs are redirect stubs**, not 404s — `/about-us/`,
  `/book-a-call-now/`, `/training-sessions/`, `/resource/`, `/resources/` and its two lead
  magnets, the five `/testimonials/`, `/category/blog/` and `/author/admin/`. They are
  excluded from the sitemap by the filter in `astro.config.mjs`, which **must stay in sync
  with the stub routes** — a stub that leaks into the sitemap is not a build error.
  `/feed/` is deliberately NOT stubbed: a meta-refresh cannot move an RSS reader, so a stub
  there would only look like a fix. See `docs/cutover/README.md` §3.
- **The host is GitHub Pages, and that was chosen with the redirect limitation known.**
  Cloudflare Pages was evaluated on 2026-08-23 and deliberately not taken. It would buy
  real 301s via `_redirects` — which GitHub Pages can never serve — but on this domain it
  requires moving the **whole DNS zone** to Cloudflare, including the five Google Workspace
  MX records, the SPF TXT and both `google-site-verification` TXTs. That is a materially
  bigger change than pointing four A records, and its rollback is hours instead of ten
  minutes. The deciding argument: **a host move does not change URLs, so it carries no SEO
  cost and can be done any time.** Revisit it when the lack of a 301 actually blocks
  something — consolidating two posts, fixing a slug, or shipping the `/resources/` lead
  magnets as PDFs (a PDF cannot carry an HTML canonical, and Pages cannot send the header).
- **Setting `public/CNAME` does NOT set the Pages custom domain here.** That auto-set only
  happens with the classic branch deploy; this repo uses `build_type: workflow`. Verified
  on 2026-08-23: the `CNAME` file was served correctly while the Pages setting still read
  `"cname": null`. It has to be set explicitly, in Settings → Pages or via
  `gh api -X PUT repos/devautomaticn/automatic-nation-website/pages -f cname=…`.
