import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { MOTION, SEVERITY } from '@/constants/nuva';
import { radius, space, type as typeStyles, type ColorToken } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';
import { ease } from './motion';

/** Monday first, as the artboard sets it. */
const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** 12ms per cell, capped so a full month never takes longer than this. */
const STAGGER_MS = 12;
const STAGGER_CAP_MS = 400;

export interface DayCell {
  /** `YYYY-MM-DD`. */
  date: string;
  /** The day's worst logged severity, or null if she did not log. */
  worstSeverity: number | null;
}

export interface CalendarHeatProps {
  /** Any date inside the month being shown. */
  month: Date;
  days: readonly DayCell[];
  /** `YYYY-MM-DD` to outline as "here". */
  today?: string;
  onSelectDay?: (date: string) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * A month grid coloured by each day's worst logged severity.
 *
 * **Blank means no data**, and the key says so. A day she did not log is
 * `surface-sunken` with a quiet number — never red, never crossed out, never
 * counted against her. That is the same principle the medication tracker
 * follows and it is not negotiable: a gap in the data is not a failure.
 */
export function CalendarHeat({ month, days, today, onSelectDay, style }: CalendarHeatProps) {
  const { c } = useTheme();

  // getDay() is Sunday-first; the grid is Monday-first.
  const firstWeekday = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;

  return (
    <View style={style}>
      <View style={styles.grid}>
        {WEEKDAYS.map((d, i) => (
          <View key={i} style={styles.cellBox}>
            <Text style={[typeStyles.caption, styles.weekday, { color: c.textTertiary }]}>
              {d}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {/* Leading blanks so the 1st lands on its weekday. */}
        {Array.from({ length: firstWeekday }, (_, i) => (
          <View key={`pad-${i}`} style={styles.cellBox} />
        ))}

        {days.map((day, i) => (
          <Cell
            key={day.date}
            day={day}
            index={firstWeekday + i}
            isToday={day.date === today}
            onPress={onSelectDay ? () => onSelectDay(day.date) : undefined}
          />
        ))}
      </View>

      <View style={[styles.key, { borderTopColor: c.line }]}>
        <Text style={[typeStyles.caption, { color: c.textTertiary }]}>
          Worst symptom that day
        </Text>
        <View style={styles.keyItems}>
          {SEVERITY.map((s) => (
            <View key={s.value} style={styles.keyItem}>
              <View style={[styles.swatch, { backgroundColor: c[s.token as ColorToken] }]} />
              <Text style={[typeStyles.caption, { color: c.textSecondary }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

interface CellProps {
  day: DayCell;
  index: number;
  isToday: boolean;
  onPress?: () => void;
}

function Cell({ day, index, isToday, onPress }: CellProps) {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const enter = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      enter.value = 1;
      return;
    }
    enter.value = withDelay(
      Math.min(index * STAGGER_MS, STAGGER_CAP_MS),
      withTiming(1, { duration: MOTION.duration.quick, easing: ease.enter }),
    );
  }, [index, reduced, enter]);

  const style = useAnimatedStyle(() => ({
    opacity: enter.value,
    transform: reduced ? [] : [{ scale: 0.9 + 0.1 * enter.value }],
  }));

  const logged = day.worstSeverity !== null;
  const step = logged ? SEVERITY.find((s) => s.value === day.worstSeverity) : undefined;

  const background = step ? c[step.token as ColorToken] : c.surfaceSunken;
  /**
   * `severity-4` is clay and takes cream; the paler three take ink. The design
   * system's `on-*` pairs do not cover the severity ramp, because no text is
   * ever meant to sit *on* a swatch — the date number is the one exception the
   * calendar makes, so the pairing is resolved here rather than invented as a
   * token.
   */
  const number = !logged
    ? c.textTertiary
    : day.worstSeverity === 4
      ? c.textOnNight
      : c.textPrimary;

  const dayNumber = Number(day.date.slice(8));

  return (
    <Animated.View style={[styles.cellBox, reduced ? null : style]}>
      <Pressable
        accessibilityRole={onPress ? 'button' : 'none'}
        accessibilityLabel={
          logged
            ? `${dayNumber}, worst ${step?.label.toLowerCase()}`
            : `${dayNumber}, not logged`
        }
        onPress={onPress}
        style={[
          styles.cell,
          { backgroundColor: background },
          // Same treatment as `focus-ring`, so it reads as "here" rather than
          // as a selection.
          isToday ? { borderWidth: 2, borderColor: c.textPrimary } : null,
        ]}
      >
        <Text style={[typeStyles.caption, styles.number, { color: number }]}>{dayNumber}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  /**
   * Exactly a seventh of the row, with the gap applied inside as padding.
   * `gap` plus `flexBasis` fights itself at seven columns — the rounding leaves
   * the last cell a pixel short on some widths and wraps it to its own row.
   */
  cellBox: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: space.space1,
  },
  cell: {
    flex: 1,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekday: {
    textAlign: 'center',
    width: '100%',
  },
  number: {
    fontVariant: ['tabular-nums'],
  },
  key: {
    marginTop: space.space4,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 10,
  },
  keyItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  keyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  swatch: {
    width: 12,
    height: 12,
    borderRadius: 5,
  },
});
