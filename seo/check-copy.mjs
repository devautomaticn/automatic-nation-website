/**
 * Fails if pipeline copy contains an em dash (or a stand-in for one).
 *
 * House rule since 2026-09-21: no em dashes in anything the SEO pipeline
 * writes. They read as machine-written, and a voice pass that "keeps them at a
 * moderate rate" kept letting them back in, so this is enforced rather than
 * asked for. The stand-ins are banned too, because the lazy fix for a banned
 * "—" is a " – " or a " - ", which is the same sentence with worse typography.
 *
 * Scope is pipeline copy only, not the 61 migrated WordPress posts:
 *   - a post with no `wpId` was born here, or
 *   - a post with `updated:` on or after the pipeline start was rewritten here.
 * An untouched migrated post can keep its dashes until someone refreshes it,
 * at which point it falls into scope and has to be cleaned.
 *
 * Checks the whole file, frontmatter included: a dash in a title or meta
 * description is the most visible one of all. Code fences are skipped.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const BLOG = 'src/content/blog';
const PIPELINE_START = new Date('2026-09-21');
const BANNED = [
  [/—/, 'em dash'],
  [/–/, 'en dash'],
  [/\s-\s/, 'spaced hyphen used as a dash'],
];

const field = (src, name) => src.match(new RegExp(`^${name}:\\s*(.+)$`, 'm'))?.[1].trim();

const problems = [];
let scoped = 0;
for (const d of readdirSync(BLOG, { withFileTypes: true }).filter(d => d.isDirectory())) {
  const file = join(BLOG, d.name, 'index.md');
  if (!existsSync(file)) continue;
  const src = readFileSync(file, 'utf8');
  const updated = field(src, 'updated');
  const inScope = !field(src, 'wpId') || (updated && new Date(updated) >= PIPELINE_START);
  if (!inScope) continue;
  scoped++;

  let fenced = false;
  src.split('\n').forEach((line, i) => {
    if (line.trim().startsWith('```')) { fenced = !fenced; return; }
    if (fenced) return;
    // A markdown list item or table rule starts with "- " — not a dash in prose.
    const prose = line.replace(/^\s*[-*]\s/, '').replace(/^\|?[\s|:-]+\|?$/, '');
    for (const [re, name] of BANNED) {
      if (re.test(prose)) problems.push(`${file}:${i + 1}  ${name}\n      ${line.trim().slice(0, 110)}`);
    }
  });
}

if (problems.length) {
  console.error(`\n[seo] ${problems.length} banned dash(es) in pipeline copy:\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error('\nRewrite the sentence: a full stop, a colon, a comma, or parentheses.\n' +
                "Don't swap in an en dash or a spaced hyphen; those are banned too.\n");
  process.exit(1);
}
console.log(`[seo] copy OK: no dashes in ${scoped} pipeline post(s)`);
