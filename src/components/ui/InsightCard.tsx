import { ArrowRight, ChevronRight, Lock } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { radius, space, type as typeStyles } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';
import { EyebrowPill } from './chrome';
import { usePressScale } from './motion';

export interface InsightCardProps {
  title: string;
  categoryLabel: string;
  state: 'today' | 'locked' | 'read';
  /** Today only — shown as "40 seconds". */
  readingSeconds?: number;
  /** Today only. Why this one, in her own symptoms. */
  reason?: string | null;
  /** Today only — she has already read it; it stays today's until midnight. */
  readToday?: boolean;
  /** Read only — her ordinal, set in the number tile. */
  position?: number;
  onOpen?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * The daily insight, in the three states the list shows. The open state is its
 * own screen (`src/app/insights/[slug].tsx`), because it is where she reads.
 *
 * Today is `sand` with the one `ember` eyebrow; locked keeps its title legible
 * on purpose, because a teaser she can read is a reason to come back and a
 * blurred rectangle is a paywall; read is marked quietly — a secondary title
 * and the word "read", never a badge.
 */
export function InsightCard({
  title,
  categoryLabel,
  state,
  readingSeconds,
  reason,
  readToday = false,
  position,
  onOpen,
  style,
}: InsightCardProps) {
  const { c, shadow } = useTheme();
  const press = usePressScale(0.98);

  if (state === 'today') {
    return (
      <Animated.View style={[press.style, style]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Today's insight: ${title}`}
          onPress={onOpen}
          onPressIn={press.onPressIn}
          onPressOut={press.onPressOut}
          style={[styles.today, { backgroundColor: c.sand }]}
        >
          <View style={styles.todayHead}>
            <EyebrowPill label="Today" variant="ember" />
            <Text style={[typeStyles.caption, { color: c.textSecondary }]}>
              {readingSeconds} seconds · {categoryLabel}
            </Text>
          </View>

          <Text style={[typeStyles.displaySM, styles.todayTitle, { color: c.onSand }]}>{title}</Text>

          <View style={styles.todayFoot}>
            <Text style={[typeStyles.bodySM, styles.reason, { color: c.textSecondary }]}>
              {readToday
                ? 'Read. The next one unlocks tomorrow'
                : (reason ?? 'Log a few days and these start following what you log')}
            </Text>
            <ArrowRight size={20} strokeWidth={2} color={c.onSand} />
          </View>
        </Pressable>
      </Animated.View>
    );
  }

  if (state === 'locked') {
    return (
      <View
        accessible
        accessibilityLabel={`${title}. Unlocks tomorrow.`}
        style={[styles.row, { backgroundColor: c.surface, borderColor: c.line }, styles.lockedRow, style]}
      >
        <View style={[styles.tile, { backgroundColor: c.surfaceSunken }]}>
          <Lock size={18} strokeWidth={2} color={c.textTertiary} />
        </View>
        <View style={styles.rowText}>
          <Text style={[typeStyles.labelLG, { color: c.textTertiary }]}>{title}</Text>
          <Text style={[typeStyles.caption, styles.rowCaption, { color: c.textTertiary }]}>
            Unlocks tomorrow · {categoryLabel}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View style={[press.style, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${title}, read`}
        onPress={onOpen}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[styles.row, { backgroundColor: c.surface }, shadow.xs]}
      >
        <View style={[styles.tile, { backgroundColor: c.surfaceSunken }]}>
          <Text style={[typeStyles.label, styles.tabular, { color: c.textSecondary }]}>
            {String(position ?? 0).padStart(2, '0')}
          </Text>
        </View>
        <View style={styles.rowText}>
          <Text style={[typeStyles.labelLG, { color: c.textSecondary }]}>{title}</Text>
          <Text style={[typeStyles.caption, styles.rowCaption, { color: c.textTertiary }]}>
            {categoryLabel} · read
          </Text>
        </View>
        <ChevronRight size={20} strokeWidth={2} color={c.textTertiary} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  today: {
    borderRadius: radius.xl,
    padding: space.space5,
  },
  todayHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space2,
  },
  todayTitle: {
    marginTop: space.space3,
  },
  todayFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.space3,
    marginTop: 14,
  },
  reason: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: radius.lg,
    paddingVertical: space.space4,
    paddingHorizontal: 18,
  },
  lockedRow: {
    borderWidth: 1,
  },
  tile: {
    width: 38,
    height: 38,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  rowText: {
    flex: 1,
  },
  rowCaption: {
    marginTop: 2,
  },
});
