import { router, useFocusEffect } from 'expo-router';
import { BellRing, FileText, Pill, Settings } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { VeraAvatar } from '@/components/art/Vera';
import { CrestHeader, GrainOverlay, ListRow, useEntrance } from '@/components/ui';
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

/** "September summary, ready 1 October" — the month in progress and when it closes. */
function reportLine(now = new Date()): string {
  const month = now.toLocaleDateString('en-GB', { month: 'long' });
  const ready = new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
  });
  return `${month} summary, ready ${ready}`;
}

/**
 * You, from `design/screens/You.dc.html`.
 *
 * Three numbers she built — days logged, insights read, words copied — then the
 * places that are hers to manage. None of the numbers is a streak, and none of
 * them goes down when she misses a day.
 *
 * One deliberate departure from the artboard: its name slot reads "[Your
 * name]" and its subline opens with a stage ("Early perimenopause"). She has no
 * name on file until she signs in with Apple or Google, and the app does not
 * diagnose a stage, so the header says "You" and "tracking since" — nothing it
 * would have to make up.
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
  const report = useEntrance(2, summary !== null);
  const reminders = useEntrance(3, summary !== null);
  const settings = useEntrance(4, summary !== null);

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
          <ListRow
            icon={Pill}
            tint={c.lunaSoft}
            title="HRT and medication"
            subtitle={medsLine}
            onPress={() => router.push('/meds')}
          />
        </Animated.View>

        <Animated.View style={report}>
          <ListRow
            icon={FileText}
            tint={c.sand}
            title="Health report"
            subtitle={reportLine()}
            onPress={() => router.push('/report')}
          />
        </Animated.View>

        <Animated.View style={reminders}>
          <ListRow
            icon={BellRing}
            tint={c.emberSoft}
            title="Reminders"
            subtitle={
              !summary
                ? ' '
                : summary.checkInHour === null
                  ? 'Daily check-in off'
                  : `Check-in at ${pad(summary.checkInHour)}:00`
            }
            onPress={() => router.push('/reminders')}
          />
        </Animated.View>

        <Animated.View style={settings}>
          <ListRow
            icon={Settings}
            tint={c.claySoft}
            title="Settings"
            subtitle="Account and your data"
            onPress={() => router.push('/settings')}
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
});
