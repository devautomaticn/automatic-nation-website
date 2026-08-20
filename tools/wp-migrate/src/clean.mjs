import { WP_ORIGIN } from './wp.mjs';

/**
 * Tree surgery on a WordPress post body, before it becomes markdown.
 *
 * This is the bulk of the migration. Doing it on the hast tree — one parse, one
 * tree — rather than as string rules is the whole reason unified was chosen over
 * turndown: every fix below is an attribute edit or a child-array splice on the
 * same tree the serialiser then walks, and the allowlist check at the end can
 * therefore prove nothing unexpected survived.
 */

/** Elements replaced by their children. WordPress wraps prose in these for layout only. */
const UNWRAP = new Set(['div', 'span', 'font', 'section', 'article', 'header', 'footer', 'center']);

/** Elements dropped entirely, contents and all. */
const DROP = new Set(['colgroup', 'col', 'script', 'style', 'noscript']);

/** Renames to the semantic equivalent. WP's visual editor emits the left-hand side. */
const RENAME = { b: 'strong', i: 'em', strike: 'del', s: 'del' };

/** Everything legal in a migrated body. Anything else throws — see assertAllowed. */
const ALLOWED = new Set([
  'p', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'strong', 'em', 'del',
  'code', 'pre', 'blockquote', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'br', 'img', 'iframe', 'sup', 'sub',
  // NOT figure/figcaption: those are unwrapped into a plain image so Astro's
  // image pipeline can see them. If one reaches here, that unwrap regressed.
]);

const textOf = node => {
  if (node.type === 'text') return node.value ?? '';
  if (!node.children) return '';
  return node.children.map(textOf).join('');
};

/** Does this subtree contain something visible that carries no text? */
const MEDIA = new Set(['img', 'iframe', 'video', 'audio', 'picture', 'svg', 'hr', 'br']);
const hasMedia = node => {
  if (node.type === 'element' && MEDIA.has(node.tagName)) return true;
  return (node.children ?? []).some(hasMedia);
};

const classList = node => {
  const c = node.properties?.className;
  return Array.isArray(c) ? c : typeof c === 'string' ? c.split(/\s+/) : [];
};

/**
 * The largest image in a srcset, or the src.
 *
 * WordPress frequently points `src` at a resized thumbnail and lists the
 * original only in `srcset` — `airtable-revision-history` has a 300x33 src with
 * the 950w original in srcset. Taking `src` blindly migrates thumbnails. Only
 * 30 of the 79 in-content images have a srcset at all; the other 49 are on
 * third-party CDNs and are single-src.
 */
export function pickLargest(src, srcset) {
  // hast does NOT hand back the raw attribute. property-information maps
  // `srcset` to the camelCase `srcSet` and types it comma-separated, so this
  // arrives as an ARRAY of 'url 950w' strings — reading `properties.srcset`
  // yields undefined and silently falls back to the thumbnail in `src`.
  const parts = Array.isArray(srcset)
    ? srcset
    : typeof srcset === 'string'
      ? srcset.split(',')
      : [];

  const candidates = parts
    .map(part => String(part).trim().split(/\s+/))
    .map(([url, descriptor]) => ({ url, w: Number.parseInt(descriptor ?? '', 10) }))
    .filter(c => c.url && Number.isFinite(c.w));

  if (candidates.length === 0) return src;
  return candidates.reduce((best, c) => (c.w > best.w ? c : best)).url;
}

/** WordPress resize suffix: foo-300x33.png -> foo.png. Null when there isn't one. */
export function stripResizeSuffix(url) {
  const m = url.match(/^(.*)-\d+x\d+(\.(?:png|jpe?g|gif|webp|avif))(\?.*)?$/i);
  return m ? `${m[1]}${m[2]}${m[3] ?? ''}` : null;
}

const YOUTUBE_ID = /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{6,})/;

/**
 * Clean one post body in place.
 *
 * @returns collected side-channel data: the images to download, links that
 *   could not be resolved, and notes for the defects report.
 */
