// Generates FinanceGo's topographic contour-line patterns as static SVG files in
// public/patterns/. Each pattern is a smooth "terrain" (a few seeded hills plus
// gentle waves) traced into contour lines with marching squares. The SVGs are
// used as CSS masks, so their colour is set in CSS, not here.
// Usage: npm run patterns
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const W = 800;
const H = 600;
const STEP = 8;

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function terrain(seed) {
  const r = rng(seed);
  const hills = Array.from({ length: 7 }, () => ({
    x: r() * W * 1.2 - W * 0.1,
    y: r() * H * 1.2 - H * 0.1,
    a: 0.4 + r() * 0.7,
    s: 80 + r() * 140,
  }));
  const waves = Array.from({ length: 3 }, () => ({ fx: 0.004 + r() * 0.008, fy: 0.004 + r() * 0.008, p: r() * Math.PI * 2, a: 0.08 + r() * 0.08 }));
  return (x, y) => {
    let v = 0;
    for (const h of hills) v += h.a * Math.exp(-((x - h.x) ** 2 + (y - h.y) ** 2) / (2 * h.s * h.s));
    for (const w of waves) v += w.a * Math.sin(x * w.fx + w.p) * Math.cos(y * w.fy - w.p);
    return v;
  };
}

/** Marching squares: returns line segments where the field crosses `level`. */
function segments(grid, cols, rows, level) {
  const segs = [];
  const lerp = (a, b, va, vb) => a + ((level - va) / (vb - va)) * (b - a);
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const x = i * STEP;
      const y = j * STEP;
      const tl = grid[j][i], tr = grid[j][i + 1], br = grid[j + 1][i + 1], bl = grid[j + 1][i];
      const idx = (tl > level ? 8 : 0) | (tr > level ? 4 : 0) | (br > level ? 2 : 0) | (bl > level ? 1 : 0);
      if (idx === 0 || idx === 15) continue;
      const top = [lerp(x, x + STEP, tl, tr), y];
      const right = [x + STEP, lerp(y, y + STEP, tr, br)];
      const bottom = [lerp(x, x + STEP, bl, br), y + STEP];
      const left = [x, lerp(y, y + STEP, tl, bl)];
      const table = {
        1: [[left, bottom]], 2: [[bottom, right]], 3: [[left, right]], 4: [[top, right]],
        5: [[left, top], [bottom, right]], 6: [[top, bottom]], 7: [[left, top]], 8: [[left, top]],
        9: [[top, bottom]], 10: [[left, bottom], [top, right]], 11: [[top, right]], 12: [[left, right]],
        13: [[bottom, right]], 14: [[left, bottom]],
      };
      for (const s of table[idx]) segs.push(s);
    }
  }
  return segs;
}

/** Joins segments that share endpoints into polylines, to keep the files small. */
function stitch(segs) {
  const key = (p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;
  const ends = new Map();
  segs.forEach((s, i) => {
    for (const p of s) {
      const k = key(p);
      if (!ends.has(k)) ends.set(k, []);
      ends.get(k).push(i);
    }
  });
  const used = new Array(segs.length).fill(false);
  const lines = [];
  for (let i = 0; i < segs.length; i++) {
    if (used[i]) continue;
    used[i] = true;
    const line = [segs[i][0], segs[i][1]];
    for (const dir of [1, -1]) {
      for (;;) {
        const tip = dir === 1 ? line[line.length - 1] : line[0];
        const next = (ends.get(key(tip)) ?? []).find((j) => !used[j]);
        if (next === undefined) break;
        used[next] = true;
        const [a, b] = segs[next];
        const other = key(a) === key(tip) ? b : a;
        if (dir === 1) line.push(other);
        else line.unshift(other);
      }
    }
    lines.push(line);
  }
  return lines;
}

const r1 = (n) => Math.round(n * 10) / 10;

function pattern(seed, levels = 14) {
  const f = terrain(seed);
  const cols = W / STEP + 1;
  const rows = H / STEP + 1;
  const grid = Array.from({ length: rows }, (_, j) => Array.from({ length: cols }, (_, i) => f(i * STEP, j * STEP)));
  const flat = grid.flat();
  const min = Math.min(...flat);
  const max = Math.max(...flat);
  const paths = [];
  for (let k = 1; k <= levels; k++) {
    const level = min + ((max - min) * k) / (levels + 1);
    for (const line of stitch(segments(grid, cols, rows, level))) {
      if (line.length < 4) continue;
      paths.push("M" + line.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L"));
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice"><path d="${paths.join("")}" fill="none" stroke="#000" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>\n`;
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public/patterns");
mkdirSync(outDir, { recursive: true });
const SEEDS = { alps: 11, lake: 23, summit: 37, trail: 41, nyc: 53, london: 67, campus: 79 };
for (const [name, seed] of Object.entries(SEEDS)) {
  const svg = pattern(seed);
  writeFileSync(join(outDir, `${name}.svg`), svg);
  console.log(`patterns/${name}.svg  ${(svg.length / 1024).toFixed(1)} KB`);
}
