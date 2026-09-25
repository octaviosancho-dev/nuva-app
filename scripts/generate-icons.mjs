#!/usr/bin/env node
/**
 * Rasterises the app icons, splash mark and favicon from the SVGs in
 * `assets/logo/`, the same way `generate-tokens.mjs` turns `design/tokens.json`
 * into code: the kit is the source, the PNGs are output.
 *
 *   node scripts/generate-icons.mjs
 *
 * Rules from `design/assets/Logo/README.md`:
 * - iOS icons are 1024×1024, full bleed, no rounded corners (iOS applies the
 *   mask) and **no alpha channel** — App Store Connect rejects an icon that
 *   has one, even a fully opaque one. So the iOS icons are written as RGB.
 * - Light, dark and tinted variants, for iOS 18+ appearances.
 *
 * Android's adaptive icon keeps the mark inside the 66% safe zone: launchers
 * crop the 108dp layer to anything from a circle to a squircle, and only the
 * middle 72dp is guaranteed to show.
 */
import { Resvg } from '@resvg/resvg-js';
import { PNG } from 'pngjs';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const logo = (name) => readFileSync(join(root, 'assets', 'logo', name), 'utf8');
const out = (name) => join(root, 'assets', 'images', name);

/** `night-deep`, the splash and icon ground — design/tokens.json. */
const NIGHT_DEEP = '#17132A';

function render(svg, width) {
  return new Resvg(svg, { fitTo: { mode: 'width', value: width }, background: 'rgba(0,0,0,0)' })
    .render()
    .asPng();
}

/** Re-encodes a PNG without its alpha channel, flattening onto `ground`. */
function withoutAlpha(pngBuffer, ground) {
  const src = PNG.sync.read(pngBuffer);
  const [gr, gg, gb] = [1, 3, 5].map((i) => parseInt(ground.slice(i, i + 2), 16));
  const dst = new PNG({ width: src.width, height: src.height, colorType: 2, inputHasAlpha: false });
  const rgb = Buffer.alloc(src.width * src.height * 3);
  for (let p = 0, q = 0; p < src.data.length; p += 4, q += 3) {
    const a = src.data[p + 3] / 255;
    rgb[q] = Math.round(src.data[p] * a + gr * (1 - a));
    rgb[q + 1] = Math.round(src.data[p + 1] * a + gg * (1 - a));
    rgb[q + 2] = Math.round(src.data[p + 2] * a + gb * (1 - a));
  }
  dst.data = rgb;
  return PNG.sync.write(dst, { colorType: 2, inputHasAlpha: false });
}

/**
 * Places the mark (viewBox -1 0 66 50) on a square canvas, scaled so its width
 * is `fraction` of the side, optionally on a solid ground.
 */
function markOnSquare(markSvg, side, fraction, ground) {
  const inner = markSvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const w = side * fraction;
  const scale = w / 66;
  const h = 50 * scale;
  const x = (side - w) / 2 + 1 * scale; // viewBox starts at -1
  const y = (side - h) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${side} ${side}" width="${side}" height="${side}">
${ground ? `<rect width="${side}" height="${side}" fill="${ground}"/>` : ''}
<g transform="translate(${x} ${y}) scale(${scale})">${inner}</g>
</svg>`;
}

const written = [];
function write(name, buffer) {
  mkdirSync(dirname(out(name)), { recursive: true });
  writeFileSync(out(name), buffer);
  written.push(name);
}

// iOS — light, dark, tinted. RGB, no alpha.
write('icon.png', withoutAlpha(render(logo('nuva-appicon.svg'), 1024), NIGHT_DEEP));
write('icon-dark.png', withoutAlpha(render(logo('nuva-appicon-dark.svg'), 1024), NIGHT_DEEP));
write('icon-tinted.png', withoutAlpha(render(logo('nuva-appicon-tinted.svg'), 1024), '#000000'));

// Android adaptive — the mark inside the safe zone, over a solid ground.
write('android-icon-foreground.png', render(markOnSquare(logo('nuva-mark-on-night.svg'), 1024, 0.5), 1024));
write(
  'android-icon-background.png',
  render(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" fill="${NIGHT_DEEP}"/></svg>`, 1024),
);
// Monochrome: Android reads only the alpha, and tints it itself.
write('android-icon-monochrome.png', render(markOnSquare(logo('nuva-mark-mono-cream.svg'), 1024, 0.5), 1024));

// Splash: the mark alone on transparent; app.json supplies the night-deep
// ground and draws it at 76pt wide, so 3× that is enough.
write('splash-icon.png', render(logo('nuva-mark-on-night.svg'), 228 * 2));

// Web favicon.
write('favicon.png', render(logo('nuva-appicon.svg'), 48));

console.log(`generate-icons: wrote ${written.join(', ')}`);
