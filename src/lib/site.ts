/**
 * Site-wide constants. Everything here is content that more than one page or
 * component needs; page-specific copy lives with its page.
 */

export const SITE = {
  name: 'Automatic Nation',
  tagline: 'Custom integrations & automated workflows for teams that want to ship.',
  founded: '2021',
  email: 'mike@automaticnation.com',
  /** Set once a real profile exists; the footer icon is hidden while it's empty. */
  linkedin: '',
  /**
   * Where the footer says the coffee was drunk. Not a city any more: the
   * team is distributed, so naming one office was the wrong claim.
   */
  place: 'planet Earth',
} as const;

/**
 * The cal.com event every call is booked into — the same one the WordPress
 * site used, so migrated /book-a-call-now/ traffic still lands on it.
 *
 * Kept as the bare handle because /book-a-call/ needs it in two shapes: the
 * embed's `calLink`, which takes no origin, and the plain URL the <noscript>
 * fallback links to. Deriving the second from the first is what stops them
 * drifting apart.
 */
const CAL_LINK = 'mike-simmons/45min';

export const CAL = {
  link: CAL_LINK,
  url: `https://cal.com/${CAL_LINK}`,
} as const;

/**
 * Where every "Book a call" CTA points: this site's own booking page, which
 * embeds the cal.com widget — NOT cal.com directly.
 *
 * The CTAs used to hand the visitor to cal.com's origin, which meant the most
 * important step on the site had no URL here to link, rank or measure, and the
 * visitor left the domain before booking anything. /book-a-call/ was already
 * reserved in RESERVED_SLUGS and already linked from the wild; it just had no
 * page. Now it does.
 */
const BOOKING_URL = '/book-a-call/';

/**
 * One definition of where a CTA points. While BOOKING_URL is empty every CTA
 * falls back to jumping to the #book section, so the page is never broken —
 * but only because nothing hardcodes '#book' on its own.
 *
 * `external` is NOT `Boolean(BOOKING_URL)` any more: that was only ever right
 * while the destination was off-site. An internal path opening in a new tab
 * with rel=noopener is wrong, so the test is the scheme, not the presence.
 */
const isOffsite = (u: string) => /^https?:/.test(u);

export const BOOKING = {
  href: BOOKING_URL || '#book',
  external: isOffsite(BOOKING_URL),
} as const;

/** Primary nav. Duplicated into the footer sitemap, which is why it's data. */
export const NAV = [
  { label: 'Use cases', href: '#templates' },
  { label: 'Process', href: '#process' },
  { label: 'FAQ', href: '#faq' },
] as const;

/** Footer sitemap: the nav, the blog, plus a contact jump. */
export const FOOTER_LINKS = [
  ...NAV,
  // Root-relative, not a fragment: the blog is a real page, and without this
  // entry the 61 migrated posts are unreachable from anywhere on the site.
  { label: 'Blog', href: '/blogs/' },
  { label: 'Contact', href: '#book' },
] as const;

// ── The bare-fragment trap ──────────────────────────────────────────────
// Every href above is an in-page fragment, which is correct ONLY on a page
// that actually contains those sections. index.astro does; so does the
// landing page for #process/#faq/#book — and they keep the bare fragments on
// purpose, because smooth-scroll.js only intercepts `a[href^="#"]`, so
// rewriting them to '/#process' would trade a smooth scroll for a page load.
//
// On any OTHER route a bare '#process' resolves against THAT url —
// '/blogs/#process' — and silently goes nowhere. No error, the link just
// does nothing. The blog is the first route to expose this.
//
// So a page that does not own these sections must pass the -AWAY variants to
// <Nav> and <Footer> via their `links` / `cta` props.
// ────────────────────────────────────────────────────────────────────────

const away = (h: string) => (h.startsWith('#') ? `/${h}` : h);

/** NAV for a route that does NOT contain the home page's sections. */
export const NAV_AWAY = NAV.map(({ label, href }) => ({ label, href: away(href) }));

/** FOOTER_LINKS for a route that does NOT contain the home page's sections. */
export const FOOTER_LINKS_AWAY = FOOTER_LINKS.map(({ label, href }) => ({
  label,
  href: away(href),
}));

/** BOOKING for a route that does not contain the #book section. */
export const BOOKING_AWAY = {
  href: BOOKING_URL || '/#book',
  external: isOffsite(BOOKING_URL),
} as const;
