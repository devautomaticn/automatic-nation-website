/**
 * The single place the deployment base is normalised.
 *
 * The site is served from the apex domain with no `base` (see astro.config.mjs),
 * so BASE is the empty string today and these helpers are pass-throughs that add
 * a leading slash. They are still the only sanctioned way to build a path: the
 * base existed once, may exist again on a preview deploy, and four hand-written
 * copies of the same three lines is what this replaced.
 *
 * BASE_URL always carries a trailing slash. Stripping it here, once, is what
 * keeps the `<link rel="preload">` URLs and the runtime `img.src` values
 * byte-identical: a stray `//` produces a page that still works but fetches
 * every hero icon twice, with no error and nothing in CI to catch it.
 */
export const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Schemes and fragments that must never be prefixed. */
const EXTERNAL = /^(https?:|mailto:|tel:|#|\/\/)/;

/** The production origin. Only the fallback when `Astro.site` is somehow unset. */
const ORIGIN = 'https://automaticnation.com';

/** A file under `public/` → its deployed path. Pass 'logos/n8n.svg', not '/logos/n8n.svg'. */
export const asset = (path: string): string => `${BASE}/${path.replace(/^\/+/, '')}`;

/** An href for the markup: prefixes internal paths, leaves external ones alone. */
export const href = (path: string): string =>
  EXTERNAL.test(path) ? path : asset(path);

/**
 * Absolute URL for an ASSET (og:image, and anything else under `public/`).
 * `Astro.site` is the bare origin, so the base has to be added here —
 * `new URL('/', Astro.site)` silently drops it.
 *
 * Do NOT use this for a page URL: assets must not gain a trailing slash.
 * See `pageUrl`.
 */
export const absolute = (path: string, site: URL | undefined): string =>
  new URL(asset(path), site ?? ORIGIN).href;

/**
 * Absolute URL for a PAGE — canonical and og:url.
 *
 * Separate from `absolute` because of the trailing slash, and the slash is not
 * cosmetic. `trailingSlash: 'always'` governs how Astro *routes*, but it does
 * not touch a string built here, so this used to emit
 * `…/lp/airtable-consulting` while the page answers at `…/lp/airtable-consulting/`
 * — a canonical pointing one redirect away from itself.
 *
 * It matters most for the migrated blog: WordPress served every post as
 * `/{slug}/` and every canonical carried the slash, so dropping it would hand
 * search engines 61 canonicals that disagree with what they have indexed.
 */
export const pageUrl = (path: string, site: URL | undefined): string => {
  const p = asset(path);
  return new URL(p.endsWith('/') ? p : `${p}/`, site ?? ORIGIN).href;
};
