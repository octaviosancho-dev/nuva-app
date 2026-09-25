import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { MOTION } from '@/constants/nuva';
import { opacity, radius } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';
import { ease } from './motion';

/** The artboard's switch: 52×32, a 23px knob, 3px inset. */
const WIDTH = 52;
const HEIGHT = 32;
const KNOB = 23;
const INSET = 3;
/** Inside the 1.5px border: 49 − 23 − 3 − 3 = 20, left 3px → 23px as drawn. */
const TRAVEL = WIDTH - 3 - KNOB - INSET * 2;

export interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** What it switches — a switch with no name is unusable with VoiceOver. */
  accessibilityLabel: string;
  disabled?: boolean;
}

/**
 * On/off, from the Reminders and Settings artboards. On is a `luna` fill — a
 * fill, never text — and off is sunken with a strong line, so the state reads
 * from shape and contrast as well as hue.
 *
 * The knob slides over `quick`; with reduced motion it jumps, and the fill
 * still changes, because the state is the information.
 */
export function Toggle({ value, onValueChange, accessibilityLabel, disabled = false }: ToggleProps) {
  const { c, shadow } = useTheme();
  const reduced = useReducedMotion();
  const progress = useSharedValue(value ? 1 : 0);

  useEffect(() => {
    progress.value = reduced
      ? value
        ? 1
        : 0
      : withTiming(value ? 1 : 0, { duration: MOTION.duration.quick, easing: ease.standard });
  }, [value, reduced, progress]);

  const knob = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(progress.value, [0, 1], [0, TRAVEL]) }],
  }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value, disabled }}
      // react-native-web only maps `checked` to aria-checked for checkboxes.
      aria-checked={value}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      // 32px tall on the artboard; the slop takes the target past 44px.
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
      style={[
        styles.track,
        value
          ? { backgroundColor: c.luna, borderColor: 'transparent' }
          : { backgroundColor: c.surfaceSunken, borderColor: c.lineStrong },
        disabled ? { opacity: opacity.disabled } : null,
      ]}
    >
      <Animated.View style={[styles.knob, { backgroundColor: c.surfaceRaised }, shadow.xs, knob]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: WIDTH,
    height: HEIGHT,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  knob: {
    position: 'absolute',
    // Absolute children sit inside the border in Yoga, as in CSS's padding box.
    top: INSET,
    left: INSET,
    width: KNOB,
    height: KNOB,
    borderRadius: radius.pill,
  },
});
