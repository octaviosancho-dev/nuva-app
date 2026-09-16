import { useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated';

import { motion } from '@/constants/tokens';

/**
 * The one entrance in DESIGN_SYSTEM.md §8: translateY 14 → 0 with opacity, over
 * 360ms, staggered 90ms apart. Never more than three elements — if two things
 * animate in at once and neither is the point, one of them should be deleted.
 *
 * Under reduced motion the transform drops and only the fade remains, at the
 * same duration. §8 calls that a product requirement rather than an
 * accessibility checkbox: the women arriving here are often managing anxiety.
 *
 * @param order 0-based position in the stagger.
 */
export function useEntrance(order: number): AnimatedStyle<ViewStyle> {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      order * motion.stagger,
      withTiming(1, { duration: motion.duration.enter }),
    );
  }, [order, progress]);

  return useAnimatedStyle(() => {
    if (reducedMotion) {
      return { opacity: progress.value };
    }
    return {
      opacity: progress.value,
      transform: [{ translateY: (1 - progress.value) * motion.enterOffsetY }],
    };
  });
}
