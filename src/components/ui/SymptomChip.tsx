import { type LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  borderWidth,
  chipTones,
  color,
  icon,
  motion,
  radius,
  shadow,
  size,
  space,
} from '@/constants/tokens';
import { type } from '@/constants/typography';
import { usePressFeedback } from './usePressFeedback';

export interface SymptomChipProps {
  label: string;
  icon: LucideIcon;
  /** Position in the grid, in reading order. Drives the tone, cycling `chipTones`. */
  index: number;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Multi-select chip for the 2-column symptom grid.
 *
 * No check badge here — the fill flip is the signal, and twelve badges would be
 * noise. The ink border is always on; only the fill and the icon square swap.
 */
export function SymptomChip({
  label,
  icon: Glyph,
  index,
  selected,
  onPress,
  style,
}: SymptomChipProps) {
  const tone = chipTones[index % chipTones.length];

  const feedback = usePressFeedback();
  const selection = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    selection.value = withTiming(selected ? 1 : 0, { duration: motion.duration.select });
  }, [selected, selection]);

  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(selection.value, [0, 1], [color.paper, tone]),
    shadowOpacity: selection.value,
  }));

  const squareStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(selection.value, [0, 1], [tone, color.cream]),
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={feedback.onPressIn}
      onPressOut={feedback.onPressOut}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      style={style}
    >
      {/* `shadow.chip` first — see OptionCard; it carries shadowOpacity 1 and
          `styles.chip` zeroes it. */}
      <Animated.View style={[shadow.chip, styles.chip, chipStyle, feedback.style]}>
        <Animated.View style={[styles.square, squareStyle]}>
          <Glyph size={icon.chip.size} strokeWidth={icon.chip.strokeWidth} color={color.ink} />
        </Animated.View>
        <Text style={[type.chipLabel, styles.label]} numberOfLines={2}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: size.chipMinHeight,
    borderRadius: radius.md,
    borderWidth: borderWidth.chip,
    borderColor: color.ink,
    padding: space.xs,
    gap: space.sm,
    // See OptionCard — selection drives shadowOpacity up from 0.
    shadowOpacity: 0,
  },
  square: {
    width: size.chipIcon,
    height: size.chipIcon,
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
});
