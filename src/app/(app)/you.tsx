import { router, useFocusEffect } from 'expo-router';
import { ChevronRight, Pill, type LucideIcon } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { VeraAvatar } from '@/components/art/Vera';
import { CrestHeader, GrainOverlay, useEntrance, usePressScale } from '@/components/ui';
import { radius, space, type as typeStyles } from '@/constants/tokens';
import { fetchYouSummary, type YouSummary } from '@/lib/supabase/you';
import { useTheme } from '@/lib/theme';

/**
 * "6 September". Pinned to English rather than her locale, because it sits
 * inside an English sentence — "Tracking since 6 de septiembre" reads broken.
 * When the app is translated, this moves with the copy.
 */
function formatSince(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y ?? 0, (m ?? 1) - 1, d ?? 1).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
  });
}

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * You, from `design/screens/You.dc.html`.
 *
 * Three numbers she built — days logged, insights read, words copied — then the
 * places that are hers to manage. None of the numbers is a streak, and none of
 * them goes down when she misses a day.
 *
 * Two departures from the artboard, both deliberate:
 *
 * - The artboard's name slot reads "[Your name]" and its subline opens with a
 *   stage ("Early perimenopause"). She has no name on file until she signs in
 *   with Apple or Google, and the app does not diagnose a stage, so the header
 *   says "You" and "tracking since" — nothing it would have to make up.
 * - Health report, Reminders and Settings are rows on the artboard. Their
 *   screens are not built yet, and a row that leads nowhere is worse than no
 *   row, so they join this list when their screens exist.
 */
export default function YouScreen() {
  const { c } = useTheme();
  const [summary, setSummary] = useState<YouSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // On focus: she comes back here from the medication screens and from a copy.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void fetchYouSummary()
        .then((s) => {
          if (!cancelled) setSummary(s);
        })
        .catch((e: unknown) => {
          if (!cancelled) setError(e instanceof Error ? e.message : String(e));
        });
      return () => {
        cancelled = true;
      };
    }, []),
  );

  const stats = useEntrance(0, summary !== null);
  const meds = useEntrance(1, summary !== null);

  const medsLine = !summary
    ? ' '
    : summary.activeMedications === 0
      ? 'Add what you take, with its own reminder'
      : `${summary.activeMedications} active` +
        (summary.nextReminderHour !== null ? ` · next at ${pad(summary.nextReminderHour)}:00` : '');

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="subtle" height={196} fill="night" bare>
        <View style={styles.headerInner}>
          <VeraAvatar size={64} />
          <View style={styles.headText}>
            <Text style={[typeStyles.displayMD, { color: c.textOnNight }]}>You</Text>
            <Text style={[typeStyles.bodySM, styles.subline, { color: c.textOnNightMuted }]}>
              {summary?.since
                ? `Tracking since ${formatSince(summary.since)}`
                : summary
                  ? 'Nothing logged yet'
                  : ' '}
            </Text>
          </View>
        </View>
      </CrestHeader>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {error ? <Text style={[typeStyles.bodySM, { color: c.clay }]}>{error}</Text> : null}

        <Animated.View style={[styles.tiles, stats]}>
          <StatTile value={summary?.daysLogged} label={summary?.daysLogged === 1 ? 'day logged' : 'days logged'} />
          <StatTile value={summary?.insightsRead} label={summary?.insightsRead === 1 ? 'insight' : 'insights'} />
          <StatTile value={summary?.wordsCopied} label="words copied" />
        </Animated.View>

        <Animated.View style={meds}>
          <Row
            icon={Pill}
            tint={c.lunaSoft}
            title="HRT and medication"
            subtitle={medsLine}
            onPress={() => router.push('/meds')}
          />
        </Animated.View>
      </ScrollView>

      <GrainOverlay />
    </View>
  );
}

function StatTile({ value, label }: { value: number | undefined; label: string }) {
  const { c, shadow } = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: c.surface }, shadow.xs]}>
      {/* `luna-deep`, not `luna`: the hue is carrying text on a light ground. */}
      <Text style={[typeStyles.statNumber, { color: c.lunaDeep }]}>{value ?? '–'}</Text>
      <Text style={[typeStyles.bodySM, styles.tileLabel, { color: c.textSecondary }]}>{label}</Text>
    </View>
  );
}

function Row({
  icon: Icon,
  tint,
  title,
  subtitle,
  onPress,
}: {
  icon: LucideIcon;
  tint: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const { c, shadow } = useTheme();
  const press = usePressScale(0.98);
  return (
    <Animated.View style={press.style}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityHint={subtitle}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[styles.row, { backgroundColor: c.surface }, shadow.xs]}
      >
        <View style={[styles.rowIcon, { backgroundColor: tint }]}>
          <Icon size={20} strokeWidth={2} color={c.textPrimary} />
        </View>
        <View style={styles.rowText}>
          <Text style={[typeStyles.labelLG, { color: c.textPrimary }]}>{title}</Text>
          <Text style={[typeStyles.bodySM, styles.rowSub, { color: c.textSecondary }]}>{subtitle}</Text>
        </View>
        <ChevronRight size={20} strokeWidth={2} color={c.textTertiary} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space4,
    paddingTop: 58,
    paddingHorizontal: space.space6,
  },
  headText: {
    flex: 1,
  },
  subline: {
    marginTop: space.space1,
  },
  body: {
    paddingTop: space.space5,
    paddingHorizontal: space.space6,
    // Clears the tab bar, which is absolutely positioned over the screen.
    paddingBottom: 120,
    gap: space.space3,
  },
  tiles: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
    borderRadius: radius.lg,
    padding: space.space4,
  },
  tileLabel: {
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: space.space4,
  },
  rowIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowSub: {
    marginTop: 2,
  },
});
