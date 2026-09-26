import { router } from 'expo-router';
import { ArrowRight, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button, EyebrowPill, GrainOverlay, useEntrance, ValidationCard } from '@/components/ui';
import { alpha } from '@/constants/nuva';
import { opacity, radius, space, type as typeStyles } from '@/constants/tokens';
import { track } from '@/lib/analytics';
import { fetchLog } from '@/lib/supabase/logs';
import { fetchValidations, type Validation } from '@/lib/supabase/validation';
import { useTheme } from '@/lib/theme';

/**
 * The validation stat, from `design/screens/LogValidation.dc.html` — shown
 * straight after a save when at least one symptom she logged has a sourced
 * figure. When none does, the tracker skips this screen entirely.
 *
 * The first symptom gets the full card; the rest are compact rows, because
 * three full cards in a row is a lecture (ValidationCard spec).
 *
 * Two deliberate departures from the artboard:
 * - Each figure carries its source in a caption. The artboard shows none, but
 *   a number about her own body has to be checkable.
 * - "Done" is `secondary`. The spec says the card's number is the only ember
 *   on this screen, and a primary button would be a second.
 */
export default function LogValidationScreen() {
  const { c } = useTheme();
  const [items, setItems] = useState<Validation[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchLog()
      .then((log) => fetchValidations(log.map((l) => l.symptomId)))
      .then((v) => {
        if (cancelled) return;
        // Nothing to show after all (a race with a deleted row): move on.
        if (v.length === 0) {
          router.replace('/log/saved');
          return;
        }
        setItems(v);
        for (const item of v) track('symptom_validation_viewed', { symptom_slug: item.symptom.slug });
      })
      .catch(() => {
        if (!cancelled) router.replace('/log/saved');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const head = useEntrance(0);
  const rest = useEntrance(2, items !== null);
  const action = useEntrance(3, items !== null);

  const [first, ...others] = items ?? [];

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.head, head]}>
          <EyebrowPill label="Saved" variant="onLight" />
          <View style={styles.spacer} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            onPress={() => router.replace('/(app)/today')}
            hitSlop={6}
            style={({ pressed }) => [
              styles.close,
              { backgroundColor: alpha(c.textPrimary, 0.08) },
              pressed ? { opacity: opacity.pressed } : null,
            ]}
          >
            <X size={17} strokeWidth={2} color={c.textPrimary} />
          </Pressable>
        </Animated.View>

        {first ? (
          <>
            <ValidationCard
              symptom={first.symptom}
              percent={first.percent}
              lede={first.lede}
              mechanism={first.mechanism ?? undefined}
              loggedLabel="logged just now"
              variant="full"
            />
            <Text style={[typeStyles.caption, styles.source, { color: c.textTertiary }]}>
              Source: {first.source}
            </Text>
          </>
        ) : null}

        {others.length > 0 ? (
          <Animated.View style={[styles.rest, rest]}>
            <Text style={[typeStyles.eyebrow, styles.restLabel, { color: c.textTertiary }]}>
              THE REST OF TODAY&rsquo;S LOG
            </Text>
            {others.map((v) => (
              <View key={v.symptom.slug} style={styles.compact}>
                <ValidationCard
                  symptom={v.symptom}
                  percent={v.percent}
                  lede={v.mechanism ?? v.lede}
                  variant="compact"
                />
                <Text style={[typeStyles.caption, { color: c.textTertiary }]}>Source: {v.source}</Text>
              </View>
            ))}
          </Animated.View>
        ) : null}

        <View style={styles.push} />

        {items ? (
          <Animated.View style={action}>
            <Button
              label="Done"
              icon={ArrowRight}
              variant="secondary"
              onPress={() => router.replace('/log/saved')}
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
  body: {
    flexGrow: 1,
    paddingTop: 58,
    paddingHorizontal: space.space6,
    paddingBottom: space.space6,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space3,
    marginBottom: space.space5,
  },
  spacer: {
    flex: 1,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  source: {
    marginTop: space.space2,
  },
  rest: {
    gap: space.space3,
  },
  restLabel: {
    marginTop: space.space6,
  },
  compact: {
    gap: space.space1,
  },
  push: {
    flex: 1,
    minHeight: space.space6,
  },
});
