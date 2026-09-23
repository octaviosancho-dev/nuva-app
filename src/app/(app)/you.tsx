import { router } from 'expo-router';
import { Pill } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GrainOverlay } from '@/components/ui';
import { opacity, radius, space, type as typeStyles } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';

/**
 * Mostly scaffolding still — reminders, data and subscription land with their
 * milestones. The one real entry is HRT and medication, which is built, and
 * which the artboards reach from here.
 */
export default function YouScreen() {
  const { c, shadow } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <View style={styles.body}>
        <Text style={[typeStyles.displayMD, styles.title, { color: c.textPrimary }]}>You</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="HRT and medication"
          onPress={() => router.push('/meds')}
          style={({ pressed }) => [
            styles.row,
            { backgroundColor: c.surface },
            shadow.xs,
            pressed ? { opacity: opacity.pressed } : null,
          ]}
        >
          <View style={[styles.tile, { backgroundColor: c.lunaSoft }]}>
            <Pill size={20} strokeWidth={2} color={c.lunaDeep} />
          </View>
          <View style={styles.rowBody}>
            <Text style={[typeStyles.labelLG, { color: c.textPrimary }]}>
              HRT and medication
            </Text>
            <Text style={[typeStyles.bodySM, styles.sub, { color: c.textSecondary }]}>
              Daily reminders on their own schedule
            </Text>
          </View>
        </Pressable>

        <Text style={[typeStyles.caption, styles.note, { color: c.textTertiary }]}>
          Reminders, your data and your subscription are not built yet · Milestones 12 and 5
        </Text>
      </View>
      <GrainOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  body: {
    flex: 1,
    paddingTop: 76,
    paddingHorizontal: space.space6,
    paddingBottom: 120,
  },
  title: { marginBottom: space.space6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: space.space4,
  },
  tile: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  sub: { marginTop: 2 },
  note: { marginTop: space.space6 },
});
