/**
 * Regenerates favicon / PWA / OG assets from the Melano mark.
 * Usage: node scripts/generate-brand-assets.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");
const appDir = join(root, "src/app");

const MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <circle cx="32" cy="32" r="32" fill="#0E0E14"/>
  <circle cx="32" cy="32" r="30" stroke="#C2993F" stroke-width="2"/>
  <path d="M18 42V22h6.2l7.8 14.2L39.8 22H46v20h-5.4V30.4L34.2 42h-4.4l-6.4-11.6V42H18z" fill="#F0EADC"/>
</svg>`;

const ICON_SVG_FILE = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Melano Inc">
  <circle cx="32" cy="32" r="32" fill="#0E0E14"/>
  <circle cx="32" cy="32" r="30" stroke="#C2993F" stroke-width="2"/>
  <path d="M18 42V22h6.2l7.8 14.2L39.8 22H46v20h-5.4V30.4L34.2 42h-4.4l-6.4-11.6V42H18z" fill="#F0EADC"/>
</svg>
`;

function ogSvg() {
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0A0A10"/>
      <stop offset="55%" stop-color="#12121A"/>
      <stop offset="100%" stop-color="#1A1620"/>
    </linearGradient>
    <radialGradient id="glowL" cx="15%" cy="85%" r="55%">
      <stop offset="0%" stop-color="#C2993F" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#C2993F" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowR" cx="90%" cy="10%" r="45%">
      <stop offset="0%" stop-color="#F0EADC" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="#F0EADC" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glowL)"/>
  <rect width="1200" height="630" fill="url(#glowR)"/>
  <circle cx="980" cy="120" r="220" fill="#FFFFFF" fill-opacity="0.02"/>
  <circle cx="180" cy="520" r="260" fill="#C2993F" fill-opacity="0.05"/>

  <!-- mark -->
  <g transform="translate(88,72)">
    <circle cx="36" cy="36" r="36" fill="#0E0E14"/>
    <circle cx="36" cy="36" r="34" stroke="#C2993F" stroke-width="2.5"/>
    <path d="M20 48V24h7l8.8 16.1L44.6 24H52v24h-6.1V34.2L38.5 48h-5l-7.2-13.2V48H20z" fill="#F0EADC"/>
  </g>
  <text x="180" y="118" fill="#C2993F" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" letter-spacing="4">MELANO INC</text>

  <text x="88" y="280" fill="#F5F1E8" font-family="Arial, Helvetica, sans-serif" font-size="92" font-weight="800" letter-spacing="-2">NOTORIUS</text>
  <text x="88" y="350" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="600">Tokenizá propiedades y activos reales</text>
  <text x="88" y="400" fill="#A8A29A" font-family="Arial, Helvetica, sans-serif" font-size="24">Smart contracts · KYC · whitelist · Polygon</text>
  <text x="88" y="455" fill="#8A847A" font-family="Arial, Helvetica, sans-serif" font-size="20">Alenya capta → Luxia convierte → NOTORIUS tokeniza</text>

  <text x="88" y="560" fill="#C2993F" font-family="Arial, Helvetica, sans-serif" font-size="20" letter-spacing="1">notorius.melanoinc.com</text>
</svg>`;
}

async function pngFromSvg(svg, size, outPath, { padRatio = 0 } = {}) {
  const buf = Buffer.from(svg);
  let pipeline = sharp(buf).resize(size, size, { fit: "contain", background: { r: 14, g: 14, b: 20, alpha: 1 } });
  if (padRatio > 0) {
    const inner = Math.round(size * (1 - padRatio));
    const pad = Math.round((size - inner) / 2);
    pipeline = sharp(buf)
      .resize(inner, inner, { fit: "contain", background: { r: 14, g: 14, b: 20, alpha: 1 } })
      .extend({
        top: pad,
        bottom: size - inner - pad,
        left: pad,
        right: size - inner - pad,
        background: { r: 14, g: 14, b: 20, alpha: 1 },
      });
  }
  await pipeline.png().toFile(outPath);
  console.log("wrote", outPath);
}

async function main() {
  mkdirSync(publicDir, { recursive: true });
  mkdirSync(appDir, { recursive: true });

  writeFileSync(join(publicDir, "icon.svg"), ICON_SVG_FILE);
  writeFileSync(join(publicDir, "melano-mark.svg"), MARK_SVG + "\n");
  writeFileSync(join(appDir, "icon.svg"), ICON_SVG_FILE);

  const sizes = [
    ["favicon-16.png", 16, 0],
    ["favicon-32.png", 32, 0],
    ["favicon.png", 32, 0],
    ["apple-touch-icon.png", 180, 0],
    ["icon-192.png", 192, 0],
    ["icon-512.png", 512, 0],
    ["icon-512-maskable.png", 512, 0.18],
  ];

  for (const [name, size, pad] of sizes) {
    await pngFromSvg(MARK_SVG, size, join(publicDir, name), { padRatio: pad });
  }

  // App router convention icons
  await pngFromSvg(MARK_SVG, 48, join(appDir, "icon.png"));
  await pngFromSvg(MARK_SVG, 180, join(appDir, "apple-icon.png"));

  // Multi-size ICO (16 + 32)
  const ico16 = await sharp(Buffer.from(MARK_SVG)).resize(16, 16).png().toBuffer();
  const ico32 = await sharp(Buffer.from(MARK_SVG)).resize(32, 32).png().toBuffer();
  // Sharp cannot write .ico natively; pack a minimal ICO manually.
  const ico = packIco([
    { size: 16, png: ico16 },
    { size: 32, png: ico32 },
  ]);
  writeFileSync(join(publicDir, "favicon.ico"), ico);
  writeFileSync(join(appDir, "favicon.ico"), ico);
  console.log("wrote favicon.ico");

  await sharp(Buffer.from(ogSvg())).png().toFile(join(publicDir, "og-notorius.png"));
  console.log("wrote og-notorius.png");
}

/** Minimal ICO writer for PNG-compressed frames. */
function packIco(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(frames.length, 4);

  const dir = Buffer.alloc(16 * frames.length);
  const bodies = [];
  let offset = 6 + 16 * frames.length;

  frames.forEach((frame, i) => {
    const o = i * 16;
    dir.writeUInt8(frame.size === 256 ? 0 : frame.size, o);
    dir.writeUInt8(frame.size === 256 ? 0 : frame.size, o + 1);
    dir.writeUInt8(0, o + 2);
    dir.writeUInt8(0, o + 3);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(frame.png.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    bodies.push(frame.png);
    offset += frame.png.length;
  });

  return Buffer.concat([header, dir, ...bodies]);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
