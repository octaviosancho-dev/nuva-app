import { useSyncExternalStore } from 'react';

import type { CatalogueSymptom } from '@/lib/supabase/symptoms';

/**
 * The log being filled in, held across the two screens it spans.
 *
 * In memory on purpose. A half-finished log is not something worth resuming
 * tomorrow — the whole target is sixty seconds, and a draft that outlives the
 * session would show her yesterday's abandoned attempt as though it were
 * today's. Once saved it belongs to Postgres.
 *
 * `useSyncExternalStore` rather than Context so the two screens read the same
 * store without a provider wrapping a route group they do not share.
 */
export interface DraftEntry {
  symptom: CatalogueSymptom;
  /** Starts at 2. Selecting a symptom must not cost a second tap. */
  severity: number;
}

/** The default every newly selected symptom starts at. */
export const DEFAULT_SEVERITY = 2;

let entries: readonly DraftEntry[] = [];
const listeners = new Set<() => void>();

/**
 * When this log was started. PRODUCT_BRIEF.md calls
 * `symptom_log_completed.duration_ms` the product's health metric: if the median
 * drifts above 60 seconds the tracker needs work, not more features. Measuring
 * it is the only way that sentence means anything.
 */
let startedAt: number | null = null;

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDraft(): readonly DraftEntry[] {
  return entries;
}

/** Starts the clock. Called when the tracker opens, not on the first tap. */
export function startDraft(): void {
  startedAt = Date.now();
}

/** How long this log took, or null if the clock never started. */
export function elapsedMs(): number | null {
  return startedAt === null ? null : Date.now() - startedAt;
}

export function useDraft(): readonly DraftEntry[] {
  return useSyncExternalStore(subscribe, getDraft, getDraft);
}

export function toggleSymptom(symptom: CatalogueSymptom): void {
  entries = entries.some((e) => e.symptom.id === symptom.id)
    ? entries.filter((e) => e.symptom.id !== symptom.id)
    : [...entries, { symptom, severity: DEFAULT_SEVERITY }];
  emit();
}

export function setSeverity(symptomId: string, severity: number): void {
  entries = entries.map((e) => (e.symptom.id === symptomId ? { ...e, severity } : e));
  emit();
}

export function clearDraft(): void {
  entries = [];
  // Deliberately not resetting `startedAt`: the saved screen reads the elapsed
  // time after the draft is cleared, and a log that reports 0 seconds is worse
  // than no measurement at all.
  emit();
}
