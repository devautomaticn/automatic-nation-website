/**
 * Tells Bing (and every other IndexNow engine) which URLs a deploy changed.
 *
 * Google does not take part in IndexNow and has no equivalent a blog may use:
 * the sitemap ping was retired in 2023, and the Indexing API is licensed for
 * JobPosting and BroadcastEvent pages only. Google is served by the sitemap's
 * <lastmod>, set in astro.config.mjs. This covers Bing — and through it
 * ChatGPT search and Copilot, which read Bing's index.
 *
 * Two steps, because "what changed" is only knowable before the deploy:
 *
 *   diff    run in the build job, after `astro build`. Compares dist/'s
 *           sitemap with the one still live, and prints the new or re-dated
 *           URLs as a one-line JSON array. That is what makes the daily cron
 *           announce a scheduled post on its date, and nothing else.
 *   submit  run after the deploy, with that array in $URLS.
 *
 * Neither step can break a deploy: if the live sitemap can't be read, diff
 * prints [] and nothing is sent. Sending every URL on every build instead is
 * what IndexNow asks senders not to do.
 *
 * The key is public by design — the engines verify it by fetching
 * /{KEY}.txt from the site. Changing it means renaming that file in public/.
 *
 * Node only, no dependencies. The sitemap is our own generated XML, so a
 * regex over it is enough.
 */
import { readFileSync, existsSync } from 'node:fs';

const SITE = 'https://automaticnation.com';
const KEY = '67ccedfb6e17b115a8a3a520ccef730a';
const DIST = 'dist';

/** loc → lastmod (undefined when the URL carries none). */
const parseUrls = xml =>
  new Map(
    [...xml.matchAll(/<url>(.*?)<\/url>/gs)].map(([, u]) => [
      u.match(/<loc>(.*?)<\/loc>/)[1],
      u.match(/<lastmod>(.*?)<\/lastmod>/)?.[1],
    ]),
  );

/** Follows sitemap-index.xml to its children, read with `read(path)`. */
const readSitemap = async read => {
  const index = await read('sitemap-index.xml');
  const children = [...index.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, loc]) => new URL(loc).pathname.slice(1));
  const all = new Map();
  for (const child of children) for (const [loc, mod] of parseUrls(await read(child))) all.set(loc, mod);
  return all;
};

const fromDist = async path => readFileSync(`${DIST}/${path}`, 'utf8');
const fromLive = async path => {
  const res = await fetch(`${SITE}/${path}`);
  if (!res.ok) throw new Error(`${SITE}/${path} answered ${res.status}`);
  return res.text();
};

async function diff() {
  // Fail the build, not the ping: a missing key file would make every
  // submission a silent 403 from here on.
  if (!existsSync(`${DIST}/${KEY}.txt`)) throw new Error(`public/${KEY}.txt is missing`);

  const next = await readSitemap(fromDist);
  let live;
  try {
    live = await readSitemap(fromLive);
  } catch (err) {
    console.error(`indexnow: live sitemap unreadable, sending nothing — ${err.message}`);
    console.log('[]');
    return;
  }
  const changed = [...next].filter(([loc, mod]) => !live.has(loc) || live.get(loc) !== mod).map(([loc]) => loc);
  console.error(`indexnow: ${changed.length} changed URL(s)`);
  console.log(JSON.stringify(changed));
}

async function submit() {
  const urlList = JSON.parse(process.env.URLS || '[]');
  if (!urlList.length) return console.log('indexnow: nothing to send');

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(SITE).host,
      key: KEY,
      keyLocation: `${SITE}/${KEY}.txt`,
      urlList,
    }),
  });
  // 200 = accepted, 202 = accepted while the key is verified (first sends).
  if (res.status !== 200 && res.status !== 202) {
    throw new Error(`IndexNow answered ${res.status}: ${await res.text()}`);
  }
  console.log(`indexnow: sent ${urlList.length} URL(s), ${res.status}`);
  for (const url of urlList) console.log(`  ${url}`);
}

const cmd = process.argv[2];
if (cmd === 'diff') await diff();
else if (cmd === 'submit') await submit();
else throw new Error('usage: node seo/indexnow.mjs diff|submit');
