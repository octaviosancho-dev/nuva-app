import { router } from 'expo-router';
import { ArrowRight, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  Button,
  CrestHeader,
  GrainOverlay,
  SymptomChip,
  useEntrance,
} from '@/components/ui';
import { alpha, CATEGORIES, type CategorySlug } from '@/constants/nuva';
import { color, opacity, radius, space, type as typeStyles } from '@/constants/tokens';
import { startDraft, toggleSymptom, useDraft } from '@/lib/log/draft';
import { fetchSymptoms, type CatalogueSymptom } from '@/lib/supabase/symptoms';
import { useTheme } from '@/lib/theme';

/** "Thursday 18 September", in her own locale. */
function formatToday(date = new Date()): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

type Filter = CategorySlug | 'all';

/**
 * The tracker's first step, from `design/screens/LogSelect.dc.html`.
 *
 * Everything here serves the sixty-second target. The chips carry the colours
 * and icons she learned in Q2, the category filter narrows a long list without
 * hiding anything, and zero selections is allowed — some days the honest answer
 * is nothing.
 */
export default function LogSelectScreen() {
  const { c } = useTheme();
  const draft = useDraft();

  const [symptoms, setSymptoms] = useState<CatalogueSymptom[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');

  const headline = useEntrance(0);
  const filters = useEntrance(1);

  useEffect(() => {
    // The sixty seconds are counted from here, not from the first tap: time
    // spent deciding what to pick is time the log took.
    startDraft();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchSymptoms()
      .then((rows) => !cancelled && setSymptoms(rows))
      .catch((e: unknown) => !cancelled && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  const visible =
    symptoms?.filter((s) => filter === 'all' || s.category === filter) ?? [];

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="subtle" height={192} fill="night" bare>
        <View style={styles.headerInner}>
          <View style={styles.nav}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={() => router.back()}
              hitSlop={6}
              style={({ pressed }) => [
                styles.close,
                pressed ? { opacity: opacity.pressed } : null,
              ]}
            >
              <X size={18} strokeWidth={2} color={c.textOnNight} />
            </Pressable>
            <View style={styles.navSpacer} />
            <Text style={[typeStyles.caption, { color: c.textOnNightMuted }]}>
              {formatToday()}
            </Text>
          </View>

          <Animated.View style={headline}>
            <Text style={[typeStyles.displayMD, { color: c.textOnNight }]}>
              What did you feel today?
            </Text>
          </Animated.View>
        </View>
      </CrestHeader>

      <View style={styles.body}>
        <Animated.View style={[styles.filters, filters]}>
          <FilterChip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
          {CATEGORIES.map((cat) => (
            <FilterChip
              key={cat.slug}
              label={cat.label}
              active={filter === cat.slug}
              onPress={() => setFilter(cat.slug)}
            />
          ))}
        </Animated.View>

        {error ? (
          <Text style={[typeStyles.bodySM, { color: c.textSecondary }]}>{error}</Text>
        ) : symptoms === null ? (
          <ActivityIndicator color={c.emberDeep} />
        ) : (
          /*
            The grid scrolls. All 34 chips wrap to 19 rows at 375px — about
            1128px against the 448px the screen has for them — so without this
            two thirds of the catalogue is drawn off-screen and unreachable.
            The count and the CTA stay pinned below it, where her thumb is.
          */
          <ScrollView
            style={styles.scroller}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
          >
            {visible.map((symptom, index) => (
              <Chip
                key={symptom.id}
                symptom={symptom}
                index={index}
                selected={draft.some((e) => e.symptom.id === symptom.id)}
              />
            ))}
          </ScrollView>
        )}

        <Text style={[typeStyles.caption, styles.count, { color: c.textTertiary }]}>
          {draft.length} selected across all categories.
        </Text>

        <Button
          label="Set severity"
          icon={ArrowRight}
          disabled={draft.length === 0}
          onPress={() => router.push('/log/severity?index=0')}
        />
      </View>

      <GrainOverlay />
    </View>
  );
}

function Chip({
  symptom,
  index,
  selected,
}: {
  symptom: CatalogueSymptom;
  index: number;
  selected: boolean;
}) {
  const entrance = useEntrance(index);
  return (
    <Animated.View style={entrance}>
      <SymptomChip
        symptom={{ slug: symptom.slug, label: symptom.label, category: symptom.category }}
        selected={selected}
        onToggle={() => toggleSymptom(symptom)}
      />
    </Animated.View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filter,
        active
          ? { backgroundColor: c.textPrimary, borderColor: 'transparent' }
          : { backgroundColor: c.surface, borderColor: c.lineStrong },
        pressed ? { opacity: opacity.pressed } : null,
      ]}
    >
      <Text style={[typeStyles.label, { color: active ? c.canvas : c.textPrimary }]}>
        {label}
      </Text>
    </Pressable>
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
  navSpacer: {
    flex: 1,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: alpha(color.light.textOnNight, 0.16),
  },
  body: {
    flex: 1,
    paddingTop: space.space5,
    paddingHorizontal: space.space6,
    paddingBottom: space.space6,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.space2,
    marginBottom: 18,
  },
  filter: {
    minHeight: 38,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.space3,
    alignContent: 'flex-start',
  },
  scroller: {
    flex: 1,
  },
  count: {
    marginTop: 14,
    marginBottom: space.space3,
  },
});
