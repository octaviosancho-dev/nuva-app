#!/usr/bin/env node
/**
 * Builds the public privacy policy page for GitHub Pages from the same source
 * the app shows — `src/content/privacy.ts` — so the web copy and the in-app
 * copy can never drift apart.
 *
 *   node scripts/build-privacy-page.mjs      → site/privacy/index.html
 *
 * `.github/workflows/pages.yml` runs this and deploys `site/`. App Store
 * Connect's Privacy Policy URL is then:
 *   https://octaviosancho-dev.github.io/nuva-app/privacy/
 *
 * Colours come from `design/tokens.json`, light and dark, like the app.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Node 22.6+ strips TypeScript types on import; privacy.ts is plain data.
const { PRIVACY_SECTIONS, PRIVACY_UPDATED } = await import(
  pathToFileURL(join(root, 'src', 'content', 'privacy.ts')).href
);

const tokens = JSON.parse(readFileSync(join(root, 'design', 'tokens.json'), 'utf8'));
const tok = (name) => {
  const t = tokens.color.tokens.find((x) => x.name === name);
  if (!t) throw new Error(`build-privacy-page: no colour token "${name}"`);
  return t.value;
};
const vars = (theme) =>
  ['canvas', 'surface', 'night', 'text-primary', 'text-secondary', 'text-tertiary', 'text-on-night', 'text-on-night-muted', 'line', 'text-link']
    .map((n) => `--${n}: ${tok(n)[theme]};`)
    .join(' ');

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const sections = PRIVACY_SECTIONS.map(
  (s) => `      <section>
        <h2>${esc(s.title)}</h2>
${s.paragraphs.map((p) => `        <p>${esc(p)}</p>`).join('\n')}
      </section>`,
).join('\n');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Nuva · Privacy policy</title>
  <meta name="description" content="How Nuva stores and protects what you log.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=DM+Sans:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root { ${vars('light')} color-scheme: light dark; }
    @media (prefers-color-scheme: dark) { :root { ${vars('dark')} } }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--canvas); color: var(--text-primary);
      font-family: "DM Sans", system-ui, sans-serif; font-size: 16px; line-height: 26px;
      -webkit-font-smoothing: antialiased; }
    header { background: var(--night); color: var(--text-on-night); padding: 56px 24px 64px;
      border-radius: 0 0 50% 50% / 0 0 26px 26px; }
    .wrap { max-width: 680px; margin: 0 auto; }
    .brand { font-family: Fraunces, Georgia, serif; font-weight: 600; font-size: 18px; letter-spacing: 0; }
    h1 { font-family: Fraunces, Georgia, serif; font-weight: 600; font-size: 32px; line-height: 38px; margin: 24px 0 8px; }
    .updated { color: var(--text-on-night-muted); font-size: 14px; margin: 0; }
    main { padding: 32px 24px 64px; }
    section { margin-bottom: 32px; }
    h2 { font-size: 17px; line-height: 24px; font-weight: 500; margin: 0 0 8px; color: var(--text-primary); }
    p { margin: 0 0 12px; color: var(--text-secondary); }
    footer { border-top: 1px solid var(--line); padding-top: 16px; color: var(--text-tertiary); font-size: 13px; }
  </style>
</head>
<body>
  <header>
    <div class="wrap">
      <div class="brand">Nuva</div>
      <h1>Privacy policy</h1>
      <p class="updated">Updated ${esc(PRIVACY_UPDATED)}</p>
    </div>
  </header>
  <main>
    <div class="wrap">
${sections}
      <footer>This is the same policy shown in the app, under Settings › Privacy policy.</footer>
    </div>
  </main>
</body>
</html>
`;

const out = join(root, 'site', 'privacy', 'index.html');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, html);
// A root page, so the bare Pages URL is not a 404.
writeFileSync(
  join(root, 'site', 'index.html'),
  '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=privacy/"><title>Nuva</title><a href="privacy/">Nuva privacy policy</a>\n',
);
console.log(`build-privacy-page: wrote site/privacy/index.html (${PRIVACY_SECTIONS.length} sections)`);
