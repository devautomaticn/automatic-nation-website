import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

/**
 * Root-level slugs the blog must never claim.
 *
 * The 61 posts answer at `/{slug}/`, so they share the root namespace with
 * every page route. Astro gives a static file route priority over a dynamic
 * one, which means a real `about-us.astro` would silently shadow a post of the
 * same name — no error, the post just stops existing. getStaticPaths throws on
 * a collision instead; this is that list.
 *
 * It includes the WordPress pages still in the live sitemap, because those are
 * the ones most likely to be rebuilt here later.
 */
export const RESERVED_SLUGS: ReadonlySet<string> = new Set([
  // real routes today
  'index', 'blog', 'blogs', 'lp', '404', 'rss.xml', 'robots.txt',
  'sitemap-index.xml', 'sitemap-0.xml',
  // Legacy WordPress URLs, now real routes again as redirect stubs. They were
  // reserved before the stubs existed; now they are reserved because a static
  // route genuinely occupies each of these names.
  'about-us', 'book-a-call', 'book-a-call-now', 'training-sessions',
  'resource', 'resources', 'testimonials', 'category', 'author',
]);

/** Path for a post, with the trailing slash WordPress served. No leading slash — `pageUrl`/`href` add it. */
export const postPath = (id: string): string => `${id}/`;

/**
 * Words per minute for the reading estimate. 220 is the usual figure for
 * skim-reading technical prose; the corpus runs 150–6,181 words.
 */
const WPM = 220;

/**
 * Reading time from the raw markdown. Computed at render, never stored in
 * frontmatter — a stored value goes stale the first time someone edits a post.
 *
 * Strips fences, image/link syntax and heading marks first so a post with a
 * long code block or many URLs isn't inflated.
 */
export const readingTime = (body: string): number => {
  const prose = body
    .replace(/```[\s\S]*?```/g, ' ')      // fenced code
    .replace(/`[^`]*`/g, ' ')             // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')// images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links -> their text
    .replace(/<[^>]+>/g, ' ')             // raw html
    .replace(/[#>*_~|-]/g, ' ');          // markdown punctuation
  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WPM));
};

/**
 * `timeZone: 'UTC'` is load-bearing. WordPress dates are naive wall-clock
 * strings (`2026-03-17T12:44:45`, no offset), so without it a build machine
 * west of Greenwich renders the previous day on every post.
 */
export const formatDate = (date: Date): string =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  }).format(date);

/** ISO date for <time datetime> and JSON-LD. */
export const isoDate = (date: Date): string => date.toISOString();

/** Newest first. */
export const sortByDate = (posts: Post[]): Post[] =>
  [...posts].sort((a, b) => b.data.published.valueOf() - a.data.published.valueOf());

/**
 * Related posts: the most recent, excluding self.
 *
 * Deliberately not similarity-scored. WordPress had one category and zero tags
 * across all 61 posts, so there is nothing to score on — a fake similarity
 * metric would just be recency wearing a hat. Revisit if a real taxonomy lands.
 */
export const related = (posts: Post[], current: Post, count = 3): Post[] =>
  sortByDate(posts).filter(p => p.id !== current.id).slice(0, count);
