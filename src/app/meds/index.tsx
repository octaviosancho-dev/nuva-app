import { router, useFocusEffect } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  AddMedicationRow,
  CrestHeader,
  GrainOverlay,
  MedicationCard,
  useEntrance,
} from '@/components/ui';
import { opacity, radius, space, type as typeStyles } from '@/constants/tokens';
import {
  fetchMedicationStats,
  fetchMedications,
  setTakenToday,
  type Medication,
  type MedicationStats,
} from '@/lib/supabase/medications';
import { useTheme } from '@/lib/theme';

/** "Jun" — the month she started, not a full date. */
function startedMonth(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short' });
}

/**
 * HRT and medication, from `design/screens/Meds.dc.html`.
 *
 * The two stat tiles are the only numbers here, and neither is adherence: days
 * tracked and the month she started. A missed day never breaks anything, never
 * turns red and never resets with a warning — the number exists to show her the
 * data she has built, not to make her feel watched.
 */
export default function MedsScreen() {
  const { c } = useTheme();
  const [meds, setMeds] = useState<Medication[] | null>(null);
  const [stats, setStats] = useState<MedicationStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    let cancelled = false;
    void Promise.all([fetchMedications(), fetchMedicationStats()])
      .then(([m, s]) => {
        if (cancelled) return;
        setMeds(m);
        setStats(s);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Refetched on focus: she returns here straight after adding one.
  useFocusEffect(load);

  const onToggle = async (med: Medication, taken: boolean) => {
    // Optimistic: the control is the whole interaction, and waiting on a round
    // trip to fill a checkbox reads as a broken tap.
    setMeds((current) =>
      current?.map((m) => (m.id === med.id ? { ...m, takenToday: taken } : m)) ?? null,
    );
    try {
      await setTakenToday(med.id, taken);
      const fresh = await fetchMedicationStats();
      setStats(fresh);
    } catch (e: unknown) {
      setMeds((current) =>
        current?.map((m) => (m.id === med.id ? { ...m, takenToday: !taken } : m)) ?? null,
      );
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const tiles = useEntrance(0);
  const label = useEntrance(1);

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="subtle" height={200} fill="night" bare>
        <View style={styles.headerInner}>
          <View style={styles.nav}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              hitSlop={6}
              style={({ pressed }) => [
                styles.back,
                pressed ? { opacity: opacity.pressed } : null,
              ]}
            >
              <ArrowLeft size={18} strokeWidth={2} color={c.textOnNight} />
            </Pressable>
            <Text style={[typeStyles.displayMD, styles.title, { color: c.textOnNight }]}>
              HRT and medication
            </Text>
          </View>

          <Text style={[typeStyles.bodySM, { color: c.textOnNightMuted }]}>
            Two reminders, fired on their own schedule.
          </Text>
        </View>
      </CrestHeader>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.tiles, tiles]}>
          <StatTile
            value={String(stats?.daysTracked ?? 0)}
            label={stats?.daysTracked === 1 ? 'day tracked' : 'days tracked'}
          />
          <StatTile value={startedMonth(stats?.startedAt ?? null)} label="started HRT" />
        </Animated.View>

        <Animated.View style={label}>
          <Text style={[typeStyles.eyebrow, styles.today, { color: c.textTertiary }]}>TODAY</Text>
        </Animated.View>

        {error ? (
          <Text style={[typeStyles.bodySM, { color: c.clay }]}>{error}</Text>
        ) : meds === null ? (
          <ActivityIndicator color={c.emberDeep} />
        ) : (
          meds.map((med) => (
            <MedicationCard
              key={med.id}
              medication={med}
              onToggleTaken={(taken) => void onToggle(med, taken)}
            />
          ))
        )}

        <AddMedicationRow onPress={() => router.push('/meds/add')} />
      </ScrollView>

      <GrainOverlay />
    </View>
  );
}

function StatTile({ value, label }: { value: string; label: string }) {
  const { c, shadow } = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: c.surface }, shadow.xs]}>
      {/* `luna-deep`, not `luna`: the hue is carrying text on a light ground. */}
      <Text style={[typeStyles.statNumber, { color: c.lunaDeep }]}>{value}</Text>
      <Text style={[typeStyles.bodySM, styles.tileLabel, { color: c.textSecondary }]}>
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
    paddingTop: 58,
    paddingHorizontal: space.space6,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space3,
    marginBottom: 10,
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
  body: {
    paddingTop: 22,
    paddingHorizontal: space.space6,
    paddingBottom: space.space6,
    gap: space.space3,
  },
  tiles: {
    flexDirection: 'row',
    gap: space.space3,
  },
  tile: {
    flex: 1,
    borderRadius: radius.lg,
    padding: 18,
  },
  tileLabel: {
    marginTop: space.space1,
  },
  today: {
    marginTop: 10,
  },
});
