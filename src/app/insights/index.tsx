import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { BackButton, CrestHeader, GrainOverlay, InsightCard, useEntrance } from '@/components/ui';
import { space, type as typeStyles } from '@/constants/tokens';
import { fetchInsights, type InsightsState } from '@/lib/supabase/insights';
import { useTheme } from '@/lib/theme';

/**
 * Insights, from `design/screens/Insights.dc.html`.
 *
 * Today's card, tomorrow's locked, then everything she has read, newest first.
 * The count in the header is hers — "12 of 90 read" — and there is no streak
 * beside it. A day she didn't open the app is not a day she failed at.
 */
export default function InsightsScreen() {
  const { c } = useTheme();
  const [state, setState] = useState<InsightsState | null>(null);
  const [error, setError] = useState<string | null>(null);

  // On focus, not mount: she comes back here straight after marking one read.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void fetchInsights()
        .then((s) => {
          if (!cancelled) setState(s);
        })
        .catch((e: unknown) => {
          if (!cancelled) setError(e instanceof Error ? e.message : String(e));
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const leave = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(app)/today');
    }
  };

  const open = (slug: string) => router.push({ pathname: '/insights/[slug]', params: { slug } });

  const todayCard = useEntrance(0, state !== null);
  const nextCard = useEntrance(1, state !== null);

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="subtle" height={168} fill="night" bare>
        <View style={styles.headerInner}>
          <View style={styles.nav}>
            <BackButton onPress={leave} />
            <View style={styles.spacer} />
            {state ? (
              <Text style={[typeStyles.caption, styles.tabular, { color: c.textOnNightMuted }]}>
                {state.readCount} of {state.total} read
              </Text>
            ) : null}
          </View>
          <Text style={[typeStyles.displayMD, { color: c.textOnNight }]}>Insights</Text>
        </View>
      </CrestHeader>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {error ? (
          <Text style={[typeStyles.bodySM, { color: c.clay }]}>{error}</Text>
        ) : !state ? (
          <ActivityIndicator color={c.emberDeep} />
        ) : (
          <>
            {state.today ? (
              <Animated.View style={todayCard}>
                <InsightCard
                  state="today"
                  title={state.today.title}
                  categoryLabel={state.today.categoryLabel}
                  readingSeconds={state.today.readingSeconds}
                  reason={state.today.reason}
                  readToday={state.today.read}
                  onOpen={() => state.today && open(state.today.slug)}
                />
              </Animated.View>
            ) : (
              <Text style={[typeStyles.body, { color: c.textSecondary }]}>
                You have read all {state.total}. New ones are added as they are written.
              </Text>
            )}

            {state.next ? (
              <Animated.View style={nextCard}>
                <Text style={[typeStyles.eyebrow, styles.section, { color: c.textTertiary }]}>
                  NEXT UP
                </Text>
                <InsightCard
                  state="locked"
                  title={state.next.title}
                  categoryLabel={state.next.categoryLabel}
                />
              </Animated.View>
            ) : null}

            {state.read.length > 0 ? (
              <View style={styles.list}>
                {state.read.map((insight, i) => (
                  <ReadRow
                    key={insight.id}
                    order={i + 2}
                    title={insight.title}
                    categoryLabel={insight.categoryLabel}
                    position={insight.position}
                    onOpen={() => open(insight.slug)}
                  />
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      <GrainOverlay />
    </View>
  );
}

function ReadRow({
  order,
  ...card
}: {
  order: number;
  title: string;
  categoryLabel: string;
  position: number;
  onOpen: () => void;
}) {
  const entrance = useEntrance(order);
  return (
    <Animated.View style={entrance}>
      <InsightCard state="read" {...card} />
    </Animated.View>
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
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space3,
    marginBottom: 14,
  },
  spacer: {
    flex: 1,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  body: {
    paddingTop: space.space5,
    paddingHorizontal: space.space6,
    paddingBottom: space.space6,
  },
  section: {
    marginTop: space.space6,
    marginBottom: space.space3,
  },
  list: {
    marginTop: space.space3,
    gap: space.space3,
  },
});
