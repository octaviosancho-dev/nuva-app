import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { Check, Pill, RotateCw, type LucideIcon } from 'lucide-react-native';

import { radius, space, type as typeStyles, type ColorToken } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';
import type { Medication, MedicationType } from '@/lib/supabase/medications';
import { usePressScale } from './motion';

/**
 * A tile colour per form, so two medications are distinguishable at a glance
 * without reading. Not the severity ramp — medication is not severity.
 */
const TILE: Record<MedicationType, { fill: ColorToken; on: ColorToken }> = {
  gel: { fill: 'lunaSoft', on: 'lunaDeep' },
  patch: { fill: 'claySoft', on: 'clay' },
  pill: { fill: 'emberSoft', on: 'emberDeep' },
  spray: { fill: 'sand', on: 'onSand' },
  other: { fill: 'surfaceSunken', on: 'textSecondary' },
};

/** "22:00 daily" — the hour she is checking against. */
function formatSchedule(med: Medication): string | null {
  const hour = med.reminderHour === null ? null : `${String(med.reminderHour).padStart(2, '0')}:00`;
  const parts = [hour, med.frequency].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

export interface MedicationCardProps {
  medication: Medication;
  onToggleTaken: (taken: boolean) => void;
  onEdit?: () => void;
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
}

/**
 * The HRT and medication row.
 *
 * Women on treatment open this every day regardless of how they feel, which
 * makes it the app's most reliable retention surface: the symptom log can be
 * skipped on a good day, a treatment reminder cannot.
 *
 * Nothing here is a score. The take control is undoable for the rest of the
 * day, a day without a dose is simply a day without a row, and adherence is
 * never rendered as a percentage.
 */
export function MedicationCard({
  medication,
  onToggleTaken,
  onEdit,
  icon: Icon = Pill,
  style,
}: MedicationCardProps) {
  const { c, shadow } = useTheme();
  const press = usePressScale(0.99);

  const tile = TILE[medication.type];
  const schedule = formatSchedule(medication);
  const title = medication.dose ? `${medication.name} · ${medication.dose}` : medication.name;

  return (
    <Animated.View style={[press.style, style]}>
      <Pressable
        accessibilityRole={onEdit ? 'button' : 'none'}
        accessibilityLabel={onEdit ? `Edit ${medication.name}` : undefined}
        onPress={onEdit}
        onPressIn={onEdit ? press.onPressIn : undefined}
        onPressOut={onEdit ? press.onPressOut : undefined}
        style={[styles.row, { backgroundColor: c.surface }, shadow.xs]}
      >
        <View style={[styles.tile, { backgroundColor: c[tile.fill] }]}>
          <Icon size={20} strokeWidth={2} color={c[tile.on]} />
        </View>

        <View style={styles.body}>
          <Text style={[typeStyles.labelLG, { color: c.textPrimary }]} numberOfLines={1}>
            {title}
          </Text>

          {schedule ? (
            <Text style={[typeStyles.bodySM, styles.sub, { color: c.textSecondary }]}>
              {schedule}
            </Text>
          ) : null}

          {/*
            Rotation notes, rendered exactly as she wrote them. Forgetting where
            yesterday's gel went is a real daily problem, and this is the answer
            to it — so it sits inline under the dose rather than behind a tap.
          */}
          {medication.rotationNotes ? (
            <View style={styles.rotation}>
              <RotateCw size={13} strokeWidth={2} color={c.emberDeep} />
              <Text style={[typeStyles.bodySM, { color: c.emberDeep }]} numberOfLines={1}>
                {medication.rotationNotes}
              </Text>
            </View>
          ) : null}
        </View>

        <TakeControl
          taken={medication.takenToday}
          name={medication.name}
          onPress={() => onToggleTaken(!medication.takenToday)}
        />
      </Pressable>
    </Animated.View>
  );
}

function TakeControl({
  taken,
  name,
  onPress,
}: {
  taken: boolean;
  name: string;
  onPress: () => void;
}) {
  const { c } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ checked: taken }}
      // Says what a tap does, and what it undoes.
      accessibilityLabel={taken ? `${name} taken today, tap to undo` : `Mark ${name} as taken`}
      onPress={onPress}
      hitSlop={8}
      style={[
        styles.take,
        taken
          ? { backgroundColor: c.luna, borderColor: 'transparent' }
          : { backgroundColor: 'transparent', borderColor: c.lineStrong },
      ]}
    >
      {taken ? <Check size={17} strokeWidth={2.6} color={c.onLuna} /> : null}
    </Pressable>
  );
}

export interface AddMedicationRowProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Never hidden once a medication exists — many women take two, and a gel plus a
 * progesterone capsule is the common pair.
 */
export function AddMedicationRow({ onPress, style }: AddMedicationRowProps) {
  const { c } = useTheme();
  const press = usePressScale(0.99);

  return (
    <Animated.View style={[press.style, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add a medication"
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        // Sunken and shadowless: it is an invitation, not another item.
        style={[styles.row, { backgroundColor: c.surfaceSunken }]}
      >
        <View style={[styles.tile, { backgroundColor: c.surface }]}>
          <Text style={[typeStyles.displaySM, styles.plus, { color: c.textSecondary }]}>+</Text>
        </View>
        <Text style={[typeStyles.labelLG, styles.body, { color: c.textSecondary }]}>
          Add a medication
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
  body: {
    flex: 1,
    minWidth: 0,
  },
  sub: {
    marginTop: 2,
  },
  rotation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: space.space1,
  },
  take: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    lineHeight: 24,
  },
});
