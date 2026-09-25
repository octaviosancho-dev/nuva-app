import type { Json } from './database.types';
import { supabase } from './client';
import { requireUserId } from './session';
import { QUESTION_KEYS, readAll } from '@/lib/storage/onboarding';

/** Her IANA zone, e.g. "America/Argentina/Buenos_Aires". The reminder cron reads it. */
function timezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Copies her onboarding answers from the device to Supabase and makes sure her
 * profile row exists, with her timezone and the check-in hour she chose in Q6.
 *
 * Idempotent — every write is an upsert — so it runs each time she enters the
 * app rather than once at a moment that can be missed (a killed app between
 * the paywall and Today, an offline first launch). Six small rows; the cost is
 * nothing.
 *
 * The local copy stays. The tracker reads her Q2 picks synchronously on first
 * render to order the chips, and a network round trip there would flash the
 * default order first.
 *
 * `reminder_hour` is only set when the profile is first created: after that the
 * Reminders screen owns it, and a re-sync must not overwrite a change she made
 * there with what she said on day one.
 */
export async function syncOnboarding(): Promise<void> {
  const userId = await requireUserId();
  const answers = readAll();

  const rows = QUESTION_KEYS.flatMap((key) => {
    const value = answers[key];
    return value === undefined
      ? []
      : [{ user_id: userId, question_key: key, answer: value as unknown as Json }];
  });

  if (rows.length > 0) {
    const { error } = await supabase
      .from('onboarding_answers')
      .upsert(rows, { onConflict: 'user_id,question_key' });
    if (error) throw new Error(`Could not sync your answers: ${error.message}`);
  }

  const { data: existing, error: readError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
  if (readError) throw new Error(`Could not read your profile: ${readError.message}`);

  if (!existing) {
    const { error } = await supabase.from('profiles').insert({
      id: userId,
      timezone: timezone(),
      reminder_hour: answers.checkIn?.reminderHour ?? null,
      onboarding_completed_at: answers.checkIn ? new Date().toISOString() : null,
    });
    if (error) throw new Error(`Could not create your profile: ${error.message}`);
  } else {
    // Timezone follows her when she travels or moves; nothing else is touched.
    const { error } = await supabase.from('profiles').update({ timezone: timezone() }).eq('id', userId);
    if (error) throw new Error(`Could not update your profile: ${error.message}`);
  }
}

export interface Profile {
  reminderHour: number | null;
  timezone: string;
}

export async function fetchProfile(): Promise<Profile | null> {
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from('profiles')
    .select('reminder_hour, timezone')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw new Error(`Could not read your profile: ${error.message}`);
  return data ? { reminderHour: data.reminder_hour, timezone: data.timezone } : null;
}

/** The daily check-in hour, or null for "don't remind me" — honoured literally. */
export async function setReminderHour(hour: number | null): Promise<void> {
  const userId = await requireUserId();
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, reminder_hour: hour, timezone: timezone() }, { onConflict: 'id' });
  if (error) throw new Error(`Could not save the reminder: ${error.message}`);
}
