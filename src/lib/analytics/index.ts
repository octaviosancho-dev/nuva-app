import { supabase } from '@/lib/supabase/client';

/**
 * The events from PRODUCT_BRIEF.md section 8 — the whole list, typed, so a
 * misspelt event or a missing property is a compile error rather than a hole
 * in a funnel discovered a month later.
 *
 * `symptom_log_completed.duration_ms` is the product's health metric: if the
 * median drifts above 60 seconds, the tracker needs work, not more features.
 */
export interface AnalyticsEvents {
  onboarding_started: Record<string, never>;
  onboarding_question_answered: { question_key: string; answer: unknown };
  magic_moment_viewed: Record<string, never>;
  paywall_viewed: { variant: string };
  trial_started: { plan: string };
  subscription_started: { plan: string };

  symptom_log_completed: { symptom_count: number; duration_ms: number | null };
  symptom_validation_viewed: { symptom_slug: string };
  insight_opened: { insight_slug: string };
  insight_completed: { insight_slug: string; dwell_ms: number };
  find_your_words_opened: Record<string, never>;
  find_your_words_copied: Record<string, never>;
  medication_configured: Record<string, never>;
  medication_reminder_tapped: Record<string, never>;
  pattern_view_opened: Record<string, never>;
  health_report_generated: { period_days: number; symptom_count: number };
  health_report_exported: { destination: 'share_sheet' | 'print_preview' | 'web_print' };
}

export type AnalyticsEvent = keyof AnalyticsEvents;

/**
 * PostHog, over its plain HTTP capture endpoint — no SDK, no native module, no
 * new dependency. Both values are public by design (the key is a project
 * ingest key, like the Supabase publishable key), so they live in `.env`.
 *
 * Until the key exists, nothing leaves the phone: events print in development
 * and are dropped in production. When it is added, the privacy policy in
 * `src/content/privacy.ts` must say so in the same change — several of these
 * events carry what she logged.
 */
const KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://eu.i.posthog.com';

async function distinctId(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/**
 * Records one event. Fire-and-forget: analytics must never slow down or break
 * the thing she is doing, so failures are swallowed.
 */
export function track<E extends AnalyticsEvent>(
  event: E,
  ...[properties]: AnalyticsEvents[E] extends Record<string, never> ? [] : [AnalyticsEvents[E]]
): void {
  const props = (properties ?? {}) as Record<string, unknown>;

  if (!KEY) {
    if (__DEV__) console.debug('[nuva:analytics]', event, props);
    return;
  }

  void (async () => {
    try {
      const id = await distinctId();
      if (!id) return;
      await fetch(`${HOST}/capture/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: KEY,
          event,
          distinct_id: id,
          properties: { ...props, $lib: 'nuva-http' },
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      // Dropped. See above.
    }
  })();
}
