import { supabase } from './client';
import { requireUserId } from './session';

export interface DayCell {
  /** `YYYY-MM-DD`. */
  date: string;
  /** The day's **worst** logged severity, or null if she did not log. */
  worstSeverity: number | null;
}

/** Local `YYYY-MM-DD`, matching how `logs.ts` writes `logged_on`. */
function iso(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Every day of the given month, with the worst severity logged on it.
 *
 * **Worst, not average.** An average of one severe and five mild symptoms reads
 * as a fine day, and it was not a fine day. A day she did not log comes back as
 * null and is drawn blank — never red, never crossed out, never counted against
 * her.
 */
export async function fetchMonth(month: Date): Promise<DayCell[]> {
  await requireUserId();

  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const { data, error } = await supabase
    .from('symptom_logs')
    .select('logged_on, severity')
    .gte('logged_on', iso(first))
    .lte('logged_on', iso(last));

  if (error) throw new Error(`Could not load the month: ${error.message}`);

  const worst = new Map<string, number>();
  for (const row of data ?? []) {
    const current = worst.get(row.logged_on);
    if (current === undefined || row.severity > current) {
      worst.set(row.logged_on, row.severity);
    }
  }

  const cells: DayCell[] = [];
  for (let d = 1; d <= last.getDate(); d++) {
    const date = iso(new Date(month.getFullYear(), month.getMonth(), d));
    cells.push({ date, worstSeverity: worst.get(date) ?? null });
  }
  return cells;
}

export interface Correlation {
  /** "On days you logged poor sleep, hot flashes were severe 68% of the time." */
  sentence: string;
  /** How many days the claim rests on, so the caller can decide to show it. */
  sampleDays: number;
}

/**
 * A day needs this many occurrences of the first symptom before a co-occurrence
 * is worth stating.
 *
 * Below it the percentage is noise dressed as a finding — "100% of the time"
 * off two days is worse than silence, particularly for someone who has already
 * been handed confident nonsense by people who should have known better.
 */
const MIN_SAMPLE_DAYS = 5;

/** Severity 3 and 4 are "Strong" and "Severe"; 3 is the threshold for the claim. */
const SEVERE_THRESHOLD = 3;

const WINDOW_DAYS = 30;

/**
 * The strongest co-occurrence over the last 30 days, as a plain sentence.
 *
 * Simple counting, no AI and no correlation coefficient shown to her: of the
 * days she logged A, how often was B strong or severe. The brief is explicit
 * that this is arithmetic, not modelling.
 */
export async function fetchCorrelation(): Promise<Correlation | null> {
  await requireUserId();

  const since = new Date();
  since.setDate(since.getDate() - WINDOW_DAYS);

  const { data, error } = await supabase
    .from('symptom_logs')
    .select('logged_on, severity, symptoms(slug, label)')
    .gte('logged_on', iso(since));

  if (error) throw new Error(`Could not load the window: ${error.message}`);

  // day -> symptom label -> severity
  const byDay = new Map<string, Map<string, number>>();
  for (const row of data ?? []) {
    const label = row.symptoms?.label;
    if (!label) continue;
    const day = byDay.get(row.logged_on) ?? new Map<string, number>();
    day.set(label, row.severity);
    byDay.set(row.logged_on, day);
  }

  const days = [...byDay.values()];
  if (days.length < MIN_SAMPLE_DAYS) return null;

  let best: { a: string; b: string; hits: number; total: number } | null = null;

  const labels = new Set(days.flatMap((d) => [...d.keys()]));
  for (const a of labels) {
    const withA = days.filter((d) => d.has(a));
    if (withA.length < MIN_SAMPLE_DAYS) continue;

    for (const b of labels) {
      if (a === b) continue;
      const hits = withA.filter((d) => (d.get(b) ?? 0) >= SEVERE_THRESHOLD).length;
      if (hits === 0) continue;
      if (!best || hits / withA.length > best.hits / best.total) {
        best = { a, b, hits, total: withA.length };
      }
    }
  }

  if (!best) return null;

  const percent = Math.round((best.hits / best.total) * 100);
  return {
    sentence: `On days you logged ${best.a.toLowerCase()}, ${best.b.toLowerCase()} was strong or severe ${percent}% of the time.`,
    sampleDays: best.total,
  };
}

export interface TrendPoint {
  date: string;
  /** 1–4, or null on a day she did not log this symptom. */
  severity: number | null;
}

export interface TrendSeries {
  symptomId: string;
  label: string;
  category: string;
  points: TrendPoint[];
}

/** The symptoms she has actually logged recently, for the chart's selector. */
export async function fetchLoggedSymptoms(): Promise<
  { id: string; label: string; category: string }[]
> {
  await requireUserId();

  const since = new Date();
  since.setDate(since.getDate() - WINDOW_DAYS);

  const { data, error } = await supabase
    .from('symptom_logs')
    .select('symptom_id, symptoms(label, category)')
    .gte('logged_on', iso(since));

  if (error) throw new Error(`Could not load your symptoms: ${error.message}`);

  const seen = new Map<string, { id: string; label: string; category: string }>();
  for (const row of data ?? []) {
    if (!row.symptoms || seen.has(row.symptom_id)) continue;
    seen.set(row.symptom_id, {
      id: row.symptom_id,
      label: row.symptoms.label,
      category: row.symptoms.category,
    });
  }
  return [...seen.values()];
}

/**
 * One symptom's severity across the last 30 days, one point per day.
 *
 * Days she did not log come back as null rather than as zero. Zero would draw
 * the line to the floor and read as "no symptoms", which is a different claim
 * from "no data" — and the one this product must never make on her behalf.
 */
export async function fetchTrend(
  symptomId: string,
  label: string,
  category: string,
): Promise<TrendSeries> {
  await requireUserId();

  const since = new Date();
  since.setDate(since.getDate() - (WINDOW_DAYS - 1));

  const { data, error } = await supabase
    .from('symptom_logs')
    .select('logged_on, severity')
    .eq('symptom_id', symptomId)
    .gte('logged_on', iso(since));

  if (error) throw new Error(`Could not load the trend: ${error.message}`);

  const bySeverity = new Map((data ?? []).map((r) => [r.logged_on, r.severity]));

  const points: TrendPoint[] = [];
  for (let i = 0; i < WINDOW_DAYS; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const date = iso(d);
    points.push({ date, severity: bySeverity.get(date) ?? null });
  }

  return { symptomId, label, category, points };
}
