/**
 * Site-wide constants. Everything here is content that more than one page or
 * component needs; page-specific copy lives with its page.
 */

export const SITE = {
  name: 'Automatic Nation',
  tagline: 'Custom integrations & automated workflows for teams that want to ship.',
  founded: '2021',
  email: 'hello@automaticnation.com',
  /** Set once a real profile exists; the footer icon is hidden while it's empty. */
  linkedin: '',
  city: 'Buenos Aires',
} as const;

/**
 * Scheduling link for every "Book a call" CTA. This is the same cal.com
 * event the WordPress site booked into, so migrated /book-a-call-now/
 * traffic lands exactly where it used to.
 */
const BOOKING_URL = 'https://cal.com/mike-simmons/45min';

/**
 * One definition of where a CTA points. While BOOKING_URL is empty every CTA
 * falls back to jumping to the #book section, so the page is never broken —
 * but only because nothing hardcodes '#book' on its own.
 */
export const BOOKING = {
  href: BOOKING_URL || '#book',
  external: Boolean(BOOKING_URL),
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
  external: Boolean(BOOKING_URL),
} as const;
