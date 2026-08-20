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

/** One migrated post. `url` and `image` must already be absolute — see pageUrl(). */
export function blogPosting(post: {
  url: string;
  title: string;
  description: string;
  published: Date;
  modified?: Date;
  image?: string;
}): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    url: post.url,
    // mainEntityOfPage pins the canonical, which matters here: the posts kept
    // their WordPress URLs, so there are legacy /blog/{slug}/ aliases pointing
    // at them and the schema should agree with <link rel="canonical">.
    mainEntityOfPage: { '@type': 'WebPage', '@id': post.url },
    datePublished: post.published.toISOString(),
    dateModified: (post.modified ?? post.published).toISOString(),
    ...(post.image ? { image: post.image } : {}),
    author: { '@type': 'Organization', name: SITE.name },
    publisher: { '@type': 'Organization', name: SITE.name },
  };
}

/** Trail for a post or the index. Absolute urls, in order, root first. */
export function breadcrumbs(items: readonly { name: string; url: string }[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(({ name, url }, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: url,
    })),
  };
}

/**
 * The listing page's post list. Emit on /blogs/ ONLY — the same one-url rule
 * as faqPage above, for the same duplicate-content reason.
 */
export function blogIndex(
  url: string,
  posts: readonly { url: string; title: string }[],
): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: `${SITE.name} blog`,
    url,
    blogPost: posts.map(p => ({ '@type': 'BlogPosting', headline: p.title, url: p.url })),
  };
}
