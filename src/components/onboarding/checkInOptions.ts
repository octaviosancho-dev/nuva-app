import { DISC_CYCLE, type QuestionOption } from './OptionList';

/**
 * The four check-in choices, shared by Q6 and the Reminders screen so the
 * setting she changes later is the same one she made on day one.
 *
 * Each carries the `profiles.reminder_hour` it writes. `null` is not "ask again
 * later" — nothing is sent until she changes it. PRODUCT_BRIEF.md section 5.1
 * is explicit that offering it costs some retention and buys the trust the
 * whole product depends on.
 */
export const CHECK_IN_OPTIONS: readonly (QuestionOption & { reminderHour: number | null })[] = [
  { label: 'Morning, 7–9am', icon: 'sunrise', reminderHour: 8, ...DISC_CYCLE[0] },
  { label: 'Midday, 12–2pm', icon: 'sun', reminderHour: 13, ...DISC_CYCLE[1] },
  { label: 'Evening, 8–10pm', icon: 'sunset', reminderHour: 20, ...DISC_CYCLE[2] },
  { label: 'I would rather not be reminded', icon: 'bell-off', reminderHour: null, ...DISC_CYCLE[3] },
];
