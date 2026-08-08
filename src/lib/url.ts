/**
 * The single place the deployment base is normalised.
 *
 * The site is served from a sub-path (`base` in astro.config.mjs), so nothing
 * that points at `public/` may be written as a root-relative path — it works in
 * `npm run dev` and 404s in production.
 *
 * BASE_URL always carries a trailing slash. Stripping it here, once, is what
 * keeps the `<link rel="preload">` URLs and the runtime `img.src` values
 * byte-identical: a stray `//` produces a page that still works but fetches
 * every hero icon twice, with no error and nothing in CI to catch it.
 *
 * This replaced four hand-written copies of the same three lines.
 */
export const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');

/** Schemes and fragments that must never be prefixed. */
const EXTERNAL = /^(https?:|mailto:|tel:|#|\/\/)/;

/** A file under `public/` → its deployed path. Pass 'logos/n8n.svg', not '/logos/n8n.svg'. */
export const asset = (path: string): string => `${BASE}/${path.replace(/^\/+/, '')}`;

/** An href for the markup: prefixes internal paths, leaves external ones alone. */
export const href = (path: string): string =>
  EXTERNAL.test(path) ? path : asset(path);

/**
 * Absolute URL for canonical / OG tags. `Astro.site` is the bare origin, so the
 * base has to be added here — `new URL('/', Astro.site)` silently drops it and
 * points every canonical at a path that doesn't exist.
 */
export const absolute = (path: string, site: URL | undefined): string =>
  new URL(asset(path), site ?? 'https://devautomaticn.github.io').href;
