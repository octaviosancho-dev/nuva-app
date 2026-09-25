import { category as categoryOf, type CategorySlug } from '@/constants/nuva';

import { supabase } from './client';
import { today } from './logs';
import { requireUserId } from './session';

/** The brief: weighting reads her last 7 days of logs. */
const WINDOW_DAYS = 7;

/**
 * Silent reading runs at roughly 200–250 words a minute. The low end, because
 * she is reading about her own body and will slow down on the parts that land.
 */
const WORDS_PER_SECOND = 200 / 60;

export interface Insight {
  id: string;
  slug: string;
  title: string;
  /** Never more than three — the seed script refuses a fourth. */
  paragraphs: string[];
  category: CategorySlug;
  categoryLabel: string;
  orderIndex: number;
  /** Rounded up to the next 10, so the promise is never shorter than the read. */
  readingSeconds: number;
}

export interface TodayInsight extends Insight {
  read: boolean;
  /** Her ordinal: the 12th insight she has read is "12 of 90". */
  position: number;
  /** "Because you logged anxiety on 3 of the last 7 days", or null when nothing was weighted. */
  reason: string | null;
}

export interface ReadInsight extends Insight {
  position: number;
}

export interface InsightsState {
  total: number;
  readCount: number;
  today: TodayInsight | null;
  /** Tomorrow's, shown locked. Its title stays legible — a teaser, not a paywall. */
  next: Insight | null;
  /** Newest first, not including today's. */
  read: ReadInsight[];
}

function readingSeconds(paragraphs: string[]): number {
  const words = paragraphs.join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(10, Math.ceil(words / WORDS_PER_SECOND / 10) * 10);
}

interface CategoryWeight {
  category: CategorySlug;
  /** Distinct days in the window she logged anything in this category. */
  days: number;
  /** The symptom she logged on the most days, for the reason line. */
  topLabel: string;
  topDays: number;
}

/**
 * Her categories, heaviest first, over the last 7 days. Weight is counted in
 * days, not rows: 3 symptoms on one bad night is one night, and a category she
 * lives with every day should outrank one that spiked once.
 */
function weigh(
  rows: { logged_on: string; symptoms: { slug: string; label: string; category: string } | null }[],
): CategoryWeight[] {
  const catDays = new Map<string, Set<string>>();
  const symptomDays = new Map<string, { category: string; label: string; days: Set<string> }>();

  for (const row of rows) {
    if (!row.symptoms) continue;
    const { slug, label, category } = row.symptoms;
    (catDays.get(category) ?? catDays.set(category, new Set()).get(category))?.add(row.logged_on);
    const s = symptomDays.get(slug) ?? { category, label, days: new Set<string>() };
    s.days.add(row.logged_on);
    symptomDays.set(slug, s);
  }

  return [...catDays.entries()]
    .map(([category, days]) => {
      const top = [...symptomDays.values()]
        .filter((s) => s.category === category)
        .sort((a, b) => b.days.size - a.days.size)[0];
      return {
        category: category as CategorySlug,
        days: days.size,
        topLabel: top?.label.toLowerCase() ?? '',
        topDays: top?.days.size ?? 0,
      };
    })
    .sort((a, b) => b.days - a.days);
}

/**
 * The next insight to unlock: the first unread one, in the author's order, from
 * her heaviest category that still has any left. With no logs in the window it
 * is simply the first unread one — the rotation is the fallback, not the design.
 */
function pick(
  unread: Insight[],
  weights: CategoryWeight[],
): { insight: Insight; weight: CategoryWeight | null } | null {
  for (const weight of weights) {
    const hit = unread.find((i) => i.category === weight.category);
    if (hit) return { insight: hit, weight };
  }
  const first = unread[0];
  return first ? { insight: first, weight: null } : null;
}

function reasonFor(weight: CategoryWeight | null): string | null {
  if (!weight || !weight.topLabel) return null;
  return `Because you logged ${weight.topLabel} on ${weight.topDays} of the last ${WINDOW_DAYS} days`;
}

