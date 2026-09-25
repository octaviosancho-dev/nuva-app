import { router, useFocusEffect } from 'expo-router';
import { ArrowRight, Bell, MessageSquareQuote } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { VeraAvatar } from '@/components/art/Vera';
import {
  Button,
  CrestHeader,
  GrainOverlay,
  InsightCard,
  ListRow,
  MedicationCard,
  TextLink,
  useEntrance,
} from '@/components/ui';
import { opacity, radius, space, type as typeStyles } from '@/constants/tokens';
import { startDraft } from '@/lib/log/draft';
import { fetchInsights, type TodayInsight } from '@/lib/supabase/insights';
import { fetchLog, fetchTrackedDays, type LoggedSymptom } from '@/lib/supabase/logs';
import { fetchMedications, setTakenToday, type Medication } from '@/lib/supabase/medications';
import { useTheme } from '@/lib/theme';

/** "Thursday 18 September", in her own locale. */
function formatToday(date = new Date()): string {
  return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
}

interface TodayState {
  logged: LoggedSymptom[];
  trackedDays: number;
  insight: TodayInsight | null;
  medications: Medication[];
}

/**
 * The app's home, from `design/screens/Today.dc.html` and its empty twin.
 *
 * Four cards, as on the artboard: the log, the daily insight, today's
 * medication, and Find Your Words. The last two appear only when they have
 * something to hold — no medication card before she adds one, no words before
 * she has logged a day for them to be built from.
 *
 * The artboard's words line reads "Ready for your appointment on the 29th".
 * The app does not know her appointments, so it does not claim a date.
 *
 * The log card is `TodayEmpty` until she logs, and the log summary after.
 * The insight card is weighted to her last 7 days, so after a log it can
 * change to follow what she just recorded.
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
      void Promise.all([
        fetchLog(),
        fetchTrackedDays(),
        // The insight is a second card, not the page: if it fails, the log
        // card still shows rather than the whole screen erroring.
        fetchInsights().catch(() => null),
        fetchMedications().catch(() => [] as Medication[]),
      ])
        .then(([logged, trackedDays, insights, medications]) => {
          if (!cancelled) {
            setState({ logged, trackedDays, insight: insights?.today ?? null, medications });
          }
        })
        .catch(() => {
          if (!cancelled) setState({ logged: [], trackedDays: 0, insight: null, medications: [] });
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const card = useEntrance(1);
  const insightCard = useEntrance(2, state?.insight != null);
  const medsCard = useEntrance(3, (state?.medications.length ?? 0) > 0);
  const wordsCard = useEntrance(4, (state?.trackedDays ?? 0) > 0);

  const onToggleTaken = async (med: Medication, taken: boolean) => {
    // Optimistic, as on the medication screen: the tap is the whole interaction.
    const flip = (value: boolean) =>
      setState((s) =>
        s
          ? { ...s, medications: s.medications.map((m) => (m.id === med.id ? { ...m, takenToday: value } : m)) }
          : s,
      );
    flip(taken);
    try {
      await setTakenToday(med.id, taken);
    } catch {
      flip(!taken);
    }
  };
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
              : (state?.trackedDays ?? 0) === 0
                ? 'The first pattern needs about a week. Today is day one of that week.'
                : 'It takes about 60 seconds. A day left blank stays blank — it never counts against you.'}
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

        {state?.insight ? (
          <Animated.View style={[styles.insight, insightCard]}>
            <InsightCard
              state="today"
              title={state.insight.title}
              categoryLabel={state.insight.categoryLabel}
              readingSeconds={state.insight.readingSeconds}
              reason={state.insight.reason}
              readToday={state.insight.read}
              onOpen={() =>
                state.insight &&
                router.push({ pathname: '/insights/[slug]', params: { slug: state.insight.slug } })
              }
            />
            <TextLink
              label="All insights"
              size="caption"
              onPress={() => router.push('/insights')}
              style={styles.allLink}
            />
          </Animated.View>
        ) : null}

        {state && state.medications.length > 0 ? (
          <Animated.View style={[styles.stack, medsCard]}>
            {state.medications.map((med) => (
              <MedicationCard
                key={med.id}
                medication={med}
                onToggleTaken={(taken) => void onToggleTaken(med, taken)}
              />
            ))}
          </Animated.View>
        ) : null}

        {state && state.trackedDays > 0 ? (
          <Animated.View style={wordsCard}>
            <ListRow
              icon={MessageSquareQuote}
              tint={c.emberSoft}
              title="Find your words"
              subtitle="What to say at your next appointment, from your own log"
              onPress={() => router.navigate('/(app)/words')}
            />
          </Animated.View>
        ) : null}
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
  insight: {
    gap: space.space3,
  },
  stack: {
    gap: space.space3,
  },
  allLink: {
    alignSelf: 'flex-start',
  },
  cta: {
    marginTop: 14,
    alignSelf: 'flex-start',
  },
});