export function cleanBody(tree, { slug, title, knownSlugs, bookHref = '/#book' }) {
  const images = [];
  const unresolved = [];
  const notes = [];
  let brRuns = 0;

  const walk = parent => {
    const input = parent.children ?? [];
    const out = [];

    for (const node of input) {
      // ── text: normalise the 65 non-breaking spaces to real ones
      if (node.type === 'text') {
        node.value = (node.value ?? '').replace(/ /g, ' ');
        out.push(node);
        continue;
      }

      if (node.type !== 'element') {
        // comments and doctypes carry nothing we want
        if (node.type === 'comment' || node.type === 'doctype') continue;
        out.push(node);
        continue;
      }

      if (DROP.has(node.tagName)) continue;

      if (RENAME[node.tagName]) node.tagName = RENAME[node.tagName];

      // ── an in-body <h1> competes with the page title, which is the only h1
      if (node.tagName === 'h1') {
        node.tagName = 'h2';
        const heading = textOf(node).trim();
        const same = (a, b) =>
          a.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() ===
          b.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
        if (same(heading, title)) {
          notes.push(`removed an in-body <h1> duplicating the post title: "${heading}"`);
          continue;
        }
        notes.push(`demoted an in-body <h1> to <h2>: "${heading}"`);
      }

      // ── <figure> is unwrapped into a plain image, NOT passed through as raw
      //    HTML.
      //
      // This matters more than it looks. Astro's image pipeline only processes
      // markdown `![](./01.webp)` syntax — a raw `<img src="./01.webp">` is
      // emitted verbatim, so the relative path resolves against the POST's URL
      // (/some-post/01.webp), where nothing exists. Passing figures through as
      // HTML shipped 2 broken images that had also skipped optimisation.
      //
      // A figcaption that merely repeats the alt text is dropped; a caption that
      // says something different is kept as an emphasised paragraph, which is
      // the closest markdown equivalent.
      if (node.tagName === 'figure') {
        walk(node);
        const kids = node.children ?? [];
        const img = kids.find(c => c.type === 'element' && c.tagName === 'img');
        const cap = kids.find(c => c.type === 'element' && c.tagName === 'figcaption');
        out.push(...kids.filter(c => c !== cap));

        const capText = cap ? textOf(cap).trim() : '';
        if (capText) {
          const norm = s => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
          if (norm(capText) === norm(String(img?.properties?.alt ?? ''))) {
            notes.push(`dropped a figure caption identical to its alt text: "${capText}"`);
          } else {
            out.push({
              type: 'element', tagName: 'p', properties: {},
              children: [{
                type: 'element', tagName: 'em', properties: {},
                children: [{ type: 'text', value: capText }],
              }],
            });
            notes.push(`figure caption kept as an emphasised paragraph: "${capText}"`);
          }
        }
        continue;
      }

      // ── unwrap layout-only wrappers (div.blog-main-content and friends)
      if (UNWRAP.has(node.tagName)) {
        walk(node);
        out.push(...(node.children ?? []));
        continue;
      }

      // ── drop paragraphs that hold nothing but whitespace (the &nbsp; spacers)
      //
      // hasMedia is NOT optional here: WordPress wraps a lot of screenshots in
      // <p><img></p>, which contains no text at all, so a text-only emptiness
      // test deletes the paragraph AND the image inside it. That silently lost
      // images from 25 posts before this guard existed.
      if (node.tagName === 'p' && /^[\s ]*$/.test(textOf(node)) && !hasMedia(node)) continue;

      // ── collapse runs of <br>: WP uses <br><br> as a paragraph break
      if (node.tagName === 'br') {
        const prev = out[out.length - 1];
        if (prev?.type === 'element' && prev.tagName === 'br') { brRuns++; continue; }
        out.push({ type: 'element', tagName: 'br', properties: {}, children: [] });
        continue;
      }

      // ── YouTube: emit a labelled, cookie-free embed
      if (node.tagName === 'iframe') {
        const src = String(node.properties?.src ?? '');
        const id = src.match(YOUTUBE_ID)?.[1];
        if (!id) {
          notes.push(`dropped a non-YouTube <iframe>: ${src}`);
          continue;
        }
        out.push({
          type: 'element',
          tagName: 'iframe',
          properties: {
            src: `https://www.youtube-nocookie.com/embed/${id}`,
            // A bare iframe is an unlabelled frame to a screen reader.
            title: `${title} — video`,
            loading: 'lazy',
            allowfullscreen: true,
          },
          children: [],
        });
        continue;
      }

      // ── images
      if (node.tagName === 'img') {
        const rawSrc = String(node.properties?.src ?? '');
        if (!rawSrc) continue;
        const chosen = pickLargest(rawSrc, node.properties?.srcSet ?? node.properties?.srcset);
        const alt = typeof node.properties?.alt === 'string' ? node.properties.alt.trim() : '';
        const index = images.length + 1;
        const name = `${String(index).padStart(2, '0')}.webp`;
        images.push({ index, name, url: new URL(chosen, WP_ORIGIN).href, alt });
        // Relative path so Astro's image pipeline resolves and optimises it —
        // this is what keeps the BASE_URL trap away from 79 markdown files.
        node.properties = { src: `./${name}`, alt };
        out.push(node);
        continue;
      }

      // ── links
      if (node.tagName === 'a') {
        const raw = String(node.properties?.href ?? '').trim();
        const resolved = rewriteHref(raw, { knownSlugs, bookHref });
        if (resolved === null) {
          // Keep the words, lose the dead link, and report it.
          unresolved.push(raw);
          walk(node);
          out.push(...(node.children ?? []));
          continue;
        }
        // target/rel are re-added at build time by src/lib/rehype-prose.ts —
        // one rule there instead of 219 attributes here.
        node.properties = { href: resolved };
        walk(node);
        out.push(node);
        continue;
      }

      // ── everything else: keep the tag, drop every attribute except the
      //    code-fence language, which hast-util-to-mdast reads off the class
      if (node.tagName === 'code') {
        const lang = classList(node)
          .map(c => c.match(/^(?:lang|language)-(.+)$/)?.[1])
          .find(Boolean);
        node.properties = lang ? { className: [`language-${lang}`] } : {};
      } else {
        node.properties = {};
      }

      walk(node);
      out.push(node);
    }

    // A screenshot sitting directly inside an <li> alongside its step text
    // serialises as an INLINE image glued to the end of the sentence
    // ("…not interfaces)![](./01.webp)"). Wrapping it in its own <p> — inside
    // the same <li>, so the numbering is untouched — makes markdown emit it as
    // a block. Lifting it out of the list instead would renumber the steps.
    if (parent.type === 'element' && parent.tagName === 'li' && out.length > 1) {
      parent.children = out.map(child =>
        child.type === 'element' && child.tagName === 'img'
          ? { type: 'element', tagName: 'p', properties: {}, children: [child] }
          : child,
      );
      return;
    }

    parent.children = out;
  };

  walk(tree);
  if (brRuns > 0) notes.push(`collapsed ${brRuns} consecutive <br> into single line breaks`);

  return { images, unresolved, notes };
}

