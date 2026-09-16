import { useCallback } from 'react';
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  type AnimatedStyle,
} from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';

import { motion } from '@/constants/tokens';

const { scale: pressedScale, ...springConfig } = motion.press;

/** How far the element dims instead of scaling when reduced motion is on. */
const REDUCED_DIP = 0.08;

/**
 * Press feedback for anything a finger touches.
 *
 * Reduced motion is a product requirement here, not a checkbox — users arriving
 * at Nuva are often managing anxiety symptoms (DESIGN_SYSTEM.md §8). When it is
 * on, the scale collapses to an opacity dip of the same spring.
 */
export function usePressFeedback(): {
  style: AnimatedStyle<ViewStyle>;
  onPressIn: () => void;
  onPressOut: () => void;
} {
  const reducedMotion = useReducedMotion();
  const pressed = useSharedValue(0);

  const style = useAnimatedStyle(() => {
    if (reducedMotion) {
      return { opacity: 1 - pressed.value * REDUCED_DIP };
    }
    return { transform: [{ scale: 1 - pressed.value * (1 - pressedScale) }] };
  });

  const onPressIn = useCallback(() => {
    pressed.value = withSpring(1, springConfig);
  }, [pressed]);

  const onPressOut = useCallback(() => {
    pressed.value = withSpring(0, springConfig);
  }, [pressed]);

  return { style, onPressIn, onPressOut };
}
