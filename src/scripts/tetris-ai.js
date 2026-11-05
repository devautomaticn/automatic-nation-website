// Placement solver for the hero well. The pieces still arrive at random; this
// only decides where each one goes — column and rotation — the way a tidy
// player would, so the stack stays flat and keeps clearing rows instead of
// piling up full of holes. Pure functions over a boolean board (row 0 on top),
// no DOM: the engine in tetris.js owns the animation.

export function rotate(cells) {
  const maxY = Math.max.apply(null, cells.map(c => c[1]));
  const r = cells.map(c => [maxY - c[1], c[0]]);
  const mx = Math.min.apply(null, r.map(c => c[0])), my = Math.min.apply(null, r.map(c => c[1]));
  return r.map(c => [c[0] - mx, c[1] - my]);
}

// Every distinct orientation of a piece. rotate() keeps the cells in the same
// index order, which is what keeps each icon attached to its cell.
export function orientations(cells) {
  const out = [], seen = new Set();
  let c = cells;
  for (let t = 0; t < 4; t++) {
    const key = c.map(p => p.join(',')).sort().join(';');
    if (!seen.has(key)) { seen.add(key); out.push(c); }
    c = rotate(c);
  }
  return out;
}

// Straight drop down a column — the well has no lateral drift, so neither does
// the search. Returns the landing row, or null if the piece would stick out.
export function dropRow(board, cells, col) {
  const rows = board.length, cols = board[0].length;
  const fits = y => cells.every(c => {
    const gx = col + c[0], gy = y + c[1];
    if (gx < 0 || gx >= cols) return false;
    if (gy < 0) return true;
    return gy < rows && !board[gy][gx];
  });
  let y = -4;
  if (!fits(y)) return null;
  while (fits(y + 1)) y++;
  if (cells.some(c => y + c[1] < 0)) return null;
  return y;
}

function place(board, cells, col, y, clear) {
  const next = board.map(r => r.slice());
  cells.forEach(c => { next[y + c[1]][col + c[0]] = true; });
  if (!clear) return { board: next, cleared: 0 };
  const kept = next.filter(r => !r.every(Boolean));
  const cleared = next.length - kept.length;
  while (kept.length < next.length) kept.unshift(Array(next[0].length).fill(false));
  return { board: kept, cleared };
}

// Board features from Pierre Dellacherie's hand-tuned player (weights as
// published by El-Tetris). Walls and floor count as filled.
function features(board) {
  const rows = board.length, cols = board[0].length;
  let rowT = 0, colT = 0, holes = 0, wells = 0;
  for (let r = 0; r < rows; r++) {
    if (!board[r].some(Boolean)) continue;
    let prev = true;
    for (let x = 0; x < cols; x++) { if (board[r][x] !== prev) rowT++; prev = board[r][x]; }
    if (!prev) rowT++;
  }
  for (let x = 0; x < cols; x++) {
    let prev = false, roof = false, depth = 0;
    for (let r = 0; r < rows; r++) {
      const v = board[r][x];
      if (v !== prev) colT++;
      prev = v;
      if (v) roof = true; else if (roof) holes++;
      const walled = !v && (x === 0 || board[r][x - 1]) && (x === cols - 1 || board[r][x + 1]);
      if (walled) { depth++; wells += depth; } else depth = 0;
    }
    if (!prev) colT++;
  }
  return { rowT, colT, holes, wells };
}

const W = { landing: -4.5, cleared: 3.42, rowT: -3.22, colT: -9.35, holes: -7.9, wells: -3.39 };

function evaluate(board, landing, cleared) {
  const f = features(board);
  return W.landing * landing + W.cleared * cleared + W.rowT * f.rowT +
    W.colT * f.colT + W.holes * f.holes + W.wells * f.wells;
}

// `well` is a column the stack keeps open, the way a player saves a lane for
// the long piece: a placement may only enter it if it completes `minClear` rows. That is
// what lets the stack grow tall and tidy, then clear several rows at once.
function placements(board, cells, clear, well, minClear) {
  const rows = board.length, cols = board[0].length, out = [];
  orientations(cells).forEach(o => {
    const w = Math.max.apply(null, o.map(c => c[0])) + 1;
    const minR = Math.min.apply(null, o.map(c => c[1])), maxR = Math.max.apply(null, o.map(c => c[1]));
    for (let col = 0; col + w <= cols; col++) {
      const y = dropRow(board, o, col);
      if (y == null) continue;
      const res = place(board, o, col, y, clear);
      if (well != null && res.cleared < minClear && o.some(c => col + c[0] === well)) continue;
      out.push({ cells: o, col, y, board: res.board, cleared: res.cleared,
        landing: rows - (y + (minR + maxR) / 2) });
    }
  });
  return out;
}

// Best spot for `cells`, looking one piece ahead at `nextCells` (the NEXT box
// already shows it, so the player "knows" it too). `rnd` adds a sliver of noise
// so equal choices don't always resolve to the leftmost column. With
// probability `slop` it settles for the second or third best spot instead —
// the occasional hole is what makes it read as played rather than solved.
export function choosePlacement(board, cells, nextCells, opts) {
  opts = opts || {};
  const clear = opts.clear !== false;
  const rnd = opts.rnd || Math.random;
  let well = opts.well != null ? opts.well : null;
  const minClear = opts.minClear || 1;
  let options = placements(board, cells, clear, well, minClear);
  // Nothing fits outside the lane: give up on it for this piece.
  if (!options.length && well != null) { well = null; options = placements(board, cells, clear, null, minClear); }
  const scored = options.map(p => {
    let score;
    if (nextCells) {
      score = -Infinity;
      placements(p.board, nextCells, clear, well, minClear).forEach(q => {
        const s = evaluate(q.board, p.landing + q.landing, p.cleared + q.cleared);
        if (s > score) score = s;
      });
      // No room for the next piece: still rank it, but well below any spot that has room.
      if (score === -Infinity) score = evaluate(p.board, p.landing, p.cleared) - 1000;
    } else score = evaluate(p.board, p.landing, p.cleared);
    return { p, score: score + rnd() * 0.5 };
  }).sort((a, b) => b.score - a.score);
  if (!scored.length) return null;
  let i = 0;
  if (opts.slop && rnd() < opts.slop) i = Math.min(scored.length - 1, 1 + Math.floor(rnd() * 2));
  const best = scored[i].p;
  return { cells: best.cells, col: best.col, y: best.y };
}
