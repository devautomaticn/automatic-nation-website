// Ambient tetromino well: pieces of logo tiles + brand-colour blocks fall on a
// grid, full rows flash and collapse, the stack settles at holdDepth and holds,
// then the board re-deals. No physics engine — pure grid collision, so a piece
// never drifts out of its column.

export const LOGOS = [
  'logos/Symbol.svg.svg','logos/make_symbol.svg.svg','logos/mondaycom_symbol.svg.svg',
  'logos/zapier_logo.svg.svg','logos/airtable_symbol.svg.svg','logos/calude.svg',
  'logos/n8n.svg','logos/notion.svg','logos/open.svg','logos/vercel.svg',
  'logos/Google Gemini.svg.svg','logos/Google Mail.svg.svg','logos/git.svg'
];
export const PHOTOS = ['image.png','T024D9G3RV4-U05ENL69F37-458b1cdf045b-512.jpg'];
const PALETTE = ['#F7DB55','#8699F7','#E3662E','#EEAF79','#7BB784'];
const SHAPES = [
  [[0,0],[1,0],[2,0],[3,0]],
  [[0,0],[1,0],[0,1],[1,1]],
  [[0,0],[1,0],[2,0],[1,1]],
  [[1,0],[2,0],[0,1],[1,1]],
  [[0,0],[1,0],[1,1],[2,1]],
  [[0,0],[0,1],[1,1],[2,1]],
  [[2,0],[0,1],[1,1],[2,1]]
];
function rotate(cells) {
  const maxY = Math.max.apply(null, cells.map(c => c[1]));
  const r = cells.map(c => [maxY - c[1], c[0]]);
  const mx = Math.min.apply(null, r.map(c => c[0])), my = Math.min.apply(null, r.map(c => c[1]));
  return r.map(c => [c[0] - mx, c[1] - my]);
}

export class Tetris {
  constructor(root, opts) {
    this.root = root;
    this.o = Object.assign({
      cols: 10, rows: 10, size: 608, radius: 12, speed: 2000, gap: 100,
      // Floor on a fall's duration, so a piece landing on an already-tall
      // stack doesn't register as a blink. It has to be retuned alongside
      // `speed`: leave it fixed and it silently caps every short drop, so
      // raising `speed` speeds up only the long falls.
      minMs: 220,
      holdDepth: 5, holdMs: 2600, clearStyle: 'sweep', tile: 'tint',
      guides: true, hud: true, seed: 63, assetBase: '', reduced: null
    }, opts || {});
    // Reduced motion: run the solver but place every piece directly at its
    // landing cell — no fall, no line clears, no re-deal. The well still reads
    // as the same object, it just doesn't move. Pass `reduced` explicitly to
    // force either branch; null auto-detects.
    this.reduced = this.o.reduced != null ? !!this.o.reduced
      : (typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches);
    this.timers = []; this.seed = this.o.seed; this.dead = false;
    this.cols = this.o.cols; this.rows = this.o.rows;
    this.cell = Math.round(this.o.size / this.cols);

    this.stage = document.createElement('div');
    this.stage.setAttribute('aria-hidden', 'true');
    this.stage.style.cssText = 'position:absolute;top:0;left:0;width:' + this.o.size + 'px;height:' +
      this.o.size + 'px;overflow:hidden;transform-origin:top left;';
    root.appendChild(this.stage);
    if (this.o.guides) this.drawGuides();
    if (this.o.hud) this.drawHud();

    this.fit = () => {
      const w = root.clientWidth || this.o.size;
      this.stage.style.transform = 'scale(' + (w / this.o.size) + ')';
    };
    this.fit();
    if (typeof ResizeObserver !== 'undefined') { this.ro = new ResizeObserver(this.fit); this.ro.observe(root); }
    else window.addEventListener('resize', this.fit);

    this.reset();
    this.preload(() => this.loop());
  }

  src(p) { return this.o.assetBase + p; }
  rnd() { this.seed = (this.seed * 1664525 + 1013904223) >>> 0; return this.seed / 4294967296; }
  pick(a) { return a[Math.floor(this.rnd() * a.length)]; }
  after(ms, fn) { this.timers.push(setTimeout(fn, ms)); }
  clearTimers() { this.timers.forEach(clearTimeout); this.timers = []; }
  destroy() { this.dead = true; this.clearTimers(); if (this.ro) this.ro.disconnect(); }

