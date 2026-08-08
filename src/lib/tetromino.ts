/**
 * Tetromino geometry and the brand palette — shared by the animated hero well
 * (src/scripts/tetris.js) and the static decorations in the closing CTA.
 *
 * These three things used to exist in three copies each. When they drifted, the
 * decorations stopped matching the well they were decorating.
 */

/**
 * The brand palette. Mirrored in src/styles/global.css as --color-piece-*.
 * CSS can't be imported from JS at build time, so the two are kept in sync by
 * hand — change both.
 */
export const PALETTE = ['#F7DB55', '#8699F7', '#E3662E', '#EEAF79', '#7BB784'] as const;

export type Cell = [number, number];

/** The seven pieces, in grid cells. Origin is top-left; y grows downward. */
export const SHAPES: Record<string, Cell[]> = {
  I: [[0, 0], [1, 0], [2, 0], [3, 0]],
  O: [[0, 0], [1, 0], [0, 1], [1, 1]],
  T: [[0, 0], [1, 0], [2, 0], [1, 1]],
  S: [[1, 0], [2, 0], [0, 1], [1, 1]],
  Z: [[0, 0], [1, 0], [1, 1], [2, 1]],
  J: [[0, 0], [0, 1], [1, 1], [2, 1]],
  L: [[2, 0], [0, 1], [1, 1], [2, 1]],
};

/**
 * Indexed form for the well's bag shuffle. The ORDER IS LOAD-BEARING: the hero
 * runs off a fixed seed, so reordering this changes the sequence of pieces that
 * was tuned against.
 */
export const SHAPE_LIST: Cell[][] = [
  SHAPES.I, SHAPES.O, SHAPES.T, SHAPES.S, SHAPES.Z, SHAPES.J, SHAPES.L,
];

/**
 * Border-radius for cell `i` of a piece: a corner rounds only where both of its
 * edges face outward, so cells inside a piece fuse into one silhouette instead
 * of reading as four separate squares.
 */
export function radii(cells: Cell[], i: number, r: number): string {
  const has = (x: number, y: number) => cells.some(c => c[0] === x && c[1] === y);
  const [x, y] = cells[i];
  return [
    (!has(x, y - 1) && !has(x - 1, y)) ? r : 0,
    (!has(x, y - 1) && !has(x + 1, y)) ? r : 0,
    (!has(x, y + 1) && !has(x + 1, y)) ? r : 0,
    (!has(x, y + 1) && !has(x - 1, y)) ? r : 0,
  ].map(v => v + 'px').join(' ');
}

/** The decoration grid: 56px cells, matching .dot-grid's background pitch. */
export const DECO_CELL = 56;
/** Corner radius for both the well's cells and the decorations. */
export const CELL_RADIUS = 12;
