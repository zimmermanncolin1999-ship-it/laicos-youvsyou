// Slice public/trophies/badges.png (1402×1122, 5×4 grid) into 20 individual
// PNGs at /public/trophies/<id>.png.
//
// Per cell:
//   1. Extract cell with a small inset to chop most neighbour bleed.
//   2. Find the largest connected component of opaque pixels — that is the
//      actual badge; any tiny neighbour-bleed remnants are smaller blobs
//      and get ignored.
//   3. Crop tight to that component's bbox, then pad to a square so the
//      badge is geometrically centred.
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(__dirname, "..");
const src = path.join(project, "public/trophies/badges.png");
const outDir = path.join(project, "public/trophies");

const ORDER = [
  "first_flame",    "week_warrior",   "month_champion", "hundred_club",  "egg_man",
  "hydration_hero", "mover",          "gym_veteran",    "shake_master",  "sleeper",
  "awakening",      "warrior_born",   "legend_status",  "perfect_day",   "perfect_week",
  "early_bird",     "iron_will",      "thousand",       "unstoppable",   "diamond",
];

const COLS = 5;
const ROWS = 4;
const INSET = 18;
const ALPHA_THRESHOLD = 24;
const PAD = 14;

const meta = await sharp(src).metadata();
console.log(`Source: ${meta.width}×${meta.height}`);

const cellW = meta.width / COLS;
const cellH = meta.height / ROWS;

/** Find the largest connected component of opaque pixels in an RGBA buffer.
 *  Uses an iterative BFS (no recursion → safe for large blobs). */
function largestOpaqueBBox(buf, width, height) {
  const visited = new Uint8Array(width * height);
  const isOpaque = (idx) => buf[idx * 4 + 3] > ALPHA_THRESHOLD;

  let best = null; // { minX, minY, maxX, maxY, size }

  const stack = new Int32Array(width * height); // reusable
  for (let startY = 0; startY < height; startY++) {
    for (let startX = 0; startX < width; startX++) {
      const startIdx = startY * width + startX;
      if (visited[startIdx] || !isOpaque(startIdx)) continue;

      // BFS this component.
      let top = 0;
      stack[top++] = startIdx;
      visited[startIdx] = 1;
      let minX = startX, minY = startY, maxX = startX, maxY = startY, size = 0;

      while (top > 0) {
        const idx = stack[--top];
        const x = idx % width;
        const y = (idx - x) / width;
        size++;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;

        // 4-connected neighbours
        if (x + 1 < width) {
          const n = idx + 1;
          if (!visited[n] && isOpaque(n)) { visited[n] = 1; stack[top++] = n; }
        }
        if (x - 1 >= 0) {
          const n = idx - 1;
          if (!visited[n] && isOpaque(n)) { visited[n] = 1; stack[top++] = n; }
        }
        if (y + 1 < height) {
          const n = idx + width;
          if (!visited[n] && isOpaque(n)) { visited[n] = 1; stack[top++] = n; }
        }
        if (y - 1 >= 0) {
          const n = idx - width;
          if (!visited[n] && isOpaque(n)) { visited[n] = 1; stack[top++] = n; }
        }
      }

      if (!best || size > best.size) {
        best = { minX, minY, maxX, maxY, size };
      }
    }
  }

  if (!best) return null;
  return {
    left: best.minX,
    top: best.minY,
    width: best.maxX - best.minX + 1,
    height: best.maxY - best.minY + 1,
    size: best.size,
  };
}

for (let i = 0; i < ORDER.length; i++) {
  const id = ORDER[i];
  const col = i % COLS;
  const row = Math.floor(i / COLS);

  const rawLeft   = Math.round(col * cellW);
  const rawTop    = Math.round(row * cellH);
  const rawRight  = Math.round((col + 1) * cellW);
  const rawBottom = Math.round((row + 1) * cellH);

  const ex = {
    left:   rawLeft + INSET,
    top:    rawTop + INSET,
    width:  rawRight - rawLeft - INSET * 2,
    height: rawBottom - rawTop - INSET * 2,
  };

  const { data, info } = await sharp(src)
    .extract(ex)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bbox = largestOpaqueBBox(data, info.width, info.height);
  if (!bbox) { console.warn(`! ${id} — empty`); continue; }

  const croppedPng = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .extract({ left: bbox.left, top: bbox.top, width: bbox.width, height: bbox.height })
    .png()
    .toBuffer();

  const side = Math.max(bbox.width, bbox.height) + PAD * 2;
  await sharp(croppedPng)
    .resize({
      width: side,
      height: side,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toFile(path.join(outDir, `${id}.png`));
  console.log(`✓ ${id}.png (blob ${bbox.size}px → bbox ${bbox.width}×${bbox.height} → square ${side})`);
}

console.log(`\nDone. Wrote ${ORDER.length} files to ${outDir}`);
