import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { MOTION, SEVERITY } from '@/constants/nuva';
import { radius, space, type as typeStyles, type ColorToken } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';
import { ease } from './motion';

/** Four dots per step, so the count reads without the colour. */
const DOTS = 4;

export interface SeverityScaleProps {
  /** 1–4, or null before she has chosen. */
  value: number | null;
  onChange: (value: number) => void;
  /**
   * The symptom's label, for the accessibility announcement:
   * "Hot flashes severity, Strong, 3 of 4".
   */
  symptom?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The 1–4 severity control, one per logged symptom.
 *
 * **Three signals, always.** The colour, the filled-dot count and the word each
 * carry the value on their own. Around 1 in 12 women has some colour vision
 * deficiency, and this control is used daily under fatigue, often at night — so
 * the ramp is reinforcement, not the mechanism. That is also what lets the ramp
 * be chosen for how the levels *feel* rather than for contrast, and why **no
 * text ever sits on a swatch**.
 *
 * Callers default a newly selected symptom to 2. The 60-second target does not
 * survive a control that needs two taps per symptom.
 */
export function SeverityScale({ value, onChange, symptom, style }: SeverityScaleProps) {
  return (
    <View style={[styles.row, style]}>
      {SEVERITY.map((step) => (
        <Step
          key={step.value}
          step={step}
          selected={value === step.value}
          // Once she has chosen, the others step back rather than compete.
          dimmed={value !== null && value !== step.value}
          symptom={symptom}
          onPress={() => onChange(step.value)}
        />
      ))}
    </View>
  );
}

interface StepProps {
  step: (typeof SEVERITY)[number];
  selected: boolean;
  dimmed: boolean;
  symptom?: string;
  onPress: () => void;
}

function Step({ step, selected, dimmed, symptom, onPress }: StepProps) {
  const { c } = useTheme();
  const reduced = useReducedMotion();

  const bloom = useSharedValue(1);
  const dim = useSharedValue(dimmed ? 0.72 : 1);

  useEffect(() => {
    if (reduced) {
      dim.value = dimmed ? 0.72 : 1;
      return;
    }
    dim.value = withTiming(dimmed ? 0.72 : 1, {
      duration: MOTION.duration.quick,
      easing: ease.standard,
    });
  }, [dimmed, reduced, dim]);

  useEffect(() => {
    // The swatch blooms on the way in only. Deselecting is quiet.
    if (!selected || reduced) return;
    bloom.value = withSequence(
      withSpring(1.08, MOTION.spring.bloom),
      withSpring(1, MOTION.spring.bloom),
    );
  }, [selected, reduced, bloom]);

  const stepStyle = useAnimatedStyle(() => ({ opacity: dim.value }));
  const swatchStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: bloom.value }] }));

  const label = symptom
    ? `${symptom} severity, ${step.label}, ${step.value} of ${SEVERITY.length}`
    : `Severity ${step.label}, ${step.value} of ${SEVERITY.length}`;

  return (
    <Animated.View style={[styles.stepOuter, reduced ? { opacity: dimmed ? 0.72 : 1 } : stepStyle]}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityLabel={label}
        onPress={onPress}
        style={[
          styles.step,
          selected
            ? { backgroundColor: c.surface, borderColor: c.textPrimary }
            : { backgroundColor: c.surfaceSunken, borderColor: 'transparent' },
        ]}
      >
        {/* No text ever goes on this. */}
        <Animated.View
          style={[
            styles.swatch,
            { backgroundColor: c[step.token as ColorToken] },
            reduced ? null : swatchStyle,
          ]}
        />

        <View style={styles.dots}>
          {Array.from({ length: DOTS }, (_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: i < step.value ? c.textPrimary : c.lineStrong },
              ]}
            />
          ))}
        </View>

        <Text
          style={[
            selected ? styles.labelSelected : styles.label,
            { color: selected ? c.textPrimary : c.textSecondary },
          ]}
        >
          {step.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.space2,
  },
  stepOuter: {
    flex: 1,
  },
  step: {
    flex: 1,
    alignItems: 'center',
    gap: space.space2,
    paddingVertical: space.space3,
    paddingHorizontal: space.space1,
    borderWidth: 1.5,
    borderRadius: radius.md,
  },
  swatch: {
    width: '100%',
    height: 26,
    borderRadius: radius.xs,
  },
  dots: {
    flexDirection: 'row',
    // 3px, off the 4px grid. The artboard sets it and the design system is
    // explicit that its numbers are copied, never snapped back to the grid.
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radius.pill,
  },
  /**
   * Two whole styles rather than one plus a conditional patch.
   *
   * The `caption` token is 12/17; the spec card and the artboard both set 12/16
   * here, and on one line only the tighter leading shows.
   *
   * The selected label steps up to DM Sans 500, and `fontWeight` cannot do it —
   * the families load as static cuts, so the weight *is* the family and asking a
   * 400 file for 500 silently returns 400. Injecting `fontFamily` conditionally
   * into the style array made react-native-web drop the family entirely on any
   * step that changed state, falling back to the system sans. Two stable,
   * pre-registered styles avoid that, and the family still comes from the
   * `label` token rather than a literal.
   */
  label: {
    ...typeStyles.caption,
    lineHeight: 16,
  },
  labelSelected: {
    ...typeStyles.caption,
    lineHeight: 16,
    fontFamily: typeStyles.label.fontFamily,
  },
});
