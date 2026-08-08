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
  /** Filled in before launch — see [CITY] in the footer. */
  city: '',
} as const;

// ── FILL IN BEFORE LAUNCH ───────────────────────────────────────────────
/** Scheduling link for every "Book a call" CTA (Calendly, Cal.com, …). */
const BOOKING_URL = '';
// ────────────────────────────────────────────────────────────────────────

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

/** Footer sitemap: the nav plus a contact jump. */
export const FOOTER_LINKS = [
  ...NAV,
  { label: 'Contact', href: '#book' },
] as const;
