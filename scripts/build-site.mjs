#!/usr/bin/env node
/**
 * Builds the small public site on GitHub Pages:
 *
 *   /privacy/              the privacy policy, from src/content/privacy.ts —
 *                          the same text the app shows, so they cannot drift
 *   /email/unsubscribed/   where the email-unsubscribe function sends her
 *   /email/link-invalid/   the same, for a link that did not verify
 *
 *   node scripts/build-site.mjs      → site/
 *
 * The email pages live here rather than in the Edge Function because Supabase
 * serves function responses as text/plain: an HTML confirmation page from the
 * function would show as raw markup.
 *
 * `.github/workflows/pages.yml` runs this and deploys `site/`.
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
  if (!t) throw new Error(`build-site: no colour token "${name}"`);
  return t.value;
};
const vars = (theme) =>
  ['canvas', 'surface', 'night', 'text-primary', 'text-secondary', 'text-tertiary', 'text-on-night', 'text-on-night-muted', 'line', 'text-link']
    .map((n) => `--${n}: ${tok(n)[theme]};`)
    .join(' ');

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function shell({ title, description, heading, sub, main }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
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
    .brand { font-family: Fraunces, Georgia, serif; font-weight: 600; font-size: 18px; }
    h1 { font-family: Fraunces, Georgia, serif; font-weight: 600; font-size: 32px; line-height: 38px; margin: 24px 0 8px; }
    .sub { color: var(--text-on-night-muted); font-size: 14px; margin: 0; }
    main { padding: 32px 24px 64px; }
    section { margin-bottom: 32px; }
    h2 { font-size: 17px; line-height: 24px; font-weight: 500; margin: 0 0 8px; color: var(--text-primary); }
    p { margin: 0 0 12px; color: var(--text-secondary); }
    a { color: var(--text-link); text-decoration: underline; }
    footer { border-top: 1px solid var(--line); padding-top: 16px; color: var(--text-tertiary); font-size: 13px; }
  </style>
</head>
<body>
  <header>
    <div class="wrap">
      <div class="brand">Nuva</div>
      <h1>${esc(heading)}</h1>
      ${sub ? `<p class="sub">${esc(sub)}</p>` : ''}
    </div>
  </header>
  <main>
    <div class="wrap">
${main}
    </div>
  </main>
</body>
</html>
`;
}

const pages = {
  'privacy/index.html': shell({
    title: 'Nuva · Privacy policy',
    description: 'How Nuva stores and protects what you log.',
    heading: 'Privacy policy',
    sub: `Updated ${PRIVACY_UPDATED}`,
    main: `${PRIVACY_SECTIONS.map(
      (s) => `      <section>
        <h2>${esc(s.title)}</h2>
${s.paragraphs.map((p) => `        <p>${esc(p)}</p>`).join('\n')}
      </section>`,
    ).join('\n')}
      <footer>This is the same policy shown in the app, under Settings › Privacy policy.</footer>`,
  }),
  'email/unsubscribed/index.html': shell({
    title: 'Nuva · Email reminders off',
    description: 'You will not get reminder emails from Nuva.',
    heading: 'You will not get reminder emails any more.',
    sub: '',
    main: `      <p>Reminders on your phone are not affected. You can turn either back on in the app, under You › Reminders.</p>
      <footer><a href="../../privacy/">Privacy policy</a></footer>`,
  }),
  'email/link-invalid/index.html': shell({
    title: 'Nuva · Link not recognised',
    description: 'This unsubscribe link did not work.',
    heading: 'This link does not work.',
    sub: '',
    main: `      <p>It may have been copied incompletely, and nothing was changed. You can turn email reminders off in the app, under You › Reminders.</p>
      <footer><a href="../../privacy/">Privacy policy</a></footer>`,
  }),
  // The bare site URL goes to the policy rather than a 404.
  'index.html':
    '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=privacy/"><title>Nuva</title><a href="privacy/">Nuva privacy policy</a>\n',
};

for (const [path, html] of Object.entries(pages)) {
  const out = join(root, 'site', path);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}
console.log(`build-site: wrote ${Object.keys(pages).join(', ')}`);
