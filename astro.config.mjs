// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { rehypeProse } from './src/lib/rehype-prose.ts';
import { readdirSync, readFileSync, existsSync } from 'node:fs';

// Post dates for the sitemap's <lastmod>. Read straight off the frontmatter
// because the config runs before content collections exist — same flat-scalar
// parse as seo/check-links.mjs. Only posts get a lastmod: Google ignores the
// field site-wide once it catches it lying, so a page with no real date gets
// none rather than the build time.
const BLOG = 'src/content/blog';
/** @param {string} src @param {string} name */
const field = (src, name) => {
  const m = src.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : undefined;
};
const LASTMOD = new Map();
for (const dir of readdirSync(BLOG, { withFileTypes: true }).filter(d => d.isDirectory())) {
  const file = `${BLOG}/${dir.name}/index.md`;
  if (!existsSync(file)) continue;
  const src = readFileSync(file, 'utf8');
  const published = field(src, 'published');
  if (!published) continue;
  LASTMOD.set(`/${dir.name}/`, {
    date: field(src, 'updated') ?? published,
    // Mirrors isLive() in src/lib/blog.ts. If that changes, change this.
    live: field(src, 'draft') !== 'true' && new Date(published).valueOf() <= Date.now(),
    published,
  });
}
// The index changes exactly when a post goes live, so its lastmod is the
// newest live post's publish date — a real date, not the build time.
const newestLive = [...LASTMOD.values()].filter(p => p.live).map(p => p.published).sort().at(-1);
if (newestLive) LASTMOD.set('/blogs/', { date: newestLive });

// https://astro.build/config
export default defineConfig({
  // The site is served from the apex domain, NOT a project subpath. There is
  // deliberately no `base`: the 61 migrated blog posts have to answer on the
  // same root-level URLs WordPress served them on (/{slug}/), and any base
  // prefix makes that impossible. public/CNAME is what points Pages here.
  site: 'https://automaticnation.com',

  // WordPress served every URL with a trailing slash and every canonical
  // carried one. Keeping 'always' means the canonicals this build emits are
  // byte-identical to the ones search engines already have indexed.
  trailingSlash: 'always',

  // Static output can't send a 301 — Astro emits a meta-refresh page instead.
  // That's weak for link equity, which is exactly why the post URLs were kept
  // at root: only these legacy aliases need it, never a canonical URL.
  redirects: {
    '/blog': '/blogs',
  },

  integrations: [
    sitemap({
      // Keep every meta-refresh stub out: they are noindex, and submitting them
      // would ask Google to crawl pages whose only job is to point at a URL the
      // sitemap already lists. Covers the 61 legacy /blog/{slug}/ aliases and
      // the 14 WordPress URLs that have no equivalent here.
      //
      // These must stay in sync with the stub routes under src/pages/ — a stub
      // that leaks into the sitemap is not a build error, just a bad signal.
      filter: page => {
        const { pathname } = new URL(page);
        const PREFIXES = ['/blog/', '/testimonials/', '/resources/', '/category/', '/author/'];
        const EXACT = ['/about-us/', '/book-a-call-now/', '/training-sessions/', '/resource/'];
        return !PREFIXES.some(p => pathname.startsWith(p)) && !EXACT.includes(pathname);
      },
      // A draft or future post is never built, so it never reaches here — the
      // sitemap already only lists live URLs. seo/indexnow.mjs diffs these
      // lastmods against the deployed sitemap to find what changed.
      serialize: item => {
        const hit = LASTMOD.get(new URL(item.url).pathname);
        return hit ? { ...item, lastmod: hit.date } : item;
      },
    }),
  ],

  markdown: {
    // `markdown.rehypePlugins` is deprecated as of Astro 6.4 — plugins go
    // through `unified()` from @astrojs/markdown-remark and land on
    // `markdown.processor`. Syntax highlighting is NOT part of that options
    // object and stays here.
    processor: unified({
      rehypePlugins: [rehypeProse],
    }),

    // Shiki writes an inline background-color on <pre>, which no layered rule
    // can override — global.css styles the box only. See the note there.
    shikiConfig: { theme: 'github-dark', wrap: false },
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
