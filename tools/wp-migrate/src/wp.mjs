import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

export const WP_ORIGIN = 'https://automaticnation.com';
const API = `${WP_ORIGIN}/wp-json/wp/v2`;
const CACHE = new URL('../cache/', import.meta.url);

/** The number of published posts we expect. A mismatch is a hard stop. */
export const EXPECTED_POSTS = 61;

const cachePath = name => new URL(name, CACHE);

async function cached(name, fetcher, refetch) {
  const file = cachePath(name);
  if (!refetch && existsSync(file)) {
    return JSON.parse(await readFile(file, 'utf8'));
  }
  const data = await fetcher();
  await mkdir(CACHE, { recursive: true });
  await writeFile(file, JSON.stringify(data, null, 2));
  return data;
}

async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return { body: await res.json(), headers: res.headers };
}

/**
 * All published posts, in one request.
 *
 * `_embed=wp:featuredmedia` resolves the 38 featured images inline so there is
 * no second round of per-post media lookups. yoast_head_json carries the
 * hand-written meta description and an og_image fallback that covers 4 posts
 * with no featured_media.
 */
export async function fetchPosts({ refetch = false } = {}) {
  const posts = await cached('posts.json', async () => {
    const fields = [
      'id', 'date', 'modified', 'slug', 'title', 'content', 'excerpt',
      'featured_media', 'yoast_head_json',
    ].join(',');
    const { body, headers } = await getJson(
      `${API}/posts?per_page=100&_fields=${fields}&_embed=wp:featuredmedia`,
    );
    const total = Number(headers.get('x-wp-total'));
    if (total !== EXPECTED_POSTS) {
      throw new Error(
        `WordPress reports ${total} posts, expected ${EXPECTED_POSTS}. ` +
        `If posts were published since this script was written, update ` +
        `EXPECTED_POSTS in src/wp.mjs — do not let a silent count change through.`,
      );
    }
    return body;
  }, refetch);

  if (posts.length !== EXPECTED_POSTS) {
    throw new Error(`Fetched ${posts.length} posts, expected ${EXPECTED_POSTS}.`);
  }
  return posts;
}

/** The featured image url + alt for a post, or null. Falls back to Yoast's og_image. */
export function heroSource(post) {
  const embedded = post._embedded?.['wp:featuredmedia']?.[0];
  if (embedded?.source_url) {
    return { url: embedded.source_url, alt: (embedded.alt_text || '').trim() };
  }
  // 4 posts have no featured_media but Yoast picked up the first in-content
  // image, which is a better hero than nothing.
  const og = post.yoast_head_json?.og_image?.[0]?.url;
  return og ? { url: og, alt: '' } : null;
}

/** The meta description. Yoast is hand-written; excerpt.rendered is WP's run-on auto-excerpt. */
export function metaDescription(post) {
  const yoast = post.yoast_head_json?.description?.trim();
  if (yoast) return yoast;
  throw new Error(`No Yoast description for ${post.slug} — write one before migrating.`);
}
