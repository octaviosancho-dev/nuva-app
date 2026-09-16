import { Check, type LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  borderWidth,
  color,
  icon,
  motion,
  optionFills,
  radius,
  shadow,
  size,
  space,
} from '@/constants/tokens';
import { type } from '@/constants/typography';
import { usePressFeedback } from './usePressFeedback';

export interface OptionCardProps {
  label: string;
  /** Present only on the cards that need one — it takes the card to minHeight 84. */
  subLabel?: string;
  icon: LucideIcon;
  /** Position in the list. Drives the fill, cycling `optionFills`. */
  index: number;
  /**
   * Overrides the cycled fill. Only the paywall needs this: §7 pins the yearly
   * plan to mustard and monthly to tan, which is not where `optionFills` would
   * land them. Quiz screens always leave this alone and let the cycle decide.
   */
  fill?: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Single-select card.
 *
 * The fill NEVER changes on selection — selection is an ink border plus a hard
 * offset shadow. The border is reserved at full width while unselected (drawn in
 * the card's own fill, which React Native paints under the border box) so
 * selecting never reflows the card.
 */
export function OptionCard({
  label,
  subLabel,
  icon: Glyph,
  index,
  fill: fillOverride,
  selected,
  onPress,
  style,
}: OptionCardProps) {
  const fill = fillOverride ?? optionFills[index % optionFills.length];
  const tall = subLabel != null;

  const reducedMotion = useReducedMotion();
  const feedback = usePressFeedback();
  const selection = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    selection.value = withTiming(selected ? 1 : 0, { duration: motion.duration.select });
  }, [selected, selection]);

  const cardStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(selection.value, [0, 1], [fill, color.ink]),
    shadowOpacity: selection.value,
  }));

  const badgeStyle = useAnimatedStyle(() => {
    if (reducedMotion) {
      return { opacity: selection.value };
    }
    return {
      opacity: selection.value,
      transform: [{ scale: interpolate(selection.value, [0, 1], [0.7, 1]) }],
    };
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={feedback.onPressIn}
      onPressOut={feedback.onPressOut}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={subLabel == null ? label : `${label}. ${subLabel}`}
      style={style}
    >
      <Animated.View
        style={[
          // `shadow.card` must come first: it carries shadowOpacity 1, and
          // `styles.card` zeroes it. The other way round the token wins and every
          // unselected card renders a full ink shadow until Reanimated's first
          // frame lands.
          shadow.card,
          styles.card,
          tall ? styles.cardTall : styles.cardShort,
          // borderColor must have a static value too. React Native falls back to
          // black when a bordered view has none, so a card would flash a 2.5px
          // black rim on its first frame, before the animated style resolves.
          { backgroundColor: fill, borderColor: fill },
          cardStyle,
          feedback.style,
        ]}
      >
        <View style={[styles.iconCircle, tall ? styles.iconCircleTall : styles.iconCircleShort]}>
          <Glyph size={icon.option.size} strokeWidth={icon.option.strokeWidth} color={color.ink} />
        </View>

        <View style={styles.copy}>
          {tall ? (
            <>
              <Text style={type.optionTitle}>{label}</Text>
              <Text style={type.caption}>{subLabel}</Text>
            </>
          ) : (
            <Text style={type.optionLabel}>{label}</Text>
          )}
        </View>

        {/* 26px slot, always reserved, so the badge never shifts the label. */}
        <View style={styles.trailing}>
          <Animated.View style={[styles.badge, badgeStyle]}>
            <Check size={icon.check.size} strokeWidth={icon.check.strokeWidth} color={color.cream} />
          </Animated.View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl,
    borderWidth: borderWidth.card,
    // `shadow.card` carries shadowOpacity 1. Selection drives it up from 0, and
    // this keeps an unselected card flat on renderers that read the static
    // style before the animated one — react-native-web is one.
    shadowOpacity: 0,
  },
  cardShort: {
    minHeight: size.optionMinHeight,
    paddingVertical: size.optionPaddingVertical,
    paddingHorizontal: size.optionPaddingHorizontal,
    gap: size.optionGap,
  },
  cardTall: {
    minHeight: size.optionMinHeightWithSubLabel,
    paddingVertical: size.optionPaddingVerticalWithSubLabel,
    paddingHorizontal: size.optionPaddingHorizontalWithSubLabel,
    gap: size.optionGapWithSubLabel,
  },
  iconCircle: {
    borderRadius: radius.pill,
    backgroundColor: color.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleShort: {
    width: size.optionIcon,
    height: size.optionIcon,
  },
  iconCircleTall: {
    width: size.optionIconLarge,
    height: size.optionIconLarge,
  },
  copy: {
    flex: 1,
    gap: space.xxs,
  },
  trailing: {
    width: size.badge,
    height: size.badge,
  },
  badge: {
    width: size.badge,
    height: size.badge,
    borderRadius: radius.pill,
    backgroundColor: color.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
