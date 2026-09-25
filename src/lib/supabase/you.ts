import { supabase } from './client';
import { requireUserId } from './session';

export interface YouSummary {
  /** Distinct days she has logged anything. */
  daysLogged: number;
  /** Her first logged day, `YYYY-MM-DD`, or null before the first log. */
  since: string | null;
  insightsRead: number;
  wordsCopied: number;
  activeMedications: number;
  /** The next medication reminder hour from now, wrapping to tomorrow. */
  nextReminderHour: number | null;
}

/**
 * The next reminder hour after the current one, or the earliest tomorrow. An
 * hour that is now is treated as past: at 22:30 the 22:00 reminder has fired.
 */
export function nextHour(hours: number[], now = new Date()): number | null {
  if (hours.length === 0) return null;
  const sorted = [...new Set(hours)].sort((a, b) => a - b);
  return sorted.find((h) => h > now.getHours()) ?? sorted[0] ?? null;
}

/**
 * Everything the You screen counts. Every number here is something she built —
 * days, reads, copies — and none is a streak or a score. Nothing on this screen
 * goes down because she missed a day.
 */
export async function fetchYouSummary(): Promise<YouSummary> {
  await requireUserId();

  const [logs, reads, copies, meds] = await Promise.all([
    supabase.from('symptom_logs').select('logged_on'),
    supabase.from('insight_reads').select('id', { count: 'exact', head: true }),
    supabase.from('words_copies').select('id', { count: 'exact', head: true }),
    supabase.from('medications').select('reminder_hour').eq('active', true),
  ]);

  if (logs.error) throw new Error(`Could not read your log: ${logs.error.message}`);
  if (reads.error) throw new Error(`Could not count your insights: ${reads.error.message}`);
  if (copies.error) throw new Error(`Could not count your copies: ${copies.error.message}`);
  if (meds.error) throw new Error(`Could not load medications: ${meds.error.message}`);

  const days = [...new Set((logs.data ?? []).map((r) => r.logged_on))].sort();
  const hours = (meds.data ?? [])
    .map((m) => m.reminder_hour)
    .filter((h): h is number => h !== null);

  return {
    daysLogged: days.length,
    since: days[0] ?? null,
    insightsRead: reads.count ?? 0,
    wordsCopied: copies.count ?? 0,
    activeMedications: meds.data?.length ?? 0,
    nextReminderHour: nextHour(hours),
  };
}

/** One row per "Copy all three". `user_id` defaults to `auth.uid()` in the table. */
export async function recordWordsCopied(): Promise<void> {
  await requireUserId();
  const { error } = await supabase.from('words_copies').insert({});
  if (error) throw new Error(`Could not record the copy: ${error.message}`);
}
