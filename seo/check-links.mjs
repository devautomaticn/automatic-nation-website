/**
 * Fails when a LIVE page links to a post that is not live.
 *
 * The pipeline creates this bug on purpose-built rails: `seo-write` adds
 * inbound links from two existing posts to the new one (that is how a new page
 * gets discovered), while `seo-publish` may date the new post a week out. The
 * existing posts are live the moment they merge; the new one is not. For those
 * days, two live pages carry a 404.
 *
 * Markdown cannot be date-gated — `isLive` runs at page render, and the rehype
 * plugin's output is cached across builds, so neither layer can flip a link on
 * the publish date. So this is a gate rather than a fix: inbound links and the
 * post they point at have to go live in the same build, and this is what makes
 * forgetting that a build error instead of a silent dead link on the cron.
 *
 * Run by `npm run check`. Node only, no dependencies, no frontmatter parser —
 * the three fields it needs are flat scalars at the top of the file.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BLOG = 'src/content/blog';
const PAGES = 'src/pages';

/** Flat scalar out of the frontmatter block. Enough for draft/published. */
const field = (src, name) => {
  const m = src.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : undefined;
};

const posts = new Map();
for (const slug of readdirSync(BLOG, { withFileTypes: true }).filter(d => d.isDirectory())) {
  const file = join(BLOG, slug.name, 'index.md');
  if (!existsSync(file)) continue;
  const src = readFileSync(file, 'utf8');
  const published = field(src, 'published');
  posts.set(slug.name, {
    file,
    src,
    // Mirrors isLive() in src/lib/blog.ts. If that changes, change this.
    live: field(src, 'draft') !== 'true' && new Date(published).valueOf() <= Date.now(),
    published,
  });
}

/** Root-level .astro routes are live unconditionally. */
const routes = new Set(
  readdirSync(PAGES).filter(f => f.endsWith('.astro')).map(f => f.replace(/\.astro$/, '')),
);

const problems = [];
for (const [slug, post] of posts) {
  if (!post.live) continue; // a non-live page links to nothing anyone can see
  const links = post.src.matchAll(/\]\(\/([a-z0-9-]+)\/\)/g);
  for (const [, target] of links) {
    if (routes.has(target)) continue;
    const t = posts.get(target);
    if (!t) problems.push(`${slug} → /${target}/  (no such post)`);
    else if (!t.live) {
      problems.push(
        `${slug} → /${target}/  (target is ${t.src.includes('draft: true') ? 'a draft' : `dated ${t.published}`})`,
      );
    }
  }
}

if (problems.length) {
  console.error(`\n[seo] ${problems.length} live page(s) link to a post that is not live:\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error(
    '\nThese URLs 404 for real visitors right now. Either publish the target in this\n' +
    'same build, or hold the inbound links back until the day it goes live.\n',
  );
  process.exit(1);
}

console.log(`[seo] internal links OK (${posts.size} posts, ${[...posts.values()].filter(p => p.live).length} live)`);