/**
 * Everything the insight screens need, in one read.
 *
 * One insight unlocks per day. Once she has read today's, it stays today's until
 * midnight — reading faster does not unlock the next one, because the point is
 * a daily habit she can keep, not a feed she can finish.
 *
 * Which insight is today's is decided when she looks, from her last 7 days. So
 * the one previewed as "unlocks tomorrow" can be overtaken by what she logs in
 * between. That is the loop working, not a broken promise: the teaser is a
 * reason to come back, and the log is what decides what she finds.
 */
export async function fetchInsights(): Promise<InsightsState> {
  await requireUserId();

  const since = new Date();
  since.setDate(since.getDate() - (WINDOW_DAYS - 1));

  const [catalogue, reads, logs] = await Promise.all([
    supabase.from('insights').select('id, slug, title, body, category, order_index').order('order_index'),
    supabase.from('insight_reads').select('insight_id, read_at').order('read_at'),
    supabase
      .from('symptom_logs')
      .select('logged_on, symptoms(slug, label, category)')
      .gte('logged_on', today(since)),
  ]);

  if (catalogue.error) throw new Error(`Could not load the insights: ${catalogue.error.message}`);
  if (reads.error) throw new Error(`Could not load what you have read: ${reads.error.message}`);
  if (logs.error) throw new Error(`Could not read your log: ${logs.error.message}`);

  const all: Insight[] = (catalogue.data ?? []).map((r) => {
    const paragraphs = r.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      paragraphs,
      category: r.category,
      categoryLabel: categoryOf(r.category)?.label ?? r.category,
      orderIndex: r.order_index,
      readingSeconds: readingSeconds(paragraphs),
    };
  });
  const byId = new Map(all.map((i) => [i.id, i]));

  // Reads arrive oldest first, so the index is her ordinal.
  const readList: (ReadInsight & { readOn: string })[] = [];
  for (const r of reads.data ?? []) {
    const insight = byId.get(r.insight_id);
    if (!insight) continue;
    readList.push({ ...insight, position: readList.length + 1, readOn: today(new Date(r.read_at)) });
  }
  const readIds = new Set(readList.map((r) => r.id));
  const weights = weigh(logs.data ?? []);

  let todayInsight: TodayInsight | null = null;
  const readToday = readList.find((r) => r.readOn === today());
  if (readToday) {
    const { readOn: _readOn, ...rest } = readToday;
    todayInsight = {
      ...rest,
      read: true,
      reason: reasonFor(weights.find((w) => w.category === rest.category) ?? null),
    };
  } else {
    const chosen = pick(all.filter((i) => !readIds.has(i.id)), weights);
    if (chosen) {
      todayInsight = {
        ...chosen.insight,
        read: false,
        position: readList.length + 1,
        reason: reasonFor(chosen.weight),
      };
    }
  }

  const next =
    pick(
      all.filter((i) => !readIds.has(i.id) && i.id !== todayInsight?.id),
      weights,
    )?.insight ?? null;

  return {
    total: all.length,
    readCount: readList.length,
    today: todayInsight,
    next,
    read: readList
      .filter((r) => r.id !== todayInsight?.id)
      .reverse()
      .map(({ readOn: _readOn, ...rest }) => rest),
  };
}

/**
 * Marks an insight read. Upserts on `(user_id, insight_id)`, so a second tap —
 * or reopening one she read last week — never creates a second read or moves
 * her ordinal.
 */
export async function markRead(insightId: string): Promise<void> {
  const userId = await requireUserId();
  const { error } = await supabase
    .from('insight_reads')
    .upsert(
      { user_id: userId, insight_id: insightId },
      { onConflict: 'user_id,insight_id', ignoreDuplicates: true },
    );
  if (error) throw new Error(`Could not save that: ${error.message}`);
}
