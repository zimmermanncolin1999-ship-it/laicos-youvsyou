// Generate PWA + favicon icons from public/characters/sartaj-stage4.png
// (the legendary form — most distinctive silhouette for an app icon).
//
// Outputs:
//   public/icons/icon-192.png   (PWA, maskable-safe)
//   public/icons/icon-512.png   (PWA, maskable-safe)
//   public/icons/apple-touch.png (180×180, iOS home-screen)
//   public/icons/favicon-32.png  (browser tab)
//   public/icons/favicon-16.png
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(__dirname, "..");
const src = path.join(project, "public/characters/sartaj-stage4.png");
const outDir = path.join(project, "public/icons");
await fs.mkdir(outDir, { recursive: true });

// Synthwave dark-purple square background with a subtle radial glow.
function bgSvg(size) {
  const r = size / 2;
  return Buffer.from(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="g" cx="50%" cy="40%" r="60%">
          <stop offset="0%"  stop-color="#b14bff" stop-opacity="0.6" />
          <stop offset="55%" stop-color="#1a0b3d" stop-opacity="1" />
          <stop offset="100%" stop-color="#08081a" stop-opacity="1" />
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#g)" rx="${Math.round(size * 0.18)}"/>
      <circle cx="${r}" cy="${r}" r="${r * 0.46}" fill="#39ff7a" opacity="0.05"/>
    </svg>
  `);
}

async function build(size, filename, { padding = 0.18, transparent = false } = {}) {
  const pad = Math.round(size * padding);
  const character = await sharp(src)
    .resize({ width: size - pad * 2, height: size - pad * 2, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const composite = [
    { input: character, top: pad, left: pad },
  ];

  let base;
  if (transparent) {
    base = sharp({
      create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    });
  } else {
    base = sharp(bgSvg(size));
  }

  await base.composite(composite).png().toFile(path.join(outDir, filename));
  console.log(`✓ ${filename} (${size}²)`);
}

await build(192, "icon-192.png");
await build(512, "icon-512.png");
await build(180, "apple-touch.png");
await build(32, "favicon-32.png", { padding: 0.12 });
await build(16, "favicon-16.png", { padding: 0.08 });
// Also produce maskable variants (Android adaptive-icon safe zone ≈ 80% of canvas).
await build(192, "icon-192-maskable.png", { padding: 0.22 });
await build(512, "icon-512-maskable.png", { padding: 0.22 });

console.log(`\nDone. Wrote icons to ${outDir}`);
