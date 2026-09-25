import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

import { SEVERITY } from '@/constants/nuva';
import { supabase } from '@/lib/supabase/client';
import { today } from '@/lib/supabase/logs';
import { requireUserId } from '@/lib/supabase/session';

const HEADER = ['date', 'kind', 'name', 'category', 'severity', 'detail'] as const;
type Row = Record<(typeof HEADER)[number], string>;

/**
 * One CSV cell. Quotes are doubled and anything with a comma, quote or line
 * break is wrapped. A leading `= + - @` is prefixed with an apostrophe: a
 * medication name she typed must never run as a formula when the file is
 * opened in a spreadsheet.
 */
function cell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/**
 * Everything she has logged, as one long-format CSV: one row per symptom per
 * day, per dose taken, and per medication added. Long format because it is the
 * shape a spreadsheet filters and pivots without any reshaping.
 */
export async function buildCsv(): Promise<{ csv: string; rows: number }> {
  await requireUserId();

  const [logs, doses, meds] = await Promise.all([
    supabase.from('symptom_logs').select('logged_on, severity, symptoms(label, category)').order('logged_on'),
    supabase.from('medication_doses').select('taken_on, medications(name, type, dose)').order('taken_on'),
    supabase.from('medications').select('created_at, name, type, dose, rotation_notes, active').order('created_at'),
  ]);
  if (logs.error) throw new Error(`Could not read your log: ${logs.error.message}`);
  if (doses.error) throw new Error(`Could not read your doses: ${doses.error.message}`);
  if (meds.error) throw new Error(`Could not read your medications: ${meds.error.message}`);

  const rows: Row[] = [];

  for (const l of logs.data ?? []) {
    rows.push({
      date: l.logged_on,
      kind: 'symptom',
      name: l.symptoms?.label ?? '',
      category: l.symptoms?.category ?? '',
      severity: String(l.severity),
      detail: SEVERITY[l.severity - 1]?.label ?? '',
    });
  }
  for (const d of doses.data ?? []) {
    rows.push({
      date: d.taken_on,
      kind: 'dose',
      name: d.medications?.name ?? '',
      category: d.medications?.type ?? '',
      severity: '',
      detail: d.medications?.dose ?? '',
    });
  }
  for (const m of meds.data ?? []) {
    rows.push({
      date: today(new Date(m.created_at)),
      kind: m.active ? 'medication_added' : 'medication_added_inactive',
      name: m.name,
      category: m.type,
      severity: '',
      detail: [m.dose, m.rotation_notes].filter(Boolean).join(' · '),
    });
  }

  rows.sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind));

  const lines = [HEADER.join(','), ...rows.map((r) => HEADER.map((k) => cell(r[k])).join(','))];
  // CRLF, per RFC 4180, and what Excel expects.
  return { csv: `${lines.join('\r\n')}\r\n`, rows: rows.length };
}

/**
 * Writes the CSV to the app's cache and opens the share sheet. On web — a
 * development path — it downloads instead. Like the PDF, it is never uploaded.
 */
export async function exportCsv(): Promise<number> {
  const { csv, rows } = await buildCsv();
  const name = `nuva-export-${today()}.csv`;

  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    return rows;
  }

  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  file.create();
  file.write(csv);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/csv',
      UTI: 'public.comma-separated-values-text',
      dialogTitle: 'Nuva export',
    });
  }
  return rows;
}
