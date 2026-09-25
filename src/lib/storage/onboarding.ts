import { openStore, type StorageEngine } from './backend';

/**
 * Onboarding answers, written to the device as they are given.
 *
 * PRODUCT_BRIEF.md section 5.1: answers are persisted as they are given, so a
 * killed app resumes where she left off, and are synced to Supabase after auth.
 *
 * The store is synchronous, and that is the requirement driving the whole
 * design: a screen reads its previous answer during the first render instead of
 * flashing an unselected state and correcting itself a frame later.
 *
 * Which engine backs it is `backend.ts`'s problem — MMKV where its native
 * module exists, a JSON file in Expo Go, both synchronous. This module stays
 * the only one that knows storage exists at all. `syncOnboarding()` in
 * `lib/supabase/profile.ts` copies `readAll()` up on every entry to the app;
 * the local copy stays, because the tracker reads it synchronously.
 */
const { store, engine } = openStore('nuva.onboarding');

/** Which backend is live. See `backend.ts`; worth quoting in a bug report. */
export const storageEngine: StorageEngine = engine;

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
  /**
   * Symptom **slugs**, not indices. Her picks here seed the tracker's default
   * ordering and eventually join `symptoms.slug` in Postgres, so an index would
   * break the moment the twelve chips are reordered.
   */
  symptoms?: string[];
  periods?: number;
  doctor?: number;
  goal?: number;
  checkIn?: { index: number; reminderHour: number | null };
}

type AnswerFor<K extends QuestionKey> = NonNullable<OnboardingAnswers[K]>;

/** Persist one answer. Called on every tap; both engines absorb that fine. */
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

/** Clear the local copy. Called when she deletes her account. */
export function reset(): void {
  for (const key of QUESTION_KEYS) {
    store.remove(key);
  }
}
