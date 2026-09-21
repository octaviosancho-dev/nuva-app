#!/usr/bin/env node
/**
 * Generates src/constants/tokens.ts from design/tokens.json.
 *
 * src/constants/tokens.ts is NEVER hand-edited. When a token changes in the design
 * system, replace design/tokens.json and run:
 *
 *     node scripts/generate-tokens.mjs
 *
 * The React Native shadow values are not in tokens.json — CSS box-shadow has no
 * RN equivalent — so they live in SHADOWS below, copied from the mapping table
 * in design/README.md. If that table changes, change it here too.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = JSON.parse(readFileSync(resolve(root, 'design/tokens.json'), 'utf8'));

const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
const px = (v) => parseFloat(String(v).replace('px', ''));

// A key is emitted bare only when it is a valid JS identifier. `radius-2xl` camels to
// `2xl`, which cannot begin a key — unquoted, the generated file does not parse.
const key = (k) => (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : `'${k}'`);

/* ------------------------------------------------------------------ colour */
const raw = {};
for (const t of tokens.color.tokens) raw[t.name] = t.value;

// `{clay}` style aliases point at another token.
const deref = (v) => {
  if (typeof v === 'string' && v.startsWith('{')) return deref(raw[v.slice(1, -1)]);
  return v;
};
const pick = (v, theme) => {
  const d = deref(v);
  return typeof d === 'string' ? d : d[theme];
};

const themes = tokens.color.themes.map((t) => t.id);
const colorBlock = themes
  .map((theme) => {
    const rows = tokens.color.tokens
      .map((t) => `    ${camel(t.name)}: '${pick(t.value, theme)}',`)
      .join('\n');
    return `  ${theme}: {\n${rows}\n  },`;
  })
  .join('\n');

/* -------------------------------------------------------------- typography */
// @expo-google-fonts family names, by family + weight + style.
const FONT = {
  display: { 500: 'Fraunces_500Medium', 600: 'Fraunces_600SemiBold' },
  displayItalic: { 500: 'Fraunces_500Medium_Italic', 600: 'Fraunces_600SemiBold_Italic' },
  text: { 400: 'DMSans_400Regular', 500: 'DMSans_500Medium' },
};

const typeRows = [];
for (const group of tokens.type.groups) {
  for (const s of group.styles) {
    const italic = s.fontStyle === 'italic';
    const family = group.family === 'display' ? (italic ? FONT.displayItalic : FONT.display) : FONT.text;
    const parts = [
      `fontFamily: '${family[s.fontWeight] ?? Object.values(family)[0]}'`,
      `fontSize: ${px(s.fontSize)}`,
      `lineHeight: ${px(s.lineHeight)}`,
    ];
    if (s.letterSpacing) parts.push(`letterSpacing: ${px(s.letterSpacing)}`);
    if (italic) parts.push(`fontStyle: 'italic' as const`);
    if (s.name === 'numeral' || s.name === 'statNumber') {
      parts.push(`fontVariant: ['tabular-nums'] as const`);
    }
    typeRows.push(`  ${s.name}: { ${parts.join(', ')} },`);
  }
}

/* ------------------------------------------------------- spacing and radii */
const spaceRows = tokens.spacing.tokens
  .map((t) => `  ${key(camel(t.name))}: ${px(t.value)},`)
  .join('\n');
const radiusRows = tokens.radius.tokens
  .map((t) => `  ${key(camel(t.name.replace('radius-', '')))}: ${px(t.value)},`)
  .join('\n');

/* ------------------------------------------------------------------ shadow */
// From the mapping table in design/README.md. Dark raises opacity.
const SHADOWS = {
  xs: { color: '#1F1B2E', offset: [0, 1], opacity: 0.06, radius: 2, elevation: 1, darkOpacity: 0.4 },
  sm: { color: '#1F1B2E', offset: [0, 2], opacity: 0.08, radius: 8, elevation: 2, darkOpacity: 0.45 },
  md: { color: '#1F1B2E', offset: [0, 6], opacity: 0.1, radius: 18, elevation: 5, darkOpacity: 0.5 },
  lg: { color: '#1F1B2E', offset: [0, 16], opacity: 0.14, radius: 36, elevation: 10, darkOpacity: 0.58 },
  ember: { color: '#E39A2E', offset: [0, 8], opacity: 0.34, radius: 20, elevation: 6, darkOpacity: 0.3 },
};
const shadowBlock = ['light', 'dark']
  .map((theme) => {
    const rows = Object.entries(SHADOWS)
      .map(([name, s]) => {
        const color = theme === 'dark' && name !== 'ember' ? '#000000' : s.color;
        const opacity = theme === 'dark' ? s.darkOpacity : s.opacity;
        return `    ${name}: { shadowColor: '${color}', shadowOffset: { width: ${s.offset[0]}, height: ${s.offset[1]} }, shadowOpacity: ${opacity}, shadowRadius: ${s.radius}, elevation: ${s.elevation} },`;
      })
      .join('\n');
    return `  ${theme}: {\n${rows}\n  },`;
  })
  .join('\n');

/* ----------------------------------------------------------------- opacity */
const opacityRows = (tokens.opacity?.tokens ?? [])
  .map((t) => `  ${camel(t.name.replace('opacity-', ''))}: ${t.value},`)
  .join('\n');

const out = `// Generated from design/tokens.json by scripts/generate-tokens.mjs.
// Do not edit by hand — regenerate instead. Nuva tokens version ${tokens.version}.

export const color = {
${colorBlock}
} as const;

export type ThemeName = keyof typeof color;
export type ColorToken = keyof (typeof color)['light'];

export const type = {
${typeRows.join('\n')}
} as const;

export const space = {
${spaceRows}
} as const;

export const radius = {
${radiusRows}
} as const;

export const shadow = {
${shadowBlock}
} as const;

export const opacity = {
${opacityRows}
} as const;
`;

mkdirSync(resolve(root, 'src/constants'), { recursive: true });
writeFileSync(resolve(root, 'src/constants/tokens.ts'), out);
console.log('src/constants/tokens.ts written —', tokens.color.tokens.length, 'colours,', typeRows.length, 'text styles');
