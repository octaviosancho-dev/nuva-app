import type { CategorySlug } from '@/constants/nuva';
import { supabase } from './client';
import type { Tables } from './database.types';

export type SymptomRow = Tables<'symptoms'>;

export interface CatalogueSymptom {
  id: string;
  slug: string;
  label: string;
  category: CategorySlug;
  icon: string;
}

/**
 * The symptom catalogue, ordered by category and then by the order the design
 * system sets within each one.
 *
 * Reference data: seeded by us, read-only to the app, and the same for every
 * user. It still needs a session — RLS is on, and the read policy is scoped to
 * `authenticated` — but it is not anybody's private data.
 */
export async function fetchSymptoms(): Promise<CatalogueSymptom[]> {
  const { data, error } = await supabase
    .from('symptoms')
    .select('id, slug, label, category, icon, sort_order')
    .order('category')
    .order('sort_order');

  if (error) {
    throw new Error(`Could not load symptoms: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    label: row.label,
    category: row.category as CategorySlug,
    icon: row.icon,
  }));
}
