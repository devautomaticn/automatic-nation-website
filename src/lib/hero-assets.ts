/**
 * The tiles the hero well drops. One list, consumed twice:
 *
 *  - src/scripts/tetris.js builds each `img.src` from these at runtime
 *  - the page hands HERO_ASSETS to BaseLayout's `preloadImages`, which emits
 *    the `<link rel="preload">` tags
 *
 * They must be the same list. Preloading is what stops cells landing as blank
 * tiles with the icon popping in afterwards, and it only works if the preload
 * URL and the runtime src match exactly — hence one array, not three.
 *
 * The doubled extensions (Symbol.svg.svg) are the real filenames in public/logos/.
 * Don't "fix" them.
 */
export const LOGOS = [
  'logos/Symbol.svg.svg',
  'logos/make_symbol.svg.svg',
  'logos/mondaycom_symbol.svg.svg',
  'logos/zapier_logo.svg.svg',
  'logos/airtable_symbol.svg.svg',
  'logos/calude.svg',
  'logos/n8n.svg',
  'logos/notion.svg',
  'logos/open.svg',
  'logos/vercel.svg',
  'logos/Google Gemini.svg.svg',
  'logos/Google Mail.svg.svg',
  'logos/git.svg',
];

export const PHOTOS = [
  'image.png',
  'T024D9G3RV4-U05ENL69F37-458b1cdf045b-512.jpg',
];

/** Everything the well needs decoded before the first piece falls. */
export const HERO_ASSETS = [...LOGOS, ...PHOTOS];