  preload(done) {
    let pending = LOGOS.length + PHOTOS.length, started = false;
    const go = () => { if (!started) { started = true; done(); } };
    const tick = () => { if (--pending <= 0) go(); };
    LOGOS.concat(PHOTOS).forEach(s => { const im = new Image(); im.onload = tick; im.onerror = tick; im.src = this.src(s); });
    setTimeout(go, 3500);
  }

  drawGuides() {
    const g = document.createElement('div');
    g.style.cssText = 'position:absolute;inset:0;pointer-events:none;' +
      'background-image:linear-gradient(to right, rgba(255,255,255,0.055) 1px, transparent 1px),' +
      'linear-gradient(to bottom, rgba(255,255,255,0.055) 1px, transparent 1px);' +
      'background-size:' + this.cell + 'px ' + this.cell + 'px;';
    this.stage.appendChild(g);
  }

  drawHud() {
    const mono = "font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;";
    // Top-left: the stack grows from the floor and would bury a bottom HUD.
    const wrap = document.createElement('div');
    wrap.style.cssText = 'position:absolute;left:0;top:0;padding:20px 22px;display:flex;flex-direction:column;gap:6px;pointer-events:none;color:rgba(255,255,255,0.55);' + mono;
    this.hudLeft = document.createElement('span');
    this.hudLeft.textContent = 'rows cleared 00';
    const sub = document.createElement('span');
    sub.textContent = '900+ apps';
    sub.style.color = 'rgba(255,255,255,0.35)';
    wrap.appendChild(this.hudLeft); wrap.appendChild(sub);
    this.root.appendChild(wrap);

    const nx = document.createElement('div');
    nx.style.cssText = 'position:absolute;top:18px;right:18px;display:flex;flex-direction:column;align-items:flex-end;gap:8px;pointer-events:none;color:rgba(255,255,255,0.4);' + mono;
    const lbl = document.createElement('span'); lbl.textContent = 'next';
    this.nextBox = document.createElement('div');
    this.nextBox.style.cssText = 'width:76px;height:76px;border:1px solid rgba(255,255,255,0.14);border-radius:10px;position:relative;overflow:hidden;';
    nx.appendChild(lbl); nx.appendChild(this.nextBox);
    this.root.appendChild(nx);
  }

  reset() {
    this.clearTimers();
    Array.from(this.stage.querySelectorAll('.tt-cell')).forEach(el => el.remove());
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
    this.cleared = 0;
    if (this.hudLeft) this.hudLeft.textContent = 'rows cleared 00';
    this.dealBag();
    this.next = this.makeSpec();
  }

