import { router, useFocusEffect } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { CrestHeader, GrainOverlay, TrendChart, useEntrance } from '@/components/ui';
import { category } from '@/constants/nuva';
import { opacity, radius, space, type as typeStyles, type ColorToken } from '@/constants/tokens';
import {
  fetchLoggedSymptoms,
  fetchTrend,
  type TrendSeries,
} from '@/lib/supabase/patterns';
import { useTheme } from '@/lib/theme';

interface Choice {
  id: string;
  label: string;
  category: string;
}

/**
 * Over time, from `design/screens/PatternTrend.dc.html`.
 *
 * The selector offers only symptoms she has actually logged in the window —
 * charting a symptom with no data would produce an empty axis and an implied
 * question about why it is empty.
 */
export default function TrendScreen() {
  const { c, shadow } = useTheme();

  const [choices, setChoices] = useState<Choice[] | null>(null);
  const [selected, setSelected] = useState<Choice | null>(null);
  const [series, setSeries] = useState<TrendSeries | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { width: screenWidth } = useWindowDimensions();

  /**
   * Computed rather than measured. This was on `onLayout`, which never fired
   * on a container that had already been laid out — the chart then sat on a
   * spinner forever with its parent a visible 309px wide. The layout is fully
   * determined by the screen, so deriving it removes the observer and the race
   * with it: screen, minus the two 24px gutters, minus the card's 18px padding
   * either side, minus the y-axis column and its gap.
   */
  const plotWidth = Math.max(0, screenWidth - 48 - 36 - 24);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void fetchLoggedSymptoms()
        .then((list) => {
          if (cancelled) return;
          setChoices(list);
          setSelected((current) => current ?? list[0] ?? null);
        })
        .catch((e: unknown) => {
          if (!cancelled) setError(e instanceof Error ? e.message : String(e));
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (!selected) return;
      let cancelled = false;
      setSeries(null);
      void fetchTrend(selected.id, selected.label, selected.category)
        .then((s) => !cancelled && setSeries(s))
        .catch((e: unknown) => {
          if (!cancelled) setError(e instanceof Error ? e.message : String(e));
        });
      return () => {
        cancelled = true;
      };
    }, [selected]),
  );

  const card = useEntrance(0);

  const loggedDays = series?.points.filter((p) => p.severity !== null).length ?? 0;

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="subtle" height={203} fill="night" bare>
        <View style={styles.headerInner}>
          <View style={styles.nav}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(app)/patterns'))}
              hitSlop={6}
              style={({ pressed }) => [
                styles.back,
                pressed ? { opacity: opacity.pressed } : null,
              ]}
            >
              <ArrowLeft size={18} strokeWidth={2} color={c.textOnNight} />
            </Pressable>
            <Text style={[typeStyles.displayMD, styles.title, { color: c.textOnNight }]}>
              Over time
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.choices}
          >
            {(choices ?? []).map((choice) => {
              const active = selected?.id === choice.id;
              const cat = category(choice.category);
              return (
                <Pressable
                  key={choice.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={choice.label}
                  onPress={() => setSelected(choice)}
                  style={[
                    styles.choice,
                    active
                      ? {
                          backgroundColor: c[(cat?.token ?? 'catPhysical') as ColorToken],
                          borderColor: 'transparent',
                        }
                      : {
                          backgroundColor: 'rgba(253,248,241,0.1)',
                          borderColor: 'rgba(253,248,241,0.2)',
                        },
                  ]}
                >
                  <Text
                    style={[
                      typeStyles.label,
                      {
                        color: active
                          ? c[(cat?.on ?? 'onLuna') as ColorToken]
                          : c.textOnNight,
                      },
                    ]}
                  >
                    {choice.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </CrestHeader>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.card, { backgroundColor: c.surface }, shadow.sm, card]}>
          {error ? (
            <Text style={[typeStyles.bodySM, { color: c.clay }]}>{error}</Text>
          ) : choices !== null && choices.length === 0 ? (
            <Text style={[typeStyles.body, { color: c.textSecondary }]}>
              Nothing logged in the last 30 days yet. The line needs a few days before it
              says anything.
            </Text>
          ) : (
            <>
              <View style={styles.cardHead}>
                <Text style={[typeStyles.displaySM, { color: c.textPrimary }]}>
                  {selected?.label ?? ''}
                </Text>
                <Text style={[typeStyles.caption, { color: c.textSecondary }]}>
                  Last 30 days
                </Text>
              </View>

              <View style={styles.plot}>
                {series === null || plotWidth === 0 ? (
                  <ActivityIndicator color={c.emberDeep} />
                ) : (
                  <TrendChart
                    key={series.symptomId}
                    points={series.points}
                    categorySlug={series.category}
                    width={plotWidth}
                  />
                )}
              </View>

              {series && loggedDays > 0 ? (
                <Text style={[typeStyles.caption, styles.footnote, { color: c.textTertiary }]}>
                  {loggedDays} of the last 30 days logged. Gaps are days you did not log.
                </Text>
              ) : null}
            </>
          )}
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
    paddingLeft: space.space6,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space3,
    marginBottom: 14,
    paddingRight: space.space6,
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(253,248,241,0.16)',
  },
  title: {
    flex: 1,
  },
  choices: {
    gap: space.space2,
    paddingRight: space.space6,
    // A horizontal ScrollView stretches its children to the container height by
    // default, which turned 36px pills into circles.
    alignItems: 'center',
  },
  choice: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingTop: 22,
    paddingHorizontal: space.space6,
    paddingBottom: space.space6,
  },
  card: {
    borderRadius: radius.lg,
    padding: 18,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  plot: {
    marginTop: 14,
    minHeight: 132,
    justifyContent: 'center',
  },
  footnote: {
    marginTop: 14,
  },
});
