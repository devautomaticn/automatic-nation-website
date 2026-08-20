/**
 * Build-time fixes to migrated post bodies that markdown cannot express.
 *
 * This runs in Node during the markdown build, not in the browser, so it does
 * NOT import from ./url.ts — `import.meta.env.BASE_URL` doesn't exist here.
 * It doesn't need to: the site is served from the domain root with no `base`
 * (see astro.config.mjs), so a root-relative `/{slug}/` written into a post is
 * already the final URL. If a base is ever reintroduced, the link-prefixing
 * belongs here and the base must be passed in as an option — never hardcoded.
 *
 * Deliberately hand-rolled rather than pulling in unist-util-visit: three
 * transforms over a shallow tree don't justify a dependency, and CLAUDE.md's
 * bias is against adding tooling.
 */

/** The minimum shape of a hast node this plugin touches. */
interface Node {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
  value?: string;
}

const isElement = (n: Node, tag: string): boolean => n.type === 'element' && n.tagName === tag;

export function rehypeProse() {
  return (tree: Node, file: { path?: string }) => {
    let missingAlt = 0;

    const walk = (node: Node): void => {
      const children = node.children;
      if (!children) return;

      for (let i = 0; i < children.length; i++) {
        const child = children[i];

        // A <table> cannot scroll itself and the prose column has to keep its
        // 704px measure, so the overflow goes on a wrapper. Widest table in the
        // corpus is 9 columns. Pairs with .article-scroll in global.css.
        if (isElement(child, 'table')) {
          children[i] = {
            type: 'element',
            tagName: 'div',
            properties: { className: ['article-scroll'] },
            children: [child],
          };
          walk(child);
          continue;
        }

        // One rule here instead of the 219 target="_blank" attributes the
        // migration strips out of the source.
        if (isElement(child, 'a')) {
          const href = child.properties?.href;
          if (typeof href === 'string' && /^https?:/.test(href)) {
            child.properties = { ...child.properties, target: '_blank', rel: 'noopener' };
          }
        }

        // Warn, never throw. Most migrated images arrived from WordPress with no
        // alt text; a hard failure would block the whole migration behind a
        // copywriting pass, and CLAUDE.md forbids adding a linter.
        //
        // Caveat worth knowing: Astro caches rendered markdown, so this only
        // fires on a COLD render (after `rm -rf node_modules/.astro`, or when a
        // post actually changes) — and `astro check` warms that cache, so
        // `npm run check && npm run build` prints nothing. It is a nudge, not an
        // audit. The authoritative list is tools/wp-migrate/out/alt-todo.tsv.
        if (isElement(child, 'img')) {
          const alt = child.properties?.alt;
          if (typeof alt !== 'string' || alt.trim() === '') missingAlt++;
        }

        walk(child);
      }
    };

    walk(tree);

    if (missingAlt > 0) {
      const where = file.path ? file.path.split('/src/content/')[1] ?? file.path : 'unknown';
      console.warn(`[a11y] ${missingAlt} image(s) with no alt text in ${where}`);
    }
  };
}
