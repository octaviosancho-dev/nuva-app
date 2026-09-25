import { category as categoryOf, type CategorySlug } from '@/constants/nuva';
import { supabase } from '@/lib/supabase/client';
import { today } from '@/lib/supabase/logs';
import { requireUserId } from '@/lib/supabase/session';

/** A calendar month, 1-based: `{ year: 2026, month: 9 }` is September 2026. */
export interface Month {
  year: number;
  month: number;
}

export interface SymptomRow {
  slug: string;
  label: string;
  category: CategorySlug;
  categoryLabel: string;
  /** Days this month she logged it. */
  days: number;
  /** Mean severity over those days, 1–4, one decimal. */
  mean: number;
  worst: number;
}

export interface MedicationRow {
  name: string;
  type: string;
  dose: string | null;
  /** `YYYY-MM-DD` — when she added it. */
  since: string;
}

export interface MonthSummary {
  month: Month;
  /** "September 2026". */
  label: string;
  /** "1–30 September 2026", or "1–25 September 2026" for the month in progress. */
  rangeLabel: string;
  daysInMonth: number;
  /** Days of the month that have happened so far, or all of them. */
  daysElapsed: number;
  daysLogged: number;
  /** Distinct symptoms she logged at least once. */
  symptomCount: number;
  /** Mean over every logged symptom-day, one decimal; null with no logs. */
  meanSeverity: number | null;
  /** Most days first, then worst. */
  symptoms: SymptomRow[];
  medications: MedicationRow[];
  inProgress: boolean;
}

export interface MonthListing {
  month: Month;
  label: string;
  daysLogged: number;
}

const iso = (m: Month, day: number) =>
  `${m.year}-${String(m.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

const daysIn = (m: Month) => new Date(m.year, m.month, 0).getDate();

/** "September 2026" — English, because it sits in English copy and on an English report. */
export const monthLabel = (m: Month) =>
  new Date(m.year, m.month - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

export const currentMonth = (now = new Date()): Month => ({
  year: now.getFullYear(),
  month: now.getMonth() + 1,
});

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * One month of her data, reduced to what a specialist reads: how many days she
 * logged, which symptoms, how often and how bad, and what she was taking.
 *
 * Built on the phone from her own rows every time — nothing is stored or sent
 * to produce it. Days she didn't log are counted as not logged, never as days
 * without symptoms; the report says so on the page.
 */
export async function fetchMonthSummary(month: Month, now = new Date()): Promise<MonthSummary> {
  await requireUserId();

  const total = daysIn(month);
  const current = currentMonth(now);
  const inProgress = month.year === current.year && month.month === current.month;
  const elapsed = inProgress ? now.getDate() : total;

  const [logs, meds] = await Promise.all([
    supabase
      .from('symptom_logs')
      .select('logged_on, severity, symptoms(slug, label, category)')
      .gte('logged_on', iso(month, 1))
      .lte('logged_on', iso(month, total)),
    supabase
      .from('medications')
      .select('name, type, dose, created_at')
      .eq('active', true)
      // Anything she was taking at some point in the month.
      .lte('created_at', `${iso(month, total)}T23:59:59`)
      .order('created_at'),
  ]);

  if (logs.error) throw new Error(`Could not read your log: ${logs.error.message}`);
  if (meds.error) throw new Error(`Could not load medications: ${meds.error.message}`);

  const days = new Set<string>();
  const bySymptom = new Map<string, { row: Omit<SymptomRow, 'days' | 'mean' | 'worst'>; severities: number[] }>();
  let sum = 0;
  let count = 0;

  for (const r of logs.data ?? []) {
    if (!r.symptoms) continue;
    days.add(r.logged_on);
    sum += r.severity;
    count += 1;
    const entry = bySymptom.get(r.symptoms.slug) ?? {
      row: {
        slug: r.symptoms.slug,
        label: r.symptoms.label,
        category: r.symptoms.category,
        categoryLabel: categoryOf(r.symptoms.category)?.label ?? r.symptoms.category,
      },
      severities: [],
    };
    entry.severities.push(r.severity);
    bySymptom.set(r.symptoms.slug, entry);
  }

  const symptoms: SymptomRow[] = [...bySymptom.values()]
    .map(({ row, severities }) => ({
      ...row,
      // One row per symptom per day (the log upserts), so rows are days.
      days: severities.length,
      mean: round1(severities.reduce((a, b) => a + b, 0) / severities.length),
      worst: Math.max(...severities),
    }))
    .sort((a, b) => b.days - a.days || b.worst - a.worst || a.label.localeCompare(b.label));

  const label = monthLabel(month);
  const monthName = new Date(month.year, month.month - 1, 1).toLocaleDateString('en-GB', { month: 'long' });

  return {
    month,
    label,
    rangeLabel: `1–${elapsed} ${monthName} ${month.year}`,
    daysInMonth: total,
    daysElapsed: elapsed,
    daysLogged: days.size,
    symptomCount: symptoms.length,
    meanSeverity: count ? round1(sum / count) : null,
    symptoms,
    medications: (meds.data ?? []).map((m) => ({
      name: m.name,
      type: m.type,
      dose: m.dose,
      since: today(new Date(m.created_at)),
    })),
    inProgress,
  };
}

/**
 * Every past month she logged anything in, newest first. The current month is
 * not in this list — it has its own card.
 */
export async function fetchPastMonths(now = new Date()): Promise<MonthListing[]> {
  await requireUserId();

  const current = currentMonth(now);
  const { data, error } = await supabase
    .from('symptom_logs')
    .select('logged_on')
    .lt('logged_on', iso(current, 1));
  if (error) throw new Error(`Could not read your log: ${error.message}`);

  const byMonth = new Map<string, Set<string>>();
  for (const r of data ?? []) {
    const key = r.logged_on.slice(0, 7);
    (byMonth.get(key) ?? byMonth.set(key, new Set()).get(key))?.add(r.logged_on);
  }

  return [...byMonth.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, set]) => {
      const [y, m] = key.split('-').map(Number);
      const month = { year: y ?? current.year, month: m ?? 1 };
      return { month, label: monthLabel(month), daysLogged: set.size };
    });
}
