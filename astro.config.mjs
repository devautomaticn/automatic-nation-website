// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import { rehypeProse } from './src/lib/rehype-prose.ts';

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
      // Keep the legacy /blog/{slug}/ meta-refresh stubs out: they are noindex
      // and submitting them would ask Google to crawl 61 pages whose only job
      // is to point at a URL already in the sitemap.
      filter: page => !new URL(page).pathname.startsWith('/blog/'),
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
