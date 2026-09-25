import { supabase } from './client';
import { requireUserId } from './session';

/**
 * The artboard says "your last 42 days" — six weeks, which is long enough for a
 * cycle pattern to show and short enough that what she says is still true.
 */
const WINDOW_DAYS = 42;

/** Three sentences and no more. She has to remember them in the room. */
const SENTENCE_COUNT = 3;

/** How many symptoms a sentence names before it stops being sayable. */
const MAX_NAMED = 3;

type Role = 'opening' | 'detail' | 'ask';
const ROLES: Role[] = ['opening', 'detail', 'ask'];

interface Template {
  role: Role;
  symptomSlugs: string[];
  sentence: string;
  orderIndex: number;
  isFallback: boolean;
}

export interface Words {
  sentences: string[];
  /** Whole weeks of tracking behind the sentences. */
  weeks: number;
  /** How many days in the window she actually logged. */
  loggedDays: number;
}

/** "hot flashes, night sweats and anxiety" */
function list(items: string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/**
 * Two or three sentences she can say at her appointment, built from her logs.
 *
 * **Regenerated on every open, never cached.** Her data moved since last time,
 * and the screen says so out loud.
 *
 * The clinical vocabulary in the templates is deliberate and is the whole
 * feature: "vasomotor symptoms" is the phrase that makes a physician listen.
 * Nothing generated here diagnoses or prescribes — every ask is her opening a
 * conversation.
 */
export async function generateWords(): Promise<Words | null> {
  await requireUserId();

  const since = new Date();
  since.setDate(since.getDate() - WINDOW_DAYS);
  const pad = (n: number) => String(n).padStart(2, '0');
  const sinceIso = `${since.getFullYear()}-${pad(since.getMonth() + 1)}-${pad(since.getDate())}`;

  const [{ data: logs, error }, { data: rows, error: templateError }] = await Promise.all([
    supabase
      .from('symptom_logs')
      .select('logged_on, severity, symptoms(slug, label)')
      .gte('logged_on', sinceIso),
    supabase
      .from('word_templates')
      .select('role, symptom_slugs, sentence_template, order_index, is_fallback'),
  ]);

  if (error) throw new Error(`Could not read your log: ${error.message}`);
  if (templateError) throw new Error(`Could not load the templates: ${templateError.message}`);
  if (!logs?.length) return null;

  // Rank her symptoms by how often she logged them, then by how bad they got.
  const tally = new Map<string, { slug: string; label: string; days: number; worst: number }>();
  const days = new Set<string>();
  for (const row of logs) {
    if (!row.symptoms) continue;
    days.add(row.logged_on);
    const entry = tally.get(row.symptoms.slug) ?? {
      slug: row.symptoms.slug,
      label: row.symptoms.label,
      days: 0,
      worst: 0,
    };
    entry.days += 1;
    entry.worst = Math.max(entry.worst, row.severity);
    tally.set(row.symptoms.slug, entry);
  }

  const ranked = [...tally.values()].sort((a, b) => b.days - a.days || b.worst - a.worst);
  const herSlugs = new Set(ranked.map((s) => s.slug));

  const templates: Template[] = (rows ?? []).map((r) => ({
    role: r.role as Role,
    symptomSlugs: r.symptom_slugs,
    sentence: r.sentence_template,
    orderIndex: r.order_index,
    isFallback: r.is_fallback,
  }));

  const weeks = Math.max(1, Math.round(days.size > 0 ? WINDOW_DAYS / 7 : 1));
  const weeksText = `${weeks} weeks`;

  const sentences: string[] = [];

  for (const role of ROLES) {
    const pool = templates.filter((t) => t.role === role);

    // Best overlap with what she actually logged, then the author's order.
    const scored = pool
      .filter((t) => !t.isFallback && t.symptomSlugs.length > 0)
      .map((t) => ({ t, hits: t.symptomSlugs.filter((s) => herSlugs.has(s)).length }))
      .filter((x) => x.hits > 0)
      .sort((a, b) => b.hits - a.hits || a.t.orderIndex - b.t.orderIndex);

    // An empty slug array means "any cluster", not "no cluster".
    const universal = pool
      .filter((t) => !t.isFallback && t.symptomSlugs.length === 0)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    const chosen = scored[0]?.t ?? universal[0] ?? pool.find((t) => t.isFallback);
    if (!chosen) continue;

    // Name the symptoms this template actually speaks to, in her order, so the
    // sentence never lists something it was not written for.
    const named = chosen.symptomSlugs.length
      ? ranked.filter((s) => chosen.symptomSlugs.includes(s.slug))
      : ranked;

    sentences.push(
      chosen.sentence
        .replaceAll('{weeks}', weeksText)
        .replaceAll('{symptoms}', list(named.slice(0, MAX_NAMED).map((s) => s.label.toLowerCase()))),
    );

    if (sentences.length === SENTENCE_COUNT) break;
  }

  return { sentences, weeks, loggedDays: days.size };
}
