import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Vera } from '@/components/art/Vera';
import { Button, CrestHeader, EyebrowPill, GrainOverlay, useEntrance } from '@/components/ui';
import { radius, space, type as typeStyles } from '@/constants/tokens';
import { elapsedMs } from '@/lib/log/draft';
import { fetchInsights } from '@/lib/supabase/insights';
import { fetchLog, today } from '@/lib/supabase/logs';
import { supabase } from '@/lib/supabase/client';
import { useTheme } from '@/lib/theme';

/** The calendar needs a month of data before its shape means anything. */
const CALENDAR_THRESHOLD = 30;

/**
 * The artboard writes "Eighteen more", but the brand book and CLAUDE.md rule 13
 * both say numbers are numerals — "6 of 34", "71%", "3 days", never "six of
 * thirty-four". The rule is in the list of ones that break silently, so it wins
 * over the one line of sample copy that spelled it out.
 */

interface Stats {
  daysTracked: number;
  symptomsToday: number;
}

/**
 * The confirmation, from `design/screens/LogSaved.dc.html`.
 *
 * Vera celebrates here and only here in the flow — the trigger is that she
 * *finished something*, not what she reported. One screen earlier, where the
 * subject was a severity value, celebrating would have been wrong.
 *
 * The eyebrow shows how long the log took. That number is
 * `symptom_log_completed.duration_ms`, which the brief names the product's
 * health metric, and showing it to her doubles as a promise being kept.
 */
export default function LogSavedScreen() {
  const { c } = useTheme();
  const [stats, setStats] = useState<Stats | null>(null);
  /** Today's insight, if she hasn't read it — picked from the log she just saved. */
  const [insightSlug, setInsightSlug] = useState<string | null>(null);
  const [seconds] = useState(() => {
    const ms = elapsedMs();
    return ms === null ? null : Math.max(1, Math.round(ms / 1000));
  });

  const eyebrow = useEntrance(0);
  const headline = useEntrance(1);
  const lead = useEntrance(2);
  const cards = useEntrance(3);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      // Distinct days she has logged anything, and how many symptoms today.
      const [{ data: days }, log] = await Promise.all([
        supabase.from('symptom_logs').select('logged_on'),
        fetchLog(),
      ]);
      if (cancelled) return;
      const unique = new Set((days ?? []).map((r) => r.logged_on));
      setStats({ daysTracked: unique.size, symptomsToday: log.length });
    })().catch(() => {
      // The log is already saved; a failed count is not worth an error state.
      if (!cancelled) setStats({ daysTracked: 1, symptomsToday: 0 });
    });

    // Fetched after the save, so the weighting already counts today's log:
    // the insight she is offered is about what she just told the app.
    void fetchInsights()
      .then((s) => {
        if (!cancelled && s.today && !s.today.read) setInsightSlug(s.today.slug);
      })
      .catch(() => {
        // No insight offer is fine; "Done" still takes her home.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const readInsight = (slug: string) => {
    // Home first, then the insight, so its back button lands on Today rather
    // than on the tracker she has already finished.
    router.dismissTo('/(app)/today');
    router.push({ pathname: '/insights/[slug]', params: { slug } });
  };

  const remaining = stats ? Math.max(0, CALENDAR_THRESHOLD - stats.daysTracked) : null;

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="standard" height={297} fill="night" bare>
        <View style={styles.headerInner}>
          <Vera pose="celebrate" size={172} />
        </View>
      </CrestHeader>

      <View style={styles.body}>
        {seconds !== null ? (
          <Animated.View style={eyebrow}>
            <EyebrowPill label={`${seconds} seconds`} variant="onLight" />
          </Animated.View>
        ) : null}

        <Animated.View style={[styles.headlineRow, headline]}>
          <Text style={[typeStyles.displayLG, { color: c.textPrimary }]}>Logged.</Text>
        </Animated.View>

        <Animated.View style={[styles.leadRow, lead]}>
          <Text style={[typeStyles.body, { color: c.textSecondary }]}>
            {remaining === null
              ? 'Saved for today.'
              : remaining > 0
                ? `Day ${stats?.daysTracked}. ${remaining} more and the calendar starts showing you the shape of it.`
                : `Day ${stats?.daysTracked}. The calendar has enough to show you the shape of it.`}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.cards, cards]}>
          <StatCard
            value={stats?.daysTracked ?? 0}
            label={stats?.daysTracked === 1 ? 'day tracked' : 'days tracked'}
          />
          <StatCard value={stats?.symptomsToday ?? 0} label="logged today" />
        </Animated.View>

        <View style={styles.spacer} />

        {insightSlug ? (
          <Button
            label="Read today's insight"
            icon={ArrowRight}
            onPress={() => readInsight(insightSlug)}
          />
        ) : (
          <Button
            label="Done"
            // Back to Today, which refetches on focus and will show what she
            // just logged rather than the empty state she left.
            onPress={() => router.replace('/(app)/today')}
          />
        )}
      </View>

      <GrainOverlay />
    </View>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  const { c, shadow } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: c.surface }, shadow.xs]}>
      {/* `luna-deep`, not `luna`: the hue is carrying text on a light ground. */}
      <Text style={[typeStyles.statNumber, { color: c.lunaDeep }]}>{value}</Text>
      <Text style={[typeStyles.bodySM, styles.cardLabel, { color: c.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: space.space2,
  },
  body: {
    flex: 1,
    paddingTop: 26,
    paddingHorizontal: space.space6,
    paddingBottom: space.space6,
  },
  headlineRow: {
    marginTop: space.space3,
  },
  leadRow: {
    marginTop: 10,
  },
  cards: {
    flexDirection: 'row',
    gap: space.space3,
    marginTop: 22,
  },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    padding: 18,
  },
  cardLabel: {
    marginTop: space.space1,
  },
  spacer: {
    flex: 1,
  },
});
