# Handoff: Tetris hero for automatic-nation-website

## Overview

The hero of `src/pages/index.astro` currently drops logo cards and coloured spheres into a
608×608 dark card with Matter.js. This handoff replaces that with an **ambient tetromino well**:
real tetrominoes built from logo tiles and brand-colour blocks fall on a 10×10 grid, complete
rows flash and collapse, the stack settles at 8 rows and holds, then the board re-deals.

Secondary changes that came out of the same review:

- The site accent yellow moves from `#EBEB4A` to `#F7DB55` so the CTAs match the piece palette.
- The dark sections' dotted background becomes a **line grid** matching the well's cell guides.
- The closing CTA section (`#book`) gains **static tetromino decorations** on both edges, snapped
  to that line grid.

## About the design files

The files in this bundle are **design references created in HTML** — a prototype of the intended
look and behaviour, not production code to paste in wholesale. `tetris.js` is the exception: it is
plain, dependency-free ES module JavaScript and is meant to be ported nearly verbatim (see
"Porting `tetris.js` into Astro" below). The `.dc.html` files are inline-styled prototypes; their
values (hex codes, sizes, timings) are the source of truth, but the markup should be re-expressed
in the Astro page's existing structure and CSS conventions (`global.css` tokens + the hand-written
`.hero` / `.dot-card` block).

## Fidelity

**High fidelity.** Every colour, size, radius and timing below is final and taken from a working
prototype. The recreation should match it.

---

## What changes, file by file

### 1. `src/pages/index.astro` — frontmatter

- The `heroAssets` preload list stays exactly as is. All 15 assets are still used
  (13 logos + 2 profile images), now as tetromino cell faces.
- `logoDefs` / `sphereDefs` are deleted — the well picks assets from a shuffled bag at runtime.

### 2. `src/pages/index.astro` — hero markup

Before:

```html
<div class="dot-card" data-base={base}>
  <div class="dot-stage">
    <canvas id="dotCanvas" width="608" height="608" aria-hidden="true"></canvas>
  </div>
</div>
```

After:

```html
<div class="dot-card" data-base={base}></div>
```

