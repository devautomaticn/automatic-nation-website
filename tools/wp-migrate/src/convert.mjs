import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { cleanBody, assertAllowed, wordCount } from './clean.mjs';
import { ALT_TEXT } from '../alt-text.mjs';

/**
 * Serialise attributes for the raw-HTML passthroughs. Only used on tags this
 * module constructs, so the value space is known and controlled.
 */
const attrs = props =>
  Object.entries(props)
    .filter(([, v]) => v !== false && v != null && v !== '')
    .map(([k, v]) => (v === true ? k : `${k}="${String(v).replace(/"/g, '&quot;')}"`))
    .join(' ');

/**
 * hast-util-to-mdast has NO handler for `iframe` and drops an unhandled node
 * without a word — the 4 video embeds would simply vanish. This emits an mdast
 * `html` node, which remark-stringify passes through verbatim (hence
 * allowDangerousHtml below).
 *
 * There is deliberately no `figure` handler. Raw HTML is only safe here because
 * an iframe references a remote URL; a figure wraps a LOCAL image, and raw
 * `<img src="./01.webp">` bypasses Astro's image pipeline and resolves against
 * the post's URL, where nothing exists. clean.mjs unwraps figures into plain
 * images for exactly that reason, and assertAllowed throws if one slips through.
 */
const handlers = {
  iframe(state, node) {
    return {
      type: 'html',
      value:
        `<figure class="article-embed">` +
        `<iframe ${attrs(node.properties ?? {})}></iframe>` +
        `</figure>`,
    };
  },
};

/** Push resolved alt text back onto the img nodes, in document order. */
function applyAlt(tree, images) {
  let i = 0;
  const walk = node => {
    if (node.type === 'element' && node.tagName === 'img') {
      const img = images[i++];
      if (img) node.properties = { ...node.properties, alt: img.alt };
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(tree);
}

/**
 * HTML -> cleaned hast -> markdown, in one processor.
 *
 * The cleaning is an inline plugin between parse and rehype-remark rather than a
 * separate pass, because `.stringify()` does not run transformers — the bridge
 * from hast to mdast only happens inside `.process()`.
 */
export async function convert(html, { slug, title, knownSlugs }) {
  const collected = { images: [], unresolved: [], notes: [], wordsBefore: 0 };

  const file = await unified()
    .use(rehypeParse, { fragment: true })
    .use(() => tree => {
      collected.wordsBefore = wordCount(tree);

      const { images, unresolved, notes } = cleanBody(tree, { slug, title, knownSlugs });

      // Consult the hand-written map before serialising, so real alt text lands
      // in the markdown instead of having to be patched in afterwards.
      for (const img of images) {
        const key = `${slug}/${String(img.index).padStart(2, '0')}`;
        const hand = ALT_TEXT[key];
        if (typeof hand === 'string') img.alt = hand;
      }
      applyAlt(tree, images);

      assertAllowed(tree, slug);

      Object.assign(collected, { images, unresolved, notes });
    })
    .use(rehypeRemark, { handlers })
    .use(remarkGfm)
    .use(remarkStringify, {
      bullet: '-',
      bulletOrdered: '.',
      fence: '`',
      fences: true,
      rule: '-',
      emphasis: '_',
      strong: '*',
      // Without this the iframe/figure html nodes are escaped into visible
      // angle brackets instead of passed through.
      allowDangerousHtml: true,
    })
    .process(html);

  return { markdown: String(file).trim(), ...collected };
}

/**
 * Words in the generated markdown, for the loss invariant in main.mjs.
 *
 * Deliberately conservative about what it strips, because the counter itself was
 * the first thing to produce a false alarm here:
 *
 * - It must NOT strip `<[^>]+>`. Prose containing literal `<` and `>` (from
 *   `&lt;`/`&gt;` — "Path B (if < $10k)") makes that pattern swallow the real
 *   sentence between them, which reported an 8.7% content loss on a post where
 *   cleaning had removed exactly zero words.
 * - It must NOT strip fenced code. The source side counts `<pre><code>` text as
 *   text, so dropping fences here would invent a loss on the 2 posts that have
 *   scripts in them.
 * - Image syntax IS dropped, because alt text is an attribute and the source
 *   side never counted it.
 *
 * The count can legitimately come out HIGHER than the source (table pipes and
 * escapes split tokens), which is why the invariant only ever tests for loss.
 */
export const markdownWordCount = md =>
  md
    // the raw-HTML passthroughs this module emits — the only <> we control
    .replace(/<figure[\s\S]*?<\/figure>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_~`|]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
