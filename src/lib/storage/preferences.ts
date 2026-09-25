import { openStore } from './backend';

/**
 * Device preferences — the things that are about this phone, not about her
 * health. CLAUDE.md puts preferences in MMKV, and these two only change which
 * local notifications this device schedules, so they never need to leave it.
 */
const { store } = openStore('nuva.preferences');

export interface Preferences {
  /** The daily notification mentions today's insight rather than the log. */
  insightReminder: boolean;
  /** A notification on the 1st when last month's report can be exported. */
  reportReminder: boolean;
}

const DEFAULTS: Preferences = { insightReminder: true, reportReminder: true };

export function readPreferences(): Preferences {
  const raw = store.getString('prefs');
  if (!raw) return DEFAULTS;
  try {
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Preferences>) };
  } catch {
    return DEFAULTS;
  }
}

export function savePreference<K extends keyof Preferences>(key: K, value: Preferences[K]): Preferences {
  const next = { ...readPreferences(), [key]: value };
  store.set('prefs', JSON.stringify(next));
  return next;
}
