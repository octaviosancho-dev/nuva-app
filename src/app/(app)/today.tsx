import { router, useFocusEffect } from 'expo-router';
import { ArrowRight, Bell } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { VeraAvatar } from '@/components/art/Vera';
import { Button, CrestHeader, GrainOverlay, useEntrance } from '@/components/ui';
import { opacity, radius, space, type as typeStyles } from '@/constants/tokens';
import { startDraft } from '@/lib/log/draft';
import { fetchLog, fetchTrackedDays, type LoggedSymptom } from '@/lib/supabase/logs';
import { useTheme } from '@/lib/theme';

/** "Thursday 18 September", in her own locale. */
function formatToday(date = new Date()): string {
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

interface TodayState {
  logged: LoggedSymptom[];
  trackedDays: number;
}

/**
 * The app's home, from `design/screens/Today.dc.html` and its empty twin.
 *
 * The artboard shows four cards: the log, the daily insight, the medication
 * reminder and Find Your Words. Only the log is built — the other three read
 * from content that does not exist yet (90 insights, ~30 sentence templates,
 * the medication CRUD), and a card that promises something the app cannot
 * deliver is worse than no card. They arrive with their milestones.
 *
 * So this is `TodayEmpty` until she logs, and the log summary after. Both are
 * real states with real copy, not scaffolding.
 */
export default function TodayScreen() {
  const { c, shadow } = useTheme();
  const [state, setState] = useState<TodayState | null>(null);

  // Refetched on focus, not just on mount: she arrives here straight after
  // saving a log, and a stale "nothing logged yet" would be the first thing
  // she sees after doing the one thing the app asked of her.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void Promise.all([fetchLog(), fetchTrackedDays()])
        .then(([logged, trackedDays]) => {
          if (!cancelled) setState({ logged, trackedDays });
        })
        .catch(() => {
          if (!cancelled) setState({ logged: [], trackedDays: 0 });
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const card = useEntrance(1);
  const loggedToday = (state?.logged.length ?? 0) > 0;
  // Before her first log, today is day one rather than day zero — which is what
  // the empty copy says out loud.
  const day = (state?.trackedDays ?? 0) + (loggedToday ? 0 : 1);

  const openTracker = () => {
    startDraft();
    router.push('/log');
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="subtle" height={164} fill="night" bare>
        <View style={styles.headerInner}>
          <View style={styles.headRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="You"
              onPress={() => router.navigate('/(app)/you')}
              hitSlop={8}
            >
              <VeraAvatar size={44} />
            </Pressable>

            <View style={styles.headText}>
              <Text style={[typeStyles.eyebrow, { color: c.textOnNightMuted }]}>
                {formatToday().toUpperCase()}
              </Text>
              <Text style={[typeStyles.displayMD, styles.day, { color: c.textOnNight }]}>
                Day {day}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reminders"
              onPress={() => router.navigate('/(app)/you')}
              hitSlop={6}
              style={({ pressed }) => [
                styles.iconButton,
                pressed ? { opacity: opacity.pressed } : null,
              ]}
            >
              <Bell size={18} strokeWidth={2} color={c.textOnNight} />
            </Pressable>
          </View>
        </View>
      </CrestHeader>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.card, { backgroundColor: c.surface }, shadow.sm, card]}>
          <Text style={[typeStyles.eyebrow, { color: c.textTertiary }]}>
            {loggedToday ? "TODAY'S LOG" : 'TODAY'}
          </Text>

          <Text style={[typeStyles.displaySM, styles.cardTitle, { color: c.textPrimary }]}>
            {loggedToday
              ? `${state?.logged.length} logged today.`
              : 'Nothing logged yet'}
          </Text>

          <Text style={[typeStyles.bodySM, styles.cardBody, { color: c.textSecondary }]}>
            {loggedToday
              ? state?.logged.map((l) => l.label).join(' · ')
              : 'The first pattern needs about a week. Today is day one of that week.'}
          </Text>

          <View style={styles.cta}>
            <Button
              label={loggedToday ? 'Edit today' : 'Log symptoms'}
              variant="secondary"
              icon={ArrowRight}
              onPress={openTracker}
            />
          </View>
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
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space3,
  },
  headText: {
    flex: 1,
  },
  day: {
    marginTop: 3,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(253,248,241,0.16)',
  },
  body: {
    paddingTop: space.space5,
    paddingHorizontal: space.space6,
    // Clears the tab bar, which is absolutely positioned over the screen.
    paddingBottom: 120,
    gap: 14,
  },
  card: {
    borderRadius: radius.lg,
    padding: space.space5,
  },
  cardTitle: {
    marginTop: space.space2,
  },
  cardBody: {
    marginTop: space.space2,
  },
  cta: {
    marginTop: 14,
    alignSelf: 'flex-start',
  },
});
