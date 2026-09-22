import { supabase } from './client';
import { requireUserId } from './session';

export interface LogEntry {
  symptomId: string;
  /** 1–4. */
  severity: number;
}

/**
 * Today, in her own timezone, as `YYYY-MM-DD`.
 *
 * Deliberately local rather than UTC. She logs at 11pm — that is the hour the
 * whole product is built around — and in most of the world UTC has already
 * rolled over by then. A log filed under tomorrow's date would put a symptom on
 * a day she had not lived yet, and quietly corrupt every pattern drawn from it.
 */
export function today(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Writes one day's log.
 *
 * Upserts on `(user_id, logged_on, symptom_id)`: logging the same symptom twice
 * in a day is a correction, not a second event. Re-opening the tracker and
 * changing a severity overwrites rather than accumulating.
 *
 * `user_id` is taken from the session rather than passed in — RLS would refuse
 * any other value anyway, and threading it through the UI would invite someone
 * to think it was theirs to choose.
 */
export async function saveLog(entries: readonly LogEntry[], loggedOn = today()): Promise<void> {
  if (entries.length === 0) return;

  const userId = await requireUserId();

  const { error } = await supabase.from('symptom_logs').upsert(
    entries.map((e) => ({
      user_id: userId,
      logged_on: loggedOn,
      symptom_id: e.symptomId,
      severity: e.severity,
    })),
    { onConflict: 'user_id,logged_on,symptom_id' },
  );

  if (error) {
    throw new Error(`Could not save the log: ${error.message}`);
  }
}

export interface LoggedSymptom {
  symptomId: string;
  slug: string;
  label: string;
  severity: number;
}

/** What she logged on a given day, for resuming an edit or showing it back. */
export async function fetchLog(loggedOn = today()): Promise<LoggedSymptom[]> {
  await requireUserId();

  const { data, error } = await supabase
    .from('symptom_logs')
    .select('symptom_id, severity, symptoms(slug, label)')
    .eq('logged_on', loggedOn);

  if (error) {
    throw new Error(`Could not read the log: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    symptomId: row.symptom_id,
    slug: row.symptoms?.slug ?? '',
    label: row.symptoms?.label ?? '',
    severity: row.severity,
  }));
}
