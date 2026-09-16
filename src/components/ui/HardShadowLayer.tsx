import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle } from 'react-native-reanimated';

import { hasNativeShadow } from '@/constants/tokens';

export interface HardShadowLayerProps {
  /** Throw distance, from `shadowOffset`. */
  offset: number;
  /** Shadow colour, from `shadowColor`. */
  color: string;
  /** Must match the element's own radius, or the offset shows square corners. */
  borderRadius: number;
  /** Animated opacity, so the layer can fade in with selection like the real one. */
  style?: AnimatedStyle<ViewStyle>;
}

/**
 * The Android half of the hard offset shadow.
 *
 * `shadowRadius: 0` with a colour and an offset is an iOS-only trick — Android's
 * `elevation` is always blurred, always black and always straight down, so it
 * cannot express this at all. DESIGN_SYSTEM.md §4 gives the fallback: draw a
 * second view of the shadow colour, offset by the same amount, behind the
 * element. That is exactly what this is.
 *
 * Renders nothing on iOS, where the real shadow does the work.
 *
 * Place it as the FIRST child of a relatively-positioned wrapper whose size the
 * element determines — it fills that wrapper and then translates, so it needs no
 * measurement and stays correct as the element's content reflows.
 */
export function HardShadowLayer({ offset, color, borderRadius, style }: HardShadowLayerProps) {
  if (hasNativeShadow) {
    return null;
  }

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        styles.passThrough,
        { backgroundColor: color, borderRadius, transform: [{ translateX: offset }, { translateY: offset }] },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  passThrough: {
    pointerEvents: 'none',
  },
});
