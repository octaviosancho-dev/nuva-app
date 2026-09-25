import { SEVERITY, category as categoryOf } from '@/constants/nuva';
import { color } from '@/constants/tokens';

import type { MonthSummary } from './summary';

/**
 * The report is paper, so it is always the light palette — a PDF printed or
 * opened on a clinic screen has no dark mode.
 */
const c = color.light;

/** Everything she typed (medication names, doses) goes through this. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const severityOf = (value: number) =>
  SEVERITY[Math.min(4, Math.max(1, Math.round(value))) - 1] ?? SEVERITY[0];

/**
 * Severity renders three signals, on paper as on screen: the swatch, the
 * filled dots, and the word. A photocopy loses the colour; the dots and the
 * word survive it.
 */
function severityCell(value: number): string {
  const s = severityOf(value);
  const dots = [1, 2, 3, 4]
    .map((i) => `<span class="dot${i <= s.value ? ' on' : ''}"></span>`)
    .join('');
  return `<span class="sev"><span class="swatch" style="background:${c[s.token]}"></span><span class="dots">${dots}</span>${s.label}</span>`;
}

const longDate = (d: Date) =>
  d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const isoToLong = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return longDate(new Date(y ?? 0, (m ?? 1) - 1, d ?? 1));
};

/**
 * The Health Report as a self-contained HTML page, for `expo-print`.
 *
 * Written for the clinician who receives it: plain, dense, one page where it
 * can be. It reports what she logged and nothing else — no interpretation, no
 * diagnosis, no score. The one piece of vocabulary it adds is "vasomotor",
 * because that is the word the guidelines use for what she has been calling
 * hot flashes and night sweats.
 *
 * Fonts fall back to Georgia and the system sans: the print renderer does not
 * wait for web fonts, and a report that reflows mid-render is worse than one in
 * a close cousin of the brand face.
 */
export function renderReportHtml(s: MonthSummary, generatedAt = new Date()): string {
  const rows = s.symptoms
    .map(
      (r) => `<tr>
        <td class="name">${esc(r.label)}</td>
        <td><span class="cat" style="background:${c[(categoryOf(r.category)?.token ?? 'catCycle') as keyof typeof c]}"></span>${esc(r.categoryLabel)}</td>
        <td class="num">${r.days}</td>
        <td>${severityCell(r.mean)} <span class="muted">(${r.mean.toFixed(1)})</span></td>
        <td>${severityCell(r.worst)}</td>
      </tr>`,
    )
    .join('');

  const meds = s.medications.length
    ? `<h2>Medication</h2>
       <table><thead><tr><th>Name</th><th>Form</th><th>Dose</th><th>Logged since</th></tr></thead><tbody>
       ${s.medications
         .map(
           (m) => `<tr><td class="name">${esc(m.name)}</td><td>${esc(m.type.charAt(0).toUpperCase() + m.type.slice(1))}</td><td>${m.dose ? esc(m.dose) : '<span class="muted">not recorded</span>'}</td><td>${isoToLong(m.since)}</td></tr>`,
         )
         .join('')}
       </tbody></table>`
    : '';

  const hasVasomotor = s.symptoms.some((r) => r.category === 'temperature');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Nuva health report · ${esc(s.label)}</title>
<style>
  @page { margin: 48px 44px; }
  * { box-sizing: border-box; }
  body { margin: 0; color: ${c.textPrimary}; background: ${c.surfaceRaised};
    font-family: -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 11.5px; line-height: 1.5; }
  .brand { font-family: Georgia, serif; font-size: 15px; color: ${c.night}; }
  h1 { font-family: Fraunces, Georgia, serif; font-weight: 600; font-size: 26px; line-height: 1.2; margin: 18px 0 4px; }
  h2 { font-family: Fraunces, Georgia, serif; font-weight: 600; font-size: 15px; margin: 26px 0 8px; }
  .muted { color: ${c.textTertiary}; }
  .sub { color: ${c.textSecondary}; }
  .stats { display: flex; gap: 12px; margin-top: 18px; }
  .stat { flex: 1; background: ${c.canvas}; border: 1px solid ${c.line}; border-radius: 12px; padding: 12px 14px; }
  .stat b { display: block; font-family: Georgia, serif; font-size: 22px; font-weight: 600; color: ${c.lunaDeep}; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 9.5px; letter-spacing: 0.8px; text-transform: uppercase; color: ${c.textTertiary};
    font-weight: 500; padding: 6px 8px; border-bottom: 1px solid ${c.lineStrong}; }
  td { padding: 7px 8px; border-bottom: 1px solid ${c.line}; vertical-align: middle; }
  tr { page-break-inside: avoid; }
  td.name { font-weight: 500; }
  td.num { font-variant-numeric: tabular-nums; }
  .cat { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: 1px; }
  .sev { white-space: nowrap; }
  .swatch { display: inline-block; width: 14px; height: 10px; border-radius: 3px; margin-right: 6px; vertical-align: -1px; }
  .dots { display: inline-block; margin-right: 6px; }
  .dot { display: inline-block; width: 5px; height: 5px; border-radius: 50%; border: 1px solid ${c.textSecondary}; margin-right: 2px; vertical-align: 1px; }
  .dot.on { background: ${c.textPrimary}; border-color: ${c.textPrimary}; }
  .notes { margin-top: 28px; padding-top: 12px; border-top: 1px solid ${c.line}; color: ${c.textSecondary}; font-size: 10.5px; }
  .notes p { margin: 0 0 6px; }
</style></head>
<body>
  <div class="brand">Nuva</div>
  <h1>Symptom summary</h1>
  <div class="sub">${esc(s.rangeLabel)}${s.inProgress ? ' · month in progress' : ''} · generated ${longDate(generatedAt)}</div>

  <div class="stats">
    <div class="stat"><b>${s.daysLogged}</b>of ${s.daysElapsed} days logged</div>
    <div class="stat"><b>${s.symptomCount}</b>${s.symptomCount === 1 ? 'symptom' : 'symptoms'} logged</div>
    <div class="stat"><b>${s.meanSeverity === null ? '–' : s.meanSeverity.toFixed(1)}</b>mean severity, 1 to 4</div>
  </div>

  ${
    s.symptoms.length
      ? `<h2>Symptoms, most frequent first</h2>
  <table><thead><tr><th>Symptom</th><th>Category</th><th>Days</th><th>Average</th><th>Worst</th></tr></thead>
  <tbody>${rows}</tbody></table>`
      : `<p class="sub" style="margin-top:24px">Nothing was logged in this period.</p>`
  }

  ${meds}

  <div class="notes">
    <p>Self-reported in the Nuva app. Severity is rated on a 4-point scale: 1 Mild, 2 Moderate, 3 Strong, 4 Severe. Days is the number of days the symptom was logged.</p>
    <p>Days without a log are not counted, and are not days without symptoms.</p>
    ${hasVasomotor ? '<p>Temperature symptoms (hot flashes, night sweats, chills) are vasomotor symptoms.</p>' : ''}
  </div>
</body></html>`;
}

