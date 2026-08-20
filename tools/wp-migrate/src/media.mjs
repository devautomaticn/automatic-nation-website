import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import pLimit from 'p-limit';
import { stripResizeSuffix } from './clean.mjs';

const CACHE = new URL('../cache/media/', import.meta.url);

/**
 * 1920 = 2× the 960px --container-article measure. Anything wider is bytes no
 * layout can use; anything narrower goes soft on a retina screen. Bump this in
 * step with --container-article, or screenshots of small UI text go mushy.
 * (withoutEnlargement means a smaller original is never upscaled to reach it.)
 */
const MAX_WIDTH = 1920;

/**
 * quality 82, not 80: these are screenshots of small Airtable UI text, and the
 * glyph edges start to mush below ~82.
 */
const WEBP_QUALITY = 82;

const limit = pLimit(6);

const cacheName = url => {
  const hash = createHash('sha1').update(url).digest('hex').slice(0, 16);
  const ext = (url.match(/\.(png|jpe?g|gif|webp|avif)(?:\?|$)/i)?.[1] ?? 'bin').toLowerCase();
  return `${hash}.${ext}`;
};

async function download(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Fetch with one retry, caching the raw original so re-runs cost nothing. */
async function fetchOriginal(url) {
  await mkdir(CACHE, { recursive: true });
  const cached = new URL(cacheName(url), CACHE);
  if (existsSync(cached)) return readFile(cached);

  let lastError;
  for (const attempt of [0, 1]) {
    try {
      const buf = await download(url);
      await writeFile(cached, buf);
      return buf;
    } catch (err) {
      lastError = err;
      if (attempt === 0) await new Promise(r => setTimeout(r, 2000));
    }
  }
  throw new Error(`download failed for ${url}: ${lastError?.message}`);
}

/**
 * Resolve the best available original for a WordPress URL.
 *
 * When `src` carried no srcset but does carry WP's `-300x33` resize suffix, the
 * un-suffixed original usually exists. Try it, and fall back on a 404 — this
 * recovers full-resolution images for the single-src WordPress cases that
 * pickLargest() cannot help with.
 */
async function bestOriginal(url) {
  const unsuffixed = stripResizeSuffix(url);
  if (unsuffixed && unsuffixed !== url) {
    try {
      const buf = await fetchOriginal(unsuffixed);
      return { buf, url: unsuffixed, upgraded: true };
    } catch {
      // fall through to the thumbnail we were given
    }
  }
  return { buf: await fetchOriginal(url), url, upgraded: false };
}

/**
 * Download, shrink and write every queued image.
 *
 * A failure here is FATAL on purpose. 66 of the 79 in-content images live on
 * cdn.outrank.so and framerusercontent.com, which we don't control; if one is
 * already gone we want to know now, not after cutover. And a missing file would
 * otherwise surface much later as an opaque `astro:assets` import error.
 */
export async function processImages(jobs, { onProgress } = {}) {
  const results = await Promise.all(
    jobs.map(job => limit(async () => {
      const { buf, url, upgraded } = await bestOriginal(job.url);
      const image = sharp(buf, { failOn: 'error' });
      const meta = await image.metadata();

      await mkdir(new URL('./', job.outFile), { recursive: true });
      const info = await image
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toFile(job.outFile.pathname ? decodeURIComponent(job.outFile.pathname) : job.outFile);

      onProgress?.();
      return {
        ...job,
        sourceUrl: url,
        upgraded,
        sourceWidth: meta.width ?? 0,
        width: info.width,
        bytes: info.size,
      };
    })),
  );
  return results;
}

/** Below the 704px prose measure an image renders visibly soft. Worth reporting. */
export const isLowRes = result => result.width < 700;
