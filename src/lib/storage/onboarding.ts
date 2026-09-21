import { createMMKV } from 'react-native-mmkv';

/**
 * Onboarding answers, written to the device as they are given.
 *
 * PRODUCT_BRIEF.md §5.1: answers are persisted to MMKV as they are given, so a
 * killed app resumes where she left off, and synced to Supabase after auth.
 *
 * MMKV rather than AsyncStorage because it is synchronous — a screen can read
 * its previous answer during the first render instead of flashing an unselected
 * state and then correcting itself.
 *
 * This is deliberately the only module that knows MMKV exists. When the Supabase
 * sync lands (milestone 4) it reads `readAll()` and clears with `reset()`.
 */
const store = createMMKV({ id: 'nuva.onboarding' });

/**
 * One key per question. These strings become `onboarding_answers.question_key`
 * in Postgres, so they are a wire format — renaming one orphans existing rows.
 */
export const QUESTION_KEYS = ['timeline', 'symptoms', 'periods', 'doctor', 'goal', 'checkIn'] as const;

export type QuestionKey = (typeof QUESTION_KEYS)[number];

/**
 * What each question stores.
 *
 * `symptoms` is the only multi-select. `checkIn` holds the reminder hour and is
 * the one answer that is meaningfully null: §5.1 is explicit that "I'd rather
 * not be reminded" is honoured literally and permanently, so null is an answer,
 * not an absence.
 */
export interface OnboardingAnswers {
  timeline?: number;
  symptoms?: number[];
  periods?: number;
  doctor?: number;
  goal?: number;
  checkIn?: { index: number; reminderHour: number | null };
}

type AnswerFor<K extends QuestionKey> = NonNullable<OnboardingAnswers[K]>;

/** Persist one answer. Called on every tap, which MMKV is fast enough to absorb. */
export function saveAnswer<K extends QuestionKey>(key: K, value: AnswerFor<K>): void {
  store.set(key, JSON.stringify(value));
}

/** Read one answer back, or undefined if she has not reached that question. */
export function readAnswer<K extends QuestionKey>(key: K): OnboardingAnswers[K] {
  const raw = store.getString(key);
  if (raw == null) {
    return undefined;
  }
  try {
    return JSON.parse(raw) as OnboardingAnswers[K];
  } catch {
    // A value written by an older build that no longer parses is worth less
    // than a clean slate for that one question.
    store.remove(key);
    return undefined;
  }
}

/** Everything answered so far — what the Supabase sync uploads on first login. */
export function readAll(): OnboardingAnswers {
  const answers: OnboardingAnswers = {};
  for (const key of QUESTION_KEYS) {
    const value = readAnswer(key);
    if (value !== undefined) {
      // Each key's value type is checked at the call sites above; this assembles
      // the heterogeneous record the sync layer expects.
      Object.assign(answers, { [key]: value });
    }
  }
  return answers;
}

/** Clear the local copy. Called once the answers are safely in Supabase. */
export function reset(): void {
  for (const key of QUESTION_KEYS) {
    store.remove(key);
  }
}