The card is now an empty, fluid, `aspect-ratio: 1` box. `tetris.js` builds its own `.dot-stage`
equivalent inside it (a fixed 608×608 layer, CSS-scaled to the card's real width), plus the grid
guides, the NEXT preview and the HUD.

### 3. `src/pages/index.astro` — scripts

Delete:

- the dot-grid canvas `<script is:inline>` (the 17×17 dot loop),
- the Matter.js CDN `<script is:inline src="…matter.min.js">`,
- the whole hero-physics IIFE (`logoDefs`, `sphereDefs`, `applyScale`, `makeCard`,
  `renderStatic`, `start`, `preloadThenStart`, the `MouseConstraint` block).

Add, in their place, one `is:inline` script that boots the well (see next section). The
`is:inline` rule from the repo conventions still applies — the script reads `data-base` off
`.dot-card` at runtime, exactly like the old IIFE did.

### 4. `src/styles/global.css`

| Rule | Change |
| --- | --- |
| `@theme --color-accent` | `#EBEB4A` → `#F7DB55` (`--accent-edge` recomputes itself via `color-mix`, no other edit needed) |
| `.dot-grid` | dotted radial-gradient → line grid (see Design tokens) |
| `#dotCanvas` | delete — the canvas is gone |
| `.dot-stage` | delete — `tetris.js` creates and scales its own stage |
| `.float-card`, `.float-card img`, `.float-card--count`, `.float-card--profile` | delete — no more physics cards |
| `.dot-card` | keep as-is (`width:100%; max-width:608px; aspect-ratio:1; background:#2c2c2c; border-radius:24px; overflow:hidden; position:relative`) |

Also drop the `cursor: grab` / `touchAction` handling that the physics script attached — the well
is not interactive.

---

## Porting `tetris.js` into Astro

`tetris.js` in this bundle is an ES module exporting `Tetris`, `LOGOS` and `PHOTOS`. Two ways in:

**Option A — module file (preferred).** Put it at `src/scripts/tetris.js` and boot it from a
module script in `index.astro`:

```astro
<script>
  import { Tetris } from '../scripts/tetris.js';
  const card = document.querySelector('.dot-card');
  const raw = card.dataset.base || '';
  const B = raw.endsWith('/') ? raw.slice(0, -1) : raw;
  new Tetris(card, {
    cols: 10, rows: 10, size: 608, radius: 12, speed: 2000, gap: 100,
    holdDepth: 8, holdMs: 2600, guides: true, hud: true, seed: 63,
    assetBase: B + '/',
  });
</script>
```

Note this script is **not** `is:inline` — it needs Astro's bundling to resolve the import. That is
safe now: the only reason the old scripts had to be inline was execution order against the
Matter.js CDN tag, which is gone.

**Option B — inline.** If you'd rather keep every hero script `is:inline`, strip the `export`
keywords, wrap the file in an IIFE, and instantiate at the bottom. No other change is required;
the module has no imports and no build-time dependencies.

### The `assetBase` / BASE_URL trap

`tetris.js` never hardcodes a path. Every asset resolves as `assetBase + LOGOS[i]`, where the
`LOGOS` / `PHOTOS` entries are the same relative strings the repo already uses
(`logos/Symbol.svg.svg`, `image.png`, …). Pass `assetBase = basePrefix + '/'` so the runtime
`img.src` matches the `<link rel="preload">` URL **character for character** — the existing
double-fetch hazard is unchanged, just moved.

### Options reference

| Option | Value on the landing page | Meaning |
| --- | --- | --- |
| `cols` / `rows` | `10` / `10` | Board size. `size / cols` = 60.8 → rounded to a **61px cell**. |
| `size` | `608` | Design-space size of the stage; CSS-scaled to the card's real width via `ResizeObserver`. |
| `radius` | `12` | Corner radius, applied per corner (see "Fused corners"). |
| `speed` | `2000` | Fall speed in px/s, constant — deep landings take longer, like real gravity. |
| `gap` | `100` | ms between a lock and the next spawn. |
| `holdDepth` | `8` | Stack depth (rows) at which spawning stops. |
| `holdMs` | `2600` | ms the full stack holds before the board re-deals. |
| `guides` | `true` | 1px cell grid inside the well. |
| `hud` | `true` | Top-left "ROWS CLEARED nn / 900+ APPS" + top-right NEXT preview. |
| `seed` | `63` | Seeded PRNG — the same seed replays the same board. |
| `assetBase` | `basePrefix + '/'` | Prefix for every logo URL. |

---

## Behaviour spec

**Piece generation.** Seven standard tetrominoes (I, O, T, S, Z, J, L), rotated 0–3 times, spawned
in a random column that fits. A piece falls straight down its column at constant speed until the
next row would collide, then locks. No lateral drift, ever — a piece changing column mid-fall was
the thing that made an earlier physics-based attempt read wrong.

**Logo distribution (important).** The 15 assets are shuffled into a bag at the start of a run.
Each cell of a piece takes an icon with probability `min(0.55, bagRemaining × 1.15 / cellsRemaining)`,
so icons are spread across the whole fall instead of being spent in the first three pieces —
pieces come out **mixed** (some logo cells, some solid colour). Two guarantees:

1. **Every piece carries at least one logo** — if the probability roll produced none, one random
   cell is forced to take an icon.
2. **No duplicate icon is ever visible at once** — when the bag empties it is re-dealt from only
   the icons *not currently on the board* (each locked cell records its asset key).

**Fused corners.** A cell corner is rounded only where **both** of its edges face outward — i.e.
neither adjacent cell belongs to the same piece. Inner cells stay square, so an I-piece renders as
one continuous 4-cell bar rather than four separate tiles. Radius `12px`.

**Lock.** On landing, the piece element is dissolved and its four cells are re-parented to the
stage at their absolute grid positions (this is what lets rows clear independently later). All four
flash `brightness(1.3) → 1` over 180ms, `ease-out`. **No bounce** — a bounce reads as a toy, a hard
stop reads as a system.

**Line clear.** When a row is complete: each face turns accent yellow `#F7DB55` (`background`
transition 120ms linear) and its icon is removed → 230ms hold → the row scales to `scaleY(.05)`
and fades out over 220ms `ease-in` → 230ms later everything above drops down by the cleared row
count, animating `transform` 220ms `cubic-bezier(.2,.7,.3,1)` → 260ms later the loop resumes. The
"ROWS CLEARED" counter increments, zero-padded to two digits.

**Hold and re-deal.** When the stack reaches `holdDepth` (8) rows, spawning stops and the board
holds for 2600ms. Then every cell fades out on a 12ms-per-cell stagger (500ms each), the grid and
the bag reset, and the run starts over.

**Reduced motion.** Not implemented in the prototype — the old page had a static-grid fallback.
Recommended: on `prefers-reduced-motion: reduce`, run the solver without animating (place every
locked cell directly at its final position, no fall, no clear) so the well still reads as the same
object. The class already separates placement from animation, so this is a small addition.

---

## The well's chrome

**Cell guides** — a full-bleed layer inside the stage:
`linear-gradient(to right, rgba(255,255,255,0.055) 1px, transparent 1px)` +
`linear-gradient(to bottom, …)`, `background-size: 61px 61px`.

**HUD (top-left, 20px/22px padding, 6px gap, column):**
- `ROWS CLEARED 00` — JetBrains Mono, 11px, `letter-spacing:0.12em`, uppercase, `rgba(255,255,255,0.55)`
- `900+ APPS` — same type, `rgba(255,255,255,0.35)`

It sits at the **top**, deliberately: the stack grows from the floor and buries anything anchored
to the bottom within seconds.

**NEXT preview (top-right, 18px inset):** the label `NEXT` (JetBrains Mono 11px, 0.12em, uppercase,
`rgba(255,255,255,0.4)`) above a 76×76 box, `1px solid rgba(255,255,255,0.14)`, `border-radius:10px`.
Inside, the next piece is drawn as small 3px-radius squares — white `rgba(255,255,255,0.85)` for
cells that will hold an icon, the piece colour for the rest.

## Tile design ("tinted", the chosen direction of three)

- **Logo cell:** background `color-mix(in srgb, <pieceColor> 12%, #fff)` — a pale wash of the
  piece's colour, so a tetromino reads as one object even when its four cells hold different icons.
  Inset hairline `inset 0 0 0 1px rgba(44,44,44,0.07)`. Icon centred at **76% of the cell**,
  `object-fit: contain`. Profile photos instead fill the cell (`100%/100%`, `object-fit: cover`).
- **Colour cell:** solid palette colour, inset hairline `inset 0 0 0 1px rgba(0,0,0,0.10)`.

Two alternatives were explored and rejected, documented here in case they come back:
*Chip* (dark `#242424` tiles, coloured hairline, pad dot) and *Badge* (solid colour cell, icon in a
white disc).

---

## Static tetrominoes in the closing CTA (`#book`)

Decorative, non-animated pieces at both edges of the dark closing section, using the same palette,
the same 12px fused corners and the same `inset 0 0 0 1px rgba(0,0,0,0.10)` hairline — **no logos**.

They must sit **on the section's background grid**, which is what makes them read as intentional:

- Section: `position: relative; overflow: hidden`, line grid at **56px** pitch (the decoration cell
  size — note this is 56, not the well's 61).
- Left column: `position:absolute; left:0; top:0; width:224px; height:504px`. Pieces at multiples of
  56 — O `#8699F7` at `(-56, 0)`, J `#7BB784` at `(56, 168)`, S `#EEAF79` at `(-56, 336)`. The
  negative offsets are exactly one cell, so the bleed still lands on a grid line.
- Right column: `position:absolute; top:0; width:224px; height:616px;` and
  `left: calc(round(down, 100% - 224px, 56px))` — the `round()` is what keeps the right-hand
  column on a grid line at any viewport width. Pieces: T `#E3662E` at `(56, 56)`, I `#F7DB55` at
  `(56, 224)`, O `#8699F7` at `(112, 504)`.
- Content column keeps `max-width:896px` and gains `padding: 128px 280px` so the copy clears the
  decorations.

`round()` needs a modern browser (Chrome 125+/Safari 16.4+). Fallback if you need wider support:
give the right column `right: 0` and accept sub-cell drift, or compute the offset once in the boot
script.

---

## Design tokens

| Token | Value | Where |
| --- | --- | --- |
| Ink | `#2c2c2c` | Page ink, dark sections, well background |
| Paper | `#ffffff` | Page background, logo tile base |
| Mute / Dim / Line / Line-dk | `#525252` / `#a3a3a3` / `#e5e5e5` / `#484848` | Unchanged |
| **Accent** | **`#F7DB55`** | was `#EBEB4A` — CTAs, mono metrics on dark cards, line-clear flash |
| Accent edge | `color-mix(in srgb, color-mix(in srgb, #000 45%, var(--color-accent)) 40%, transparent)` | Button border; recomputes from the token |
| Piece palette | `#F7DB55` yellow, `#8699F7` blue, `#E3662E` red, `#EEAF79` orange, `#7BB784` green | Well + static decorations |
| Grid line | `rgba(255,255,255,0.055)`, 1px | Well guides + dark-section backgrounds |
| Grid pitch | `61px` in the well · `56px` in the dark sections | |
| Radius | `24px` hero card · `16px` content cards · `14px` controls · `12px` tetromino cells · `10px` NEXT box · `8px` chips | |
| Type | Space Grotesk (headings/UI), Montserrat (body/controls), JetBrains Mono (eyebrows, HUD, metrics) | Unchanged |
| Motion | fall `2000px/s` linear · lock flash `180ms ease-out` · clear `120 + 230 + 220ms` · row drop `220ms cubic-bezier(.2,.7,.3,1)` · hold `2600ms` | |

## Assets

No new assets. Everything comes from `public/`, already committed and already preloaded:
13 logos in `public/logos/` (the doubled-extension filenames are referenced verbatim — do not
"fix" them) plus `public/image.png` and
`public/T024D9G3RV4-U05ENL69F37-458b1cdf045b-512.jpg`.

## Files in this bundle

| File | What it is |
| --- | --- |
| `tetris.js` | The engine. Port this nearly verbatim. |
| `Automatic Nation - Landing.dc.html` | Full landing page with the new hero, the accent change, the line grids and the `#book` decorations. **The reference implementation.** |
| `Automatic Nation - Tetris Hero.dc.html` | The exploration doc: three well behaviours (1a/1b/1c), the chosen 10×10 playfield (2a), and the three tile treatments (3a tinted — chosen, 3b chip, 3c badge). Useful for seeing what was rejected and why. |

Both `.dc.html` files render standalone in a browser; the logo paths inside them are relative,
so keep the `logos/` folder next to them.

## Verification

Per the repo's own rule: test with `npm run build && npm run preview`, never `dev` alone — a
wrong `assetBase` 404s only in the built, based-path version.