/**
 * Map a WordPress href onto the new site.
 *
 * Returns the new href, or null when the target has no home here (caller
 * unwraps the anchor and reports it) — guessing a destination is worse than
 * losing the link, because a wrong link is invisible.
 */
export function rewriteHref(raw, { knownSlugs, bookHref }) {
  if (!raw) return null;
  // Fragments, mail and tel pass through untouched.
  if (/^(#|mailto:|tel:)/i.test(raw)) return raw;

  let url;
  try {
    url = new URL(raw, WP_ORIGIN);
  } catch {
    return null;
  }

  // External: keep verbatim.
  if (url.hostname !== new URL(WP_ORIGIN).hostname) {
    return /^https?:$/.test(url.protocol) ? url.href : null;
  }

  const path = url.pathname.replace(/^\/+|\/+$/g, '');
  const hash = url.hash ?? '';

  if (path === '') return `/${hash}`;                    // the 18 `//` links
  if (path === 'blogs' || path === 'blog') return '/blogs/';
  if (path === 'book-a-call' || path === 'book-a-call-now') return bookHref;

  // /blog/{slug}/ -> /{slug}/ (WordPress 301s this today)
  const legacy = path.startsWith('blog/') ? path.slice(5) : null;
  const slug = legacy ?? path;
  if (knownSlugs.has(slug)) return `/${slug}/${hash}`;

  return null;   // /resources/*, /about-us/, /training-sessions/, /resource/
}

/**
 * Throw if any tag survived cleaning that the prose layer has no styling for
 * and rehype-remark has no handler for.
 *
 * rehype-remark's behaviour for an unhandled node is to DROP it, silently. With
 * 82,015 words across 61 posts, this assertion is the only thing standing
 * between that and a quietly gutted article.
 */
export function assertAllowed(tree, slug) {
  const bad = new Map();
  const walk = node => {
    if (node.type === 'element' && !ALLOWED.has(node.tagName)) {
      bad.set(node.tagName, (bad.get(node.tagName) ?? 0) + 1);
    }
    for (const child of node.children ?? []) walk(child);
  };
  walk(tree);
  if (bad.size > 0) {
    const list = [...bad].map(([t, n]) => `${t}×${n}`).join(', ');
    throw new Error(`${slug}: unexpected element(s) survived cleaning: ${list}`);
  }
}

/** Words in the visible text, for the conversion-loss invariant. */
export const wordCount = tree =>
  textOf(tree).split(/\s+/).filter(Boolean).length;
