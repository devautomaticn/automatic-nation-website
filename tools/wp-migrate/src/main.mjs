import { mkdir, writeFile } from 'node:fs/promises';
import YAML from 'yaml';
import { fetchPosts, heroSource, metaDescription } from './wp.mjs';
import { convert, markdownWordCount } from './convert.mjs';
import { stripResizeSuffix } from './clean.mjs';
import { processImages, isLowRes } from './media.mjs';
import { ALT_TEXT } from '../alt-text.mjs';

const CONTENT = new URL('../../../src/content/blog/', import.meta.url);
const REPORTS = new URL('../out/', import.meta.url);

/** A conversion that loses more than this fraction of the words is a bug, not a trim. */
const MAX_WORD_LOSS = 0.02;

const refetch = process.argv.includes('--refetch');
const only = process.argv.find(a => a.startsWith('--only='))?.slice('--only='.length);

const decodeEntities = s =>
  s.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(Number.parseInt(h, 16)))
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&nbsp;/g, ' ');

const plain = html => decodeEntities(html.replace(/<[^>]+>/g, '')).trim();

const dayOf = d => new Date(d).toISOString().slice(0, 10);

async function main() {
  console.log('Fetching posts…');
  const all = await fetchPosts({ refetch });
  const posts = only ? all.filter(p => p.slug === only) : all;
  if (only && posts.length === 0) throw new Error(`No post with slug "${only}"`);
  console.log(`Converting ${posts.length} post(s).\n`);

  const knownSlugs = new Set(all.map(p => p.slug));

  const imageJobs = [];
  const altTodo = [];
  const unresolvedRows = [];
  const defects = [];
  const written = [];

  for (const post of posts) {
    const slug = post.slug;
    const title = plain(post.title.rendered);
    const description = metaDescription(post);

    const { markdown: body, images, unresolved, notes, wordsBefore: before } =
      await convert(post.content.rendered, { slug, title, knownSlugs });

    for (const img of images) {
      const key = `${slug}/${String(img.index).padStart(2, '0')}`;
      if (!img.alt) altTodo.push({ key, slug, url: img.url });
      imageJobs.push({ ...img, slug, outFile: new URL(`${slug}/${img.name}`, CONTENT) });
    }

    const after = markdownWordCount(body);

    // ── the invariant that catches rehype-remark silently dropping content
    if (before > 0) {
      const lost = (before - after) / before;
      if (lost > MAX_WORD_LOSS) {
        throw new Error(
          `${slug}: conversion lost ${(lost * 100).toFixed(1)}% of the words ` +
          `(${before} -> ${after}). Something was dropped; fix the cleaner before continuing.`,
        );
      }
    }

    // ── hero
    //
    // Skip it when it is the same file as the first in-content image. For the 4
    // posts with no featured_media, heroSource() falls back to Yoast's og_image,
    // and Yoast derives that from the first image in the body — so using it
    // would show the reader the identical picture twice in a row and commit a
    // duplicate webp to git.
    // Compare with the resize suffix stripped: the body image may be recorded
    // as `foo-768x84.png` while Yoast reports the original `foo.png`. They are
    // the same picture and would both resolve to the same file on disk.
    const heroCandidate = heroSource(post);
    const sameImage = (a, b) => (stripResizeSuffix(a) ?? a) === (stripResizeSuffix(b) ?? b);
    const hero =
      heroCandidate && images.some(img => sameImage(img.url, heroCandidate.url))
        ? null
        : heroCandidate;
    if (heroCandidate && !hero) {
      notes.push('no hero: the only candidate was already the first in-content image');
    }
    if (hero) {
      const handAlt = ALT_TEXT[`${slug}/hero`];
      const alt = typeof handAlt === 'string' ? handAlt : hero.alt;
      if (!alt) altTodo.push({ key: `${slug}/hero`, slug, url: hero.url, suggestion: '' });
      imageJobs.push({
        index: 0,
        name: 'hero.webp',
        url: hero.url,
        alt,
        slug,
        outFile: new URL(`${slug}/hero.webp`, CONTENT),
      });
      post.__heroAlt = alt;
    }

    for (const href of unresolved) unresolvedRows.push({ slug, href });
    if (notes.length) defects.push({ slug, notes });

    const published = dayOf(post.date);
    const modified = dayOf(post.modified);
    const frontmatter = {
      title,
      description,
      published,
      ...(modified !== published ? { updated: modified } : {}),
      // heroAlt is written even when empty, so the key is visible in the file
      // and greppable. See the note on heroAlt in src/content.config.ts.
      ...(hero ? { hero: './hero.webp', heroAlt: post.__heroAlt ?? '' } : {}),
      wpId: post.id,
    };

    const file = new URL(`${slug}/index.md`, CONTENT);
    await mkdir(new URL('./', file), { recursive: true });
    await writeFile(
      file,
      `---\n${YAML.stringify(frontmatter).trim()}\n---\n\n${body}\n`,
    );
    written.push({ slug, words: after, images: images.length });
    console.log(`  ✓ ${slug} (${after} words, ${images.length} images)`);
  }

  // ── images
  console.log(`\nDownloading and shrinking ${imageJobs.length} images…`);
  let done = 0;
  const media = await processImages(imageJobs, {
    onProgress: () => {
      done++;
      if (done % 20 === 0) console.log(`  ${done}/${imageJobs.length}`);
    },
  });

  const upgraded = media.filter(m => m.upgraded);
  const lowRes = media.filter(isLowRes);
  const totalBytes = media.reduce((n, m) => n + m.bytes, 0);

  // ── reports
  await mkdir(REPORTS, { recursive: true });
  await writeFile(
    new URL('alt-todo.tsv', REPORTS),
    ['key\tslug\tsource_url', ...altTodo.map(r => `${r.key}\t${r.slug}\t${r.url}`)].join('\n') + '\n',
  );
  await writeFile(
    new URL('links-unresolved.tsv', REPORTS),
    ['slug\tdead_href', ...unresolvedRows.map(r => `${r.slug}\t${r.href}`)].join('\n') + '\n',
  );
  await writeFile(new URL('defects.md', REPORTS), renderDefects(defects, lowRes, unresolvedRows));
  await writeFile(new URL('triage.md', REPORTS), renderTriage(written, media, posts));

  console.log(`
────────────────────────────────────────────────
  posts written      ${written.length}
  images processed   ${media.length}  (${(totalBytes / 1024 / 1024).toFixed(1)} MB total)
  full-res recovered ${upgraded.length}   (src pointed at a thumbnail)
  low-res (<700px)   ${lowRes.length}
  alt text missing   ${altTodo.length}   -> out/alt-todo.tsv
  links dropped      ${unresolvedRows.length}   -> out/links-unresolved.tsv
────────────────────────────────────────────────
`);

  if (altTodo.length > 0) {
    console.log(`Next: fill in alt-text.mjs from out/alt-todo.tsv, then re-run.
Re-running is safe — ALT_TEXT is read, never written.\n`);
  }
}

