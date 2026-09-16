import { ArrowRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  color,
  icon,
  layout,
  opacity,
  radius,
  shadow,
  shadowColor,
  shadowOffset,
  size,
} from '@/constants/tokens';
import { type } from '@/constants/typography';
import { HardShadowLayer } from './HardShadowLayer';
import { usePressFeedback } from './usePressFeedback';

export interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** `hero` is the welcome screen's 64px button — the only CTA on its screen. */
  size?: 'default' | 'hero';
  style?: StyleProp<ViewStyle>;
}

/**
 * The asymmetric padding and the mustard icon well are the button's identity:
 * never centre the label, never drop the well (DESIGN_SYSTEM.md §5).
 *
 * The offset shadow is brick rather than ink so the button reads as brand
 * rather than as a selected card.
 */
export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  size: variant = 'default',
  style,
}: PrimaryButtonProps) {
  const feedback = usePressFeedback();

  const height = variant === 'hero' ? size.ctaHeightHero : size.ctaHeight;
  // The well is vertically centred with an equal inset on three sides; the label
  // keeps the full gutter on the left.
  const inset = (height - size.ctaIcon) / 2;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={feedback.onPressIn}
      onPressOut={feedback.onPressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={[styles.wrap, disabled && { opacity: opacity.disabled }, style]}
    >
      {/* Disabled carries no shadow at all, so the layer is simply omitted. */}
      {!disabled && (
        <HardShadowLayer
          offset={shadowOffset.cta}
          color={shadowColor.cta}
          borderRadius={radius.lg}
        />
      )}
      <Animated.View
        style={[
          styles.button,
          { height, paddingVertical: inset, paddingRight: inset },
          disabled ? shadow.none : shadow.cta,
          feedback.style,
        ]}
      >
        <Text style={variant === 'hero' ? type.buttonLG : type.button} numberOfLines={1}>
          {label}
        </Text>
        <View style={styles.well}>
          <ArrowRight
            size={icon.control.size}
            strokeWidth={icon.control.strokeWidth}
            color={color.ink}
          />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  /** Anchors the fallback shadow layer; the button decides the size. */
  wrap: {
    position: 'relative',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.lg,
    backgroundColor: color.ink,
    paddingLeft: layout.gutter,
  },
  well: {
    width: size.ctaIcon,
    height: size.ctaIcon,
    borderRadius: radius.sm,
    backgroundColor: color.mustard,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
