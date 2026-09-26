import type { CategorySlug } from '@/constants/nuva';

import { supabase } from './client';
import { requireUserId } from './session';

export interface Validation {
  symptom: { slug: string; label: string; category: CategorySlug };
  percent: number;
  lede: string;
  mechanism: string | null;
  /** Required by the table: an unsourced figure cannot exist. */
  source: string;
  sourceUrl: string | null;
}

/**
 * The sourced statistics for the symptoms she just logged, in the order given.
 *
 * `validation_stats` is written by hand, one row per symptom, and a row cannot
 * be inserted without its source. Symptoms without a row are simply absent —
 * the app never fills the gap with a guess.
 */
export async function fetchValidations(symptomIds: readonly string[]): Promise<Validation[]> {
  if (symptomIds.length === 0) return [];
  await requireUserId();

  const { data, error } = await supabase
    .from('validation_stats')
    .select('symptom_id, percent, lede, mechanism, source, source_url, symptoms(slug, label, category)')
    .in('symptom_id', [...symptomIds]);
  if (error) throw new Error(`Could not load the statistics: ${error.message}`);

  const byId = new Map((data ?? []).map((r) => [r.symptom_id, r]));
  return symptomIds.flatMap((id) => {
    const r = byId.get(id);
    if (!r?.symptoms) return [];
    return [
      {
        symptom: { slug: r.symptoms.slug, label: r.symptoms.label, category: r.symptoms.category },
        percent: r.percent,
        lede: r.lede,
        mechanism: r.mechanism,
        source: r.source,
        sourceUrl: r.source_url,
      },
    ];
  });
}