  // Each icon falls once per run: the bag is dealt, never refilled.
  dealBag() {
    this.bag = LOGOS.concat(PHOTOS).slice();
    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = Math.floor(this.rnd() * (i + 1));
      const t = this.bag[i]; this.bag[i] = this.bag[j]; this.bag[j] = t;
    }
  }
  // When the bag runs dry, re-deal only the icons that aren't currently on the
  // board — every piece can still carry a logo without two of the same icon
  // ever being visible at once.
  nextSrc() {
    if (!this.bag || !this.bag.length) {
      const onBoard = new Set();
      if (this.grid) for (let r = 0; r < this.rows; r++) for (let x = 0; x < this.cols; x++) {
        const c = this.grid[r][x];
        if (c && c.key) onBoard.add(c.key);
      }
      this.bag = LOGOS.concat(PHOTOS).filter(s => !onBoard.has(s));
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(this.rnd() * (i + 1));
        const t = this.bag[i]; this.bag[i] = this.bag[j]; this.bag[j] = t;
      }
    }
    return this.bag.length ? this.bag.pop() : null;
  }

  makeSpec() {
    let cells = this.pick(SHAPES);
    const turns = Math.floor(this.rnd() * 4);
    for (let i = 0; i < turns; i++) cells = rotate(cells);
    // Spread the icons over the whole run: each cell takes one with
    // probability remaining-icons / remaining-cells, so pieces come out mixed
    // and logos keep appearing until the stack holds.
    const capacity = this.cols * this.o.holdDepth;
    let filled = 0;
    if (this.grid) for (let r = 0; r < this.rows; r++) for (let x = 0; x < this.cols; x++) if (this.grid[r][x]) filled++;
    const left = Math.max(4, capacity - filled);
    const p = this.bag ? Math.min(0.55, (this.bag.length * 1.15) / left) : 0;
    const srcs = cells.map(() => (this.rnd() < p ? this.nextSrc() : null));
    // Guarantee at least one icon per piece while the bag lasts — a piece of
    // four plain colour cells reads as filler next to the logo tiles.
    if (!srcs.some(Boolean)) srcs[Math.floor(this.rnd() * srcs.length)] = this.nextSrc();
    return { cells: cells, srcs: srcs, logo: srcs.some(Boolean), color: this.pick(PALETTE) };
  }

  // A corner rounds only where both of its edges face outward, so cells inside
  // a piece fuse and an I-piece reads as one bar.
  radii(cells, i) {
    const R = this.o.radius;
    const has = (x, y) => cells.some(c => c[0] === x && c[1] === y);
    const x = cells[i][0], y = cells[i][1];
    return [(!has(x, y-1) && !has(x-1, y)) ? R : 0,
            (!has(x, y-1) && !has(x+1, y)) ? R : 0,
            (!has(x, y+1) && !has(x+1, y)) ? R : 0,
            (!has(x, y+1) && !has(x-1, y)) ? R : 0].map(v => v + 'px').join(' ');
  }

  cellEl(spec, i) {
    const c = this.cell;
    const el = document.createElement('div');
    el.className = 'tt-cell';
    el.style.cssText = 'position:absolute;top:0;left:0;will-change:transform;width:' + c + 'px;height:' + c + 'px;';
    const face = document.createElement('div');
    face.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;overflow:hidden;';
    face.style.borderRadius = this.radii(spec.cells, i);
    const key = spec.srcs[i];
    if (key) {
      // Logo tiles carry a pale wash of the piece colour, so a tetromino reads
      // as one object even when its cells hold different icons.
      face.style.background = 'color-mix(in srgb, ' + spec.color + ' 12%, #fff)';
      face.style.boxShadow = 'inset 0 0 0 1px rgba(44,44,44,0.07)';
      const img = document.createElement('img');
      img.src = this.src(key); img.alt = ''; img.draggable = false;
      img.style.pointerEvents = 'none';
      if (PHOTOS.indexOf(key) >= 0) { img.style.width = '100%'; img.style.height = '100%'; img.style.objectFit = 'cover'; }
      else { const s = Math.round(c * 0.76); img.style.width = s + 'px'; img.style.height = s + 'px'; img.style.objectFit = 'contain'; }
      face.appendChild(img);
    } else {
      face.style.background = spec.color;
      face.style.boxShadow = 'inset 0 0 0 1px rgba(0,0,0,0.10)';
    }
    el.appendChild(face);
    return el;
  }

  stackTop() {
    for (let r = 0; r < this.rows; r++)
      for (let x = 0; x < this.cols; x++) if (this.grid[r][x]) return r;
    return this.rows;
  }

  loop() {
    if (this.dead) return;
    const spec = this.next;
    this.next = this.makeSpec();
    if (this.nextBox) this.drawNext(this.next);

    const w = Math.max.apply(null, spec.cells.map(c => c[0])) + 1;
    const col = Math.floor(this.rnd() * (this.cols - w + 1));
    const fits = y => spec.cells.every(c => {
      const gx = col + c[0], gy = y + c[1];
      if (gy < 0) return true;
      return gy < this.rows && !this.grid[gy][gx];
    });
    let y = -4;
    if (!fits(y)) { this.after(600, () => this.softReset()); return; }
    while (fits(y + 1)) y++;

    const c = this.cell;
    const minR = Math.min.apply(null, spec.cells.map(p => p[1]));
    const maxR = Math.max.apply(null, spec.cells.map(p => p[1]));
    const piece = document.createElement('div');
    piece.className = 'tt-cell';
    piece.style.cssText = 'position:absolute;top:0;left:0;will-change:transform;';
    const els = spec.cells.map((p, i) => {
      const el = this.cellEl(spec, i);
      el.style.transform = 'translate(' + (p[0] * c) + 'px,' + ((p[1] - minR) * c) + 'px)';
      piece.appendChild(el);
      return el;
    });
    this.stage.appendChild(piece);

    const x0 = col * c;
    const yTop = -((maxR - minR + 1) * c + 24);
    const yEnd = (y + minR) * c;
    const dur = this.reduced ? 0 : Math.max(this.o.minMs, (yEnd - yTop) / this.o.speed * 1000);
    piece.style.transform = 'translate(' + x0 + 'px,' + (this.reduced ? yEnd : yTop) + 'px)';
    if (!this.reduced) piece.animate(
      [{ transform: 'translate(' + x0 + 'px,' + yTop + 'px)' },
       { transform: 'translate(' + x0 + 'px,' + yEnd + 'px)' }],
      { duration: dur, easing: 'linear', fill: 'forwards' }
    );

    this.after(dur, () => {
      if (this.dead) return;
      piece.remove();
      spec.cells.forEach((p, i) => {
        const el = els[i];
        const gx = col + p[0], gy = y + p[1];
        el.style.transform = 'translate(' + (gx * c) + 'px,' + (gy * c) + 'px)';
        this.stage.appendChild(el);
        this.grid[gy][gx] = { el: el, row: gy, col: gx, key: spec.srcs[i] };
      });
      // Dry lock flash, no bounce: a bounce says toy, a hard stop says system.
      if (!this.reduced) els.forEach(el => el.animate([{ filter: 'brightness(1.3)' }, { filter: 'brightness(1)' }], { duration: 180, easing: 'ease-out' }));
      this.afterLock();
    });
  }

  drawNext(spec) {
    this.nextBox.replaceChildren();
    const w = Math.max.apply(null, spec.cells.map(p => p[0])) + 1;
    const h = Math.max.apply(null, spec.cells.map(p => p[1])) + 1;
    const s = Math.floor(56 / Math.max(w, h));
    const ox = (76 - w * s) / 2, oy = (76 - h * s) / 2;
    spec.cells.forEach((p, i) => {
      const d = document.createElement('div');
      d.style.cssText = 'position:absolute;width:' + s + 'px;height:' + s + 'px;border-radius:3px;left:' +
        (ox + p[0] * s) + 'px;top:' + (oy + p[1] * s) + 'px;background:' +
        (spec.srcs[i] ? 'rgba(255,255,255,0.85)' : spec.color) + ';';
      this.nextBox.appendChild(d);
    });
  }

  afterLock() {
    const full = [];
    for (let r = 0; r < this.rows; r++) if (this.grid[r].every(Boolean)) full.push(r);
    // Reduced motion stops at a settled board: no flashing clear, no re-deal
    // loop. Full rows are simply left standing.
    if (this.reduced) {
      if (this.rows - this.stackTop() < this.o.holdDepth) this.after(0, () => this.loop());
      return;
    }
    if (full.length) { this.clearRows(full); return; }
    if (this.rows - this.stackTop() >= this.o.holdDepth) { this.after(this.o.holdMs, () => this.softReset()); return; }
    this.after(this.o.gap, () => this.loop());
  }

  clearRows(rows) {
    const c = this.cell;
    rows.forEach(r => this.grid[r].forEach(cell => {
      const face = cell.el.firstChild;
      face.style.transition = 'background .12s linear';
      face.style.background = '#F7DB55';
      face.replaceChildren();
    }));
    this.after(230, () => {
      if (this.dead) return;
      rows.forEach(r => this.grid[r].forEach((cell, x) => {
        const el = cell.el;
        el.style.transition = 'transform .22s ease-in, opacity .22s ease-in';
        el.style.opacity = '0';
        el.style.transform = 'translate(' + (x * c) + 'px,' + (r * c) + 'px) scaleY(.05)';
        setTimeout(() => el.remove(), 260);
        this.grid[r][x] = null;
      }));
      this.cleared += rows.length;
      if (this.hudLeft) this.hudLeft.textContent = 'rows cleared ' + String(this.cleared).padStart(2, '0');

      this.after(230, () => {
        if (this.dead) return;
        for (let r = this.rows - 1; r >= 0; r--) {
          if (this.grid[r].some(Boolean)) continue;
          for (let rr = r - 1; rr >= 0; rr--) {
            if (!this.grid[rr].some(Boolean)) continue;
            this.grid[rr].forEach((cell, x) => {
              if (!cell) return;
              this.grid[r][x] = cell; this.grid[rr][x] = null;
              cell.row = r;
              cell.el.style.transition = 'transform .22s cubic-bezier(.2,.7,.3,1)';
              cell.el.style.transform = 'translate(' + (x * c) + 'px,' + (r * c) + 'px)';
            });
            r--; rr = r;
          }
          break;
        }
        this.after(260, () => this.afterLock());
      });
    });
  }

  softReset() {
    if (this.dead) return;
    const cells = [];
    for (let r = 0; r < this.rows; r++) for (let x = 0; x < this.cols; x++) if (this.grid[r][x]) cells.push(this.grid[r][x]);
    cells.forEach((cell, i) => {
      cell.el.style.transition = 'opacity .5s ease, transform .5s ease';
      this.after(i * 12, () => { cell.el.style.opacity = '0'; });
    });
    this.after(700 + cells.length * 12, () => { this.reset(); this.loop(); });
  }
}
