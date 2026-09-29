// Renders every seo/illustrations/{slug}/NN.html to src/content/blog/{slug}/NN.webp.
//
//   node seo/illustrations/render.mjs            all of them
//   node seo/illustrations/render.mjs {slug}     one post
//
// The HTML is the source of truth; the .webp is a build artefact that is
// committed because post images must sit beside index.md (see CLAUDE.md).
// Each page sets its own size with --w / --h on :root, and carries its alt
// text in <meta name="alt"> so the markdown and the source never drift.
// Uses the local Google Chrome in headless mode, so there is no browser
// dependency to install; sharp is already in node_modules via Astro.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, mkdtempSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const here = dirname(fileURLToPath(import.meta.url));
const blog = resolve(here, '../../src/content/blog');
const only = process.argv[2];
const tmp = mkdtempSync(join(tmpdir(), 'illus-'));

for (const slug of readdirSync(here, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name)) {
  if (only && slug !== only) continue;
  if (!existsSync(join(blog, slug))) throw new Error(`no post directory for ${slug}`);
  for (const file of readdirSync(join(here, slug)).filter(f => f.endsWith('.html'))) {
    const src = join(here, slug, file);
    const html = readFileSync(src, 'utf8');
    const w = +html.match(/--w:\s*(\d+)px/)[1];
    const h = +html.match(/--h:\s*(\d+)px/)[1];
    const png = join(tmp, `${slug}-${file}.png`);
    execFileSync(CHROME, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars',
      '--force-device-scale-factor=2', `--window-size=${w},${h}`,
      '--virtual-time-budget=5000', // lets the Google Fonts load
      `--screenshot=${png}`, `file://${src}`,
    ], { stdio: 'ignore' });
    const out = join(blog, slug, file.replace(/\.html$/, '.webp'));
    await sharp(png).resize(w * 2, h * 2, { fit: 'cover', position: 'top' }).webp({ quality: 88 }).toFile(out);
    console.log(`${slug}/${file} → ${out.replace(blog + '/', '')}`);
  }
}
