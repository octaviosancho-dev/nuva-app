import { useEffect } from 'react';
import {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated';
import type { ViewStyle } from 'react-native';

import { MOTION } from '@/constants/nuva';

/** `Easing.bezier` wants four arguments; `MOTION.easing.*` stores them as a tuple. */
export const ease = {
  standard: Easing.bezier(...MOTION.easing.standard),
  enter: Easing.bezier(...MOTION.easing.enter),
  exit: Easing.bezier(...MOTION.easing.exit),
  breathe: Easing.bezier(...MOTION.easing.breathe),
};

/**
 * Press feedback. `scale` 1 → `to` on the `press` spring, back on release.
 *
 * Reduced motion drops the transform entirely and returns an empty style —
 * `opacity-pressed` is handled by the component's own pressed colour where it
 * has one, so there is nothing left to animate.
 */
export function usePressScale(to = 0.98) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);

  const onPressIn = () => {
    if (!reduced) scale.value = withSpring(to, MOTION.spring.press);
  };
  const onPressOut = () => {
    if (!reduced) scale.value = withSpring(1, MOTION.spring.press);
  };

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return { onPressIn, onPressOut, style: reduced ? undefined : style };
}

/**
 * The list entrance from `design/motion.md`: `opacity` 0 → 1 and `translateY`
 * 12 → 0 over `base` on `enter`, staggered 44ms between siblings.
 *
 * **Cap the stagger at 8 items.** Past that a long list takes a visibly silly
 * amount of time to appear, so callers pass an `order` they have already
 * clamped, or let this clamp it for them.
 *
 * Reduced motion keeps the fade and drops the lift — the information still
 * arrives, it just does not travel.
 */
export function useEntrance(order = 0, enabled = true): AnimatedStyle<ViewStyle> {
  const reduced = useReducedMotion();
  const progress = useSharedValue(enabled ? 0 : 1);

  useEffect(() => {
    if (!enabled) {
      progress.value = 1;
      return;
    }
    progress.value = withDelay(
      Math.min(order, 8) * MOTION.stagger,
      withTiming(1, { duration: MOTION.duration.base, easing: ease.enter }),
    );
  }, [enabled, order, progress]);

  return useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: reduced ? [] : [{ translateY: 12 * (1 - progress.value) }],
  }));
}
