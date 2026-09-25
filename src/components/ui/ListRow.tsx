import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { radius, space, type as typeStyles } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';
import { usePressScale } from './motion';

export interface ListRowProps {
  icon: LucideIcon;
  /** The icon tile's fill — a `-soft` tint or `sand`, never a full hue. */
  tint: string;
  title: string;
  subtitle?: string;
  /** Without it the row is a statement, not a control: no chevron, no press. */
  onPress?: () => void;
  /** A control at the end instead of the chevron — a Toggle. The row itself is then not pressable. */
  trailing?: ReactNode;
}

/**
 * The row used on You and Settings: a tinted icon tile, a title, an optional
 * line under it, and a chevron when it goes somewhere. A row that only reports
 * something has no chevron, so nothing on screen looks tappable and isn't.
 */
export function ListRow({ icon: Icon, tint, title, subtitle, onPress, trailing }: ListRowProps) {
  const { c, shadow } = useTheme();
  const press = usePressScale(0.98);

  const content = (
    <>
      <View style={[styles.tile, { backgroundColor: tint }]}>
        <Icon size={20} strokeWidth={2} color={c.textPrimary} />
      </View>
      <View style={styles.text}>
        <Text style={[typeStyles.labelLG, { color: c.textPrimary }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[typeStyles.bodySM, styles.sub, { color: c.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      {trailing ?? (onPress ? <ChevronRight size={20} strokeWidth={2} color={c.textTertiary} /> : null)}
    </>
  );

  if (!onPress || trailing) {
    return (
      <View
        // With a control inside, the row must not swallow it as one element.
        accessible={!trailing}
        accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
        style={[styles.row, { backgroundColor: c.surface }, shadow.xs]}
      >
        {content}
      </View>
    );
  }

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
        {content}
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
  text: {
    flex: 1,
    minWidth: 0,
  },
  sub: {
    marginTop: 2,
  },
});