function renderDefects(defects, lowRes, unresolved) {
  const lines = ['# Migration defects', '', 'Machine-detected. Each needs a human decision.', ''];

  lines.push('## Structural notes', '');
  if (defects.length === 0) lines.push('_None._', '');
  for (const { slug, notes } of defects) {
    lines.push(`- **${slug}**`);
    for (const n of notes) lines.push(`  - ${n}`);
  }

  lines.push('', '## Low-resolution images (<700px, below the 704px prose measure)', '');
  if (lowRes.length === 0) lines.push('_None._', '');
  for (const m of lowRes) {
    lines.push(`- \`${m.slug}/${m.name}\` — ${m.width}px wide, from ${m.sourceUrl}`);
  }

  lines.push('', '## Links dropped (target has no page on the new site)', '');
  if (unresolved.length === 0) lines.push('_None._', '');
  const byHref = new Map();
  for (const { slug, href } of unresolved) {
    if (!byHref.has(href)) byHref.set(href, []);
    byHref.get(href).push(slug);
  }
  for (const [href, slugs] of [...byHref].sort((a, b) => b[1].length - a[1].length)) {
    lines.push(`- \`${href}\` — ${slugs.length}× (${slugs.slice(0, 4).join(', ')}${slugs.length > 4 ? ', …' : ''})`);
  }

  return lines.join('\n') + '\n';
}

function renderTriage(written, media, posts) {
  const byPost = new Map(posts.map(p => [p.slug, p]));
  const heroBySlug = new Set(media.filter(m => m.name === 'hero.webp').map(m => m.slug));
  const rows = written.map(w => ({
    ...w,
    hero: heroBySlug.has(w.slug),
    date: dayOf(byPost.get(w.slug).date),
  }));

  const thin = rows.filter(r => r.words < 400).sort((a, b) => a.words - b.words);
  const noHero = rows.filter(r => !r.hero).sort((a, b) => a.words - b.words);
  const long = rows.filter(r => r.words > 2000).sort((a, b) => b.words - a.words);

  const table = rs =>
    ['| words | hero | published | slug |', '| --- | --- | --- | --- |',
      ...rs.map(r => `| ${r.words} | ${r.hero ? 'yes' : '**no**'} | ${r.date} | \`${r.slug}\` |`)]
      .join('\n');

  return `# Content triage

All ${rows.length} posts were migrated — nothing was dropped. These are the ones
worth a human pass before launch.

## Thin posts (<400 words) — ${thin.length}

Short enough that they compete with each other for the same queries rather than
ranking. Candidates to expand, merge, or leave alone deliberately.

${table(thin)}

## No hero image — ${noHero.length}

Every one of these renders with no image above the fold and a bare OG card.

${table(noHero)}

## The long ones (>2000 words) — ${long.length}

These are the real SEO assets. If review time is limited, spend it here.

${table(long)}

## Known content defects

- \`how-to-build-a-crm-system\` ships placeholder contact details
  (\`sales@mycompany.com\`, \`support@mycompany.com\`) in live copy.
- See \`defects.md\` for demoted headings, low-resolution images and dropped links.
- See \`alt-todo.tsv\` for missing alt text.
`;
}

main().catch(err => {
  console.error(`\n✗ ${err.message}\n`);
  process.exit(1);
});
