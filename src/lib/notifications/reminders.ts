import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { readPreferences } from '@/lib/storage/preferences';
import { fetchInsights } from '@/lib/supabase/insights';
import { fetchLog } from '@/lib/supabase/logs';
import { fetchMedications } from '@/lib/supabase/medications';
import { fetchProfile } from '@/lib/supabase/profile';

/**
 * How far ahead the daily check-in is scheduled, one notification per day.
 * Re-planned every time she opens the app, so in practice the window never
 * runs out for someone who uses it; for someone who stops for two weeks, the
 * reminders stop too, which is the polite outcome.
 */
const HORIZON_DAYS = 14;

export type ReminderStatus = 'scheduled' | 'nothing' | 'denied' | 'unsupported';

/** Where each notification opens when tapped. Read by the listener in `_layout`. */
export type ReminderUrl = '/log' | '/insights' | '/meds' | '/report';

interface Planned {
  content: Notifications.NotificationContentInput;
  trigger: Notifications.NotificationTriggerInput;
}

const content = (title: string, body: string, url: ReminderUrl): Notifications.NotificationContentInput => ({
  title,
  body,
  data: { url },
});

/**
 * The copy. Plain, no exclamation marks, nothing that treats a missed day as a
 * failure — a reminder is an invitation, and a day she skips is simply blank.
 */
export const REMINDER_COPY = {
  checkIn: () =>
    content('Your body has a pattern.', 'Log today to start seeing it. It takes about 60 seconds.', '/log'),
  insight: () =>
    content(
      'One insight is waiting for you today.',
      'Under a minute to read, picked from what you have been logging.',
      '/insights',
    ),
  report: () =>
    content("Last month's report is ready.", 'A summary for a specialist, built on your phone.', '/report'),
  medication: (name: string, dose: string | null, rotation: string | null) =>
    rotation
      ? content(rotation, `${name}${dose ? `, ${dose}` : ''}. Tap when it is done.`, '/meds')
      : content(`${name}${dose ? `, ${dose}` : ''}`, 'Tap when it is done.', '/meds'),
};

/**
 * Plans every local notification from what she has chosen, then replaces
 * whatever was scheduled before with it.
 *
 * - The daily check-in, at the hour from Q6 or the Reminders screen, as one
 *   dated notification per day for the next two weeks — not a repeating one,
 *   so that today's can be dropped once she has already logged. She is never
 *   reminded to do something she has done.
 * - With the insight preference on, that same daily notification speaks about
 *   the insight instead of the log. One notification a day, never two.
 * - Each medication with a reminder hour, daily, on its own schedule.
 * - Last month's report, on the 1st, at the check-in hour.
 *
 * With the check-in off, nothing is sent except the medication reminders she
 * set on each medication herself. That is the Reminders screen's promise.
 *
 * Local notifications need no server and no push credentials. The server-side
 * segments in the brief (trial, re-engagement) are push and email, and wait
 * for the Apple Developer account and Resend.
 */
export async function applyReminders({
  requestPermission = false,
}: { requestPermission?: boolean } = {}): Promise<ReminderStatus> {
  if (Platform.OS === 'web') return 'unsupported';

  const [profile, medications, loggedToday, insights] = await Promise.all([
    fetchProfile(),
    fetchMedications(),
    fetchLog().then((l) => l.length > 0),
    fetchInsights().catch(() => null),
  ]);
  const prefs = readPreferences();
  const hour = profile?.reminderHour ?? null;

  const planned: Planned[] = [];

  if (hour !== null) {
    const now = new Date();
    for (let i = 0; i < HORIZON_DAYS; i++) {
      const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, hour, 0, 0);
      if (at <= now) continue;

      if (i === 0) {
        // Today is the one day we know about. Logged already: say nothing,
        // unless there is an insight she has not read and wants to hear about.
        const insightWaiting = prefs.insightReminder && insights?.today && !insights.today.read;
        if (loggedToday && !insightWaiting) continue;
        planned.push({
          content: insightWaiting ? REMINDER_COPY.insight() : REMINDER_COPY.checkIn(),
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
        });
        continue;
      }

      planned.push({
        content: prefs.insightReminder ? REMINDER_COPY.insight() : REMINDER_COPY.checkIn(),
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at },
      });
    }

    if (prefs.reportReminder) {
      planned.push({
        content: REMINDER_COPY.report(),
        trigger: { type: Notifications.SchedulableTriggerInputTypes.MONTHLY, day: 1, hour, minute: 0 },
      });
    }
  }

  for (const med of medications) {
    if (med.reminderHour === null) continue;
    planned.push({
      content: REMINDER_COPY.medication(med.name, med.dose, med.rotationNotes),
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: med.reminderHour,
        minute: 0,
      },
    });
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
  if (planned.length === 0) return 'nothing';

  let { status } = await Notifications.getPermissionsAsync();
  if (status === 'undetermined' && requestPermission) {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  if (status !== 'granted') return 'denied';

  for (const p of planned) {
    await Notifications.scheduleNotificationAsync(p);
  }
  return 'scheduled';
}

/** Everything off — used when she deletes her account. */
export async function cancelReminders(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}
