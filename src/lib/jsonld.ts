/**
 * schema.org builders. Kept as plain objects rather than a library — there are
 * four shapes and they are all a dozen lines.
 */
import { SITE } from './site';

type Json = Record<string, unknown>;

export function organization(origin: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: origin,
    description: SITE.tagline,
    foundingDate: SITE.founded,
    email: SITE.email,
    ...(SITE.linkedin ? { sameAs: [SITE.linkedin] } : {}),
  };
}

export function webSite(origin: string, lang = 'en'): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: origin,
    inLanguage: lang,
  };
}

/**
 * Rich-result eligibility for the FAQ section. Emit it on ONE url only —
 * two pages carrying the same FAQPage is a duplicate-content signal, which is
 * why Faq.astro takes this behind an opt-in prop.
 */
export function faqPage(items: readonly { q: string; a: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}
