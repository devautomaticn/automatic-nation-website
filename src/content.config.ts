import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
// Direct from zod, not the `z` re-export from 'astro:content' — that re-export
// is deprecated in Astro 6 and goes away in 7. Astro itself is on zod v4.
import { z } from 'zod';

/**
 * The blog, migrated from WordPress (see tools/wp-migrate/).
 *
 * ── Why markdown, when CLAUDE.md says copy lives in src/data as typed objects
 *
 * That rule exists for the failure it names: a missing field should be a BUILD
 * ERROR, not an empty <p> in production. The mechanism it wants is schema
 * enforcement, and the thing it forbids is `blocks[]`.
 *
 * A prose body hits neither. A landing page's copy is a fixed set of named
 * slots where a typo is a silent hole; a 6,181-word article body is one field
 * with nothing for a type to check beyond "is a string". The frontmatter below
 * IS the typed object, and zod fails the build exactly as `satisfies` does in
 * src/data/landings/. Meanwhile the alternative — 82,000 words as TS template
 * literals, or an array of paragraph/heading/table objects — is precisely the
 * generic block renderer CLAUDE.md forbids, applied to 1,673 paragraphs.
 *
 * So: the exception is the body only. The frontmatter stays validated.
 *
 * ── Why a directory per post
 *
 * `{slug}/index.md` and not `{slug}.md`: the glob loader's default id strips a
 * trailing `/index` (astro/dist/content/loaders/glob.js -> getContentEntryIdAndSlug,
 * `.replace(/\/index$/, '')`), so the DIRECTORY NAME IS THE ID IS THE URL. That
 * lets the post's images sit beside it and be referenced as `./01.webp` —
 * relative paths Astro's image pipeline resolves itself, which is the whole
 * reason the BASE_URL trap cannot bite the 79 migrated images.
 *
 * Renaming a directory silently changes an indexed URL. Don't.
 */
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/index.md' }),
  schema: ({ image }) =>
    z
      .object({
        /** WordPress `title.rendered`. The <h1> and the <title>. */
        title: z.string().min(1),

        /**
         * The Yoast meta description — hand-written on all 61 posts, longest 158
         * chars. NOT `excerpt.rendered`, which is WordPress's run-on auto-excerpt.
         *
         * The cap is deliberate: past ~160 Google truncates it, so an over-long
         * one is a silent quality bug. Fail the build instead.
         */
        description: z.string().min(1).max(160),

        /** WordPress `date`. */
        published: z.coerce.date(),
        /** WordPress `modified`, omitted when it equals `published`. */
        updated: z.coerce.date().optional(),

        /**
         * featured_media, falling back to Yoast's og_image. Co-located, so this
         * is always './hero.webp'.
         */
        hero: image().optional(),

        /**
         * Empty is allowed, and that is a deliberate choice rather than an
         * oversight. WordPress shipped 94 of its 148 media items with no alt
         * text; making this required would block the entire migration behind a
         * copywriting pass, and filling it with a generated pseudo-caption
         * ("screenshot of Airtable") is worse than empty for a screen-reader
         * user, who can at least skip an empty one.
         *
         * The audit lives in tools/wp-migrate/out/alt-todo.tsv, and
         * src/lib/rehype-prose.ts warns per build for body images, so the count
         * is visible and can trend to zero. Same treatment for both, on purpose.
         */
        heroAlt: z.string().default(''),

        draft: z.boolean().default(false),

        /** Provenance, so a re-run of the migration can match posts up. */
        wpId: z.number().int(),
      }),
});

// No `category` / `tags`: WordPress had all 61 posts in one category and zero
// tags, so a taxonomy field would be a schema that only ever holds one value.
// Add it when there is real editorial intent to model — related-posts falls
// back to recency until then (src/lib/blog.ts).
export const collections = { blog };
