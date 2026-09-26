import { router, useFocusEffect } from 'expo-router';
import { ChartLine, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { CalendarHeat, CrestHeader, GrainOverlay, useEntrance } from '@/components/ui';
import { alpha } from '@/constants/nuva';
import { color, opacity, radius, space, type as typeStyles } from '@/constants/tokens';
import { track } from '@/lib/analytics';
import { today } from '@/lib/supabase/logs';
import {
  fetchCorrelation,
  fetchMonth,
  type Correlation,
  type DayCell,
} from '@/lib/supabase/patterns';
import { useTheme } from '@/lib/theme';

function monthLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/**
 * The pattern view, from `design/screens/Patterns.dc.html`.
 *
 * Two things here refuse to make a gap look like a failure: a day she did not
 * log is drawn blank rather than coloured, and the footnote says so in her
 * language. The correlation is plain counting over 30 days — the brief is
 * explicit that this is arithmetic, not modelling, and no coefficient is ever
 * shown to her.
 *
 * The per-symptom trend line is the other half of this milestone and lives on
 * its own screen; this is the month.
 */
export default function PatternsScreen() {
  const { c, shadow } = useTheme();
  const now = new Date();

  const [month, setMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const [days, setDays] = useState<DayCell[] | null>(null);
  const [correlation, setCorrelation] = useState<Correlation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    setDays(null);
    void Promise.all([fetchMonth(month), fetchCorrelation()])
      .then(([d, corr]) => {
        if (cancelled) return;
        setDays(d);
        setCorrelation(corr);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [month]);

  useFocusEffect(load);
  useFocusEffect(
    useCallback(() => {
      track('pattern_view_opened');
    }, []),
  );

  const calendar = useEntrance(0);
  const coOccurs = useEntrance(2);

  // There is no data ahead of today, so there is nowhere forward to go.
  const atCurrentMonth = sameMonth(month, now);

  const step = (delta: number) =>
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  const loggedDays = days?.filter((d) => d.worstSeverity !== null).length ?? 0;

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="subtle" height={210} fill="night" bare>
        <View style={styles.headerInner}>
          <View style={styles.titleRow}>
            <Text style={[typeStyles.displayMD, styles.title, { color: c.textOnNight }]}>
              Patterns
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Trends"
              onPress={() => router.push('/trend')}
              hitSlop={8}
              style={({ pressed }) => [
                styles.trendButton,
                pressed ? { opacity: opacity.pressed } : null,
              ]}
            >
              <ChartLine size={17} strokeWidth={2} color={c.textOnNight} />
            </Pressable>
          </View>

          <View style={styles.monthNav}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Previous month"
              onPress={() => step(-1)}
              hitSlop={8}
              style={({ pressed }) => [
                styles.navButton,
                { backgroundColor: alpha(color.light.textOnNight, 0.16) },
                pressed ? { opacity: opacity.pressed } : null,
              ]}
            >
              <ChevronLeft size={17} strokeWidth={2} color={c.textOnNight} />
            </Pressable>

            <Text style={[typeStyles.labelLG, styles.monthLabel, { color: c.textOnNight }]}>
              {monthLabel(month)}
            </Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Next month"
              accessibilityState={{ disabled: atCurrentMonth }}
              disabled={atCurrentMonth}
              onPress={() => step(1)}
              hitSlop={8}
              style={({ pressed }) => [
                styles.navButton,
                {
                  backgroundColor: atCurrentMonth
                    ? alpha(color.light.textOnNight, 0.08)
                    : alpha(color.light.textOnNight, 0.16),
                },
                atCurrentMonth ? { opacity: opacity.disabled } : null,
                pressed && !atCurrentMonth ? { opacity: opacity.pressed } : null,
              ]}
            >
              <ChevronRight size={17} strokeWidth={2} color={c.textOnNight} />
            </Pressable>
          </View>
        </View>
      </CrestHeader>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.card, { backgroundColor: c.surface }, shadow.sm, calendar]}>
          {error ? (
            <Text style={[typeStyles.bodySM, { color: c.clay }]}>{error}</Text>
          ) : days === null ? (
            <ActivityIndicator color={c.emberDeep} />
          ) : (
            <CalendarHeat month={month} days={days} today={today()} />
          )}
        </Animated.View>

        <Animated.View
          style={[styles.card, styles.coOccurs, { backgroundColor: c.surface }, shadow.xs, coOccurs]}
        >
          <Text style={[typeStyles.eyebrow, { color: c.textTertiary }]}>WHAT CO-OCCURS</Text>

          <Text style={[typeStyles.body, styles.sentence, { color: c.textPrimary }]}>
            {correlation
              ? correlation.sentence
              : loggedDays > 0
                ? 'Not enough days yet to say anything worth saying.'
                : 'Nothing logged this month yet.'}
          </Text>

          {/*
            The second sentence is the important one. She has spent months being
            told her symptoms are her fault; a blank day in her own tracker is
            not going to be one more thing held against her.
          */}
          <Text style={[typeStyles.caption, styles.footnote, { color: c.textTertiary }]}>
            Rolling 30 days. Blank days are days you did not log, and nothing is counted
            against you.
          </Text>
        </Animated.View>
      </ScrollView>

      <GrainOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerInner: {
    flex: 1,
    paddingTop: 58,
    paddingHorizontal: space.space6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space3,
    marginBottom: 14,
  },
  title: {
    flex: 1,
  },
  trendButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(color.light.textOnNight, 0.16),
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthLabel: {
    flex: 1,
    textAlign: 'center',
  },
  body: {
    paddingTop: space.space5,
    paddingHorizontal: space.space6,
    // Clears the tab bar.
    paddingBottom: 120,
  },
  card: {
    borderRadius: radius.lg,
    padding: 18,
  },
  coOccurs: {
    marginTop: space.space4,
  },
  sentence: {
    marginTop: space.space3,
  },
  footnote: {
    marginTop: 10,
  },
});
