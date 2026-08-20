# wp-migrate

One-shot importer that pulled the 61 published posts off the WordPress site at
automaticnation.com into `src/content/blog/`.

It is committed and re-runnable rather than deleted, because WordPress keeps
publishing until cutover and a re-run is the cheapest way to pick up late posts.

## Why it's a sibling package

Its own `package.json`, deliberately not referenced by the site's. Eight
dependencies (unified, sharp, …) stay out of the site's `package-lock.json` and
out of CI's `npm ci`, so `npm run check && npm run build` — the whole gate, per
CLAUDE.md — never pays for a tool that doesn't ship. `tsconfig.json` excludes
`tools/` for the same reason.

## Running it

```bash
cd tools/wp-migrate
npm install
npm run migrate                 # convert everything, using the cached WP JSON
npm run migrate:refetch         # re-pull from the WordPress API first
node src/main.mjs --only=<slug> # one post, for debugging a conversion
```

Then, from the repo root: `npm run check && npm run build`.

`cache/` (raw API JSON + downloaded originals) is gitignored — it is a network
cache, not a source of truth. Deleting it costs one re-download.

**Re-running is safe.** `alt-text.mjs` is read on every run and never written to,
so human review work survives a re-migration. That is the whole reason it exists
as a committed file instead of the script writing alt text inline.

## What it does, and the traps it exists to avoid

Each of these was a real bug found while building it, not a hypothetical:

- **`src` often points at a thumbnail.** WordPress puts the original only in
  `srcset` — `airtable-revision-history` had a 300×33 `src` beside the 950 px
  original. Worse, hast renames the attribute to camelCase `srcSet` and parses it
  into an **array**, so reading `properties.srcset` returns `undefined` and
  silently falls back to the thumbnail. `pickLargest()` handles both shapes.
  Where there is no srcset at all (49 of 79 images, all on third-party CDNs),
  `stripResizeSuffix()` tries the un-suffixed original and falls back on a 404.
- **`<p><img></p>` has no text.** An "is this paragraph empty" test based on text
  content deletes the paragraph *and the image inside it*. That silently lost
  images from 25 posts until `hasMedia()` was added.
- **An `<img>` inside an `<li>`** is wrapped in its own `<p>` *within the same
  list item* — lifting it out would renumber a walkthrough's steps.
- **`rehype-remark` drops unhandled nodes silently.** `iframe` and `figure` have
  no default handler, so the 4 video embeds and 2 captioned figures would simply
  vanish. `convert.mjs` gives both explicit handlers, and `assertAllowed()`
  throws on any tag that survives cleaning without styling or a handler.
- **The word-count invariant fails the run if a conversion loses >2% of the
  words.** Note the counter must not strip `<[^>]+>`: prose containing literal
  `<`/`>` (from `&lt;`/`&gt;` — "Path B (if < $10k)") makes that pattern swallow
  real sentences and report an 8.7% loss on a post where nothing was lost.
- **A duplicated hero.** For posts with no `featured_media`, Yoast's `og_image`
  is derived from the first in-content image, so using it would show the same
  picture twice and commit a duplicate webp. Compared with the resize suffix
  stripped, since the two URLs differ only by that.
- **Images are written as `./NN.webp` beside `index.md`**, never into `public/`.
  Astro's pipeline resolves relative markdown images itself, which is what keeps
  the BASE_URL trap out of 79 markdown files. See `src/content.config.ts` for why
  the directory-per-post layout is what makes that work.

Output: ~110 MB of source PNG/JPG became **5.5 MB** of webp capped at 1408 px
(2× the 704 px `--container-prose` measure).

## Reports

`out/` is committed. These are the human to-do list:

| file | what it's for |
| --- | --- |
| `triage.md` | thin posts, missing heroes, the long posts worth review time |
| `alt-todo.tsv` | every image with no alt text → answers go in `alt-text.mjs`. **This is the authoritative list** — `rehype-prose.ts` also warns at build time, but only on a cold markdown render, and `astro check` warms that cache |
| `links-unresolved.tsv` | in-content links whose target has no page here |
| `defects.md` | demoted headings, low-resolution images, dropped links |

## Link rewriting

| WordPress | becomes |
| --- | --- |
| `/{slug}/` where slug is one of the 61 | unchanged — the URLs were preserved |
| `/blog/{slug}/` | `/{slug}/` |
| `/book-a-call/`, `/book-a-call-now/` | `/#book` |
| `//`, `/` | `/` |
| `/blogs/` | `/blogs/` |
| external | unchanged (`target`/`rel` re-added at build by `src/lib/rehype-prose.ts`) |
| anything else internal | **anchor unwrapped, text kept, logged** |

That last row is deliberate: guessing a destination is worse than losing a link,
because a wrong link is invisible and a missing one is in a report.

## Cutover checklist

The migration preserves URLs, but that only becomes true when the site is
actually served from the apex domain:

1. `public/CNAME` contains `automaticnation.com`, and the custom domain is set in
   the repo's GitHub Pages settings.
2. `astro.config.mjs` has `site: 'https://automaticnation.com'` and **no `base`**.
3. `npm run build && npm run preview`, then confirm one post's
   `<link rel="canonical">` matches its live WordPress canonical exactly,
   trailing slash included.
4. `grep -rohE '(href|src)="[^"]*//[^"]*"' dist --include='*.html' | grep -v 'https\?://'`
   returns nothing — a doubled slash silently double-fetches the hero icons.
5. Re-run the migration to pick up anything published since.
6. Point DNS. Keep WordPress serving until the canonicals are verified.

Still outstanding before launch, and **not** this tool's job: `public/og-image.png`
does not exist (every social card 404s), `BOOKING_URL` in `src/lib/site.ts` is
still empty, and the pages `/about-us/`, `/training-sessions/`, `/resource/`, the
two `/resources/` lead magnets and 5 `/testimonials/` URLs are in the live
sitemap with no equivalent here — they will 404 at cutover.
