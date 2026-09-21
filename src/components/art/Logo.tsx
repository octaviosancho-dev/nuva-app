import { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, G, Path } from 'react-native-svg';

import { MOTION } from '@/constants/nuva';
import { color } from '@/constants/tokens';
import {
  MARK_ANTENNA_LEFT,
  MARK_ANTENNA_RIGHT,
  MARK_BODY,
  MARK_EYESPOTS,
  MARK_VIEWBOX,
  MARK_WING_LEFT,
  MARK_WING_RIGHT,
  WORDMARK_PATH,
  WORDMARK_TRANSLATE,
  WORDMARK_VIEWBOX,
} from './paths';

const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/** The mark is drawn at 64×50 in its own viewBox; every size scales from that. */
const MARK_RATIO = 50 / 64;
const WORDMARK_RATIO = 72 / 247;

/**
 * The mark's ink. Five values and no more — `design/assets/Logo/README.md`.
 * On a night ground the body switches to cream and the antennae to ember, which
 * is the whole of the difference between the two files.
 */
function markInk(onNight: boolean) {
  return {
    wing: color.light.luna,
    body: onNight ? color.light.textOnNight : color.light.night,
    eyespot: color.light.ember,
    antenna: onNight ? color.light.ember : color.light.clay,
  };
}

export interface NuvaMarkProps {
  /** Width in dp. The height follows the mark's own ratio. Minimum 24. */
  size?: number;
  /** Picks the cream-bodied variant for `night` and `night-deep` grounds. */
  onNight?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * The mark alone. In-app headers, the splash, and 16px on the progress trail.
 *
 * Below 24px the wings lose their separation — use the mark, never the lockup,
 * and never go under 24 outside `ProgressTrail`, which draws its own 16px moth
 * from the wing paths directly.
 */
export function NuvaMark({ size = 32, onNight = false, style }: NuvaMarkProps) {
  const ink = markInk(onNight);

  return (
    <Svg
      width={size}
      height={size * MARK_RATIO}
      viewBox={MARK_VIEWBOX}
      fill="none"
      style={style}
      accessibilityRole="image"
      accessibilityLabel="Nuva"
    >
      <Path d={MARK_ANTENNA_RIGHT} stroke={ink.antenna} strokeWidth={2.3} strokeLinecap="round" />
      <Path d={MARK_ANTENNA_LEFT} stroke={ink.antenna} strokeWidth={2.3} strokeLinecap="round" />
      <Path d={MARK_WING_RIGHT} fill={ink.wing} />
      <Path d={MARK_WING_LEFT} fill={ink.wing} />
      {MARK_EYESPOTS.map((spot) => (
        <Circle key={spot.cx} cx={spot.cx} cy={spot.cy} r={spot.r} fill={ink.eyespot} />
      ))}
      <Path d={MARK_BODY} fill={ink.body} />
    </Svg>
  );
}

export interface NuvaWordmarkProps {
  /** Width in dp. */
  size?: number;
  onNight?: boolean;
  style?: StyleProp<ViewStyle>;
}

/** Fraunces 600 as outlines. Never re-set it in live type. */
export function NuvaWordmark({ size = 80, onNight = false, style }: NuvaWordmarkProps) {
  return (
    <Svg
      width={size}
      height={size * WORDMARK_RATIO}
      viewBox={WORDMARK_VIEWBOX}
      fill="none"
      style={style}
      accessibilityRole="image"
      accessibilityLabel="Nuva"
    >
      <G transform={WORDMARK_TRANSLATE}>
        <Path
          d={WORDMARK_PATH}
          fill={onNight ? color.light.textOnNight : color.light.textPrimary}
        />
      </G>
    </Svg>
  );
}

export interface NuvaLockupProps {
  /** Total width in dp. 120 minimum — below that the wordmark fills in. */
  width?: number;
  onNight?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Mark and wordmark side by side. The proportions come from the welcome
 * artboard: a 26dp mark, a 62dp wordmark and a 9dp gap at a 97dp total.
 */
export function NuvaLockup({ width = 120, onNight = false, style }: NuvaLockupProps) {
  const unit = width / 97;
  return (
    <View
      style={[{ flexDirection: 'row', alignItems: 'center', gap: 9 * unit }, style]}
      accessibilityRole="image"
      accessibilityLabel="Nuva"
    >
      <NuvaMark size={26 * unit} onNight={onNight} />
      <NuvaWordmark size={62 * unit} onNight={onNight} />
    </View>
  );
}

export interface SplashLockupProps {
  /** Mark width in dp. The artboard draws it at 112. */
  markWidth?: number;
  /** Wordmark width in dp. The artboard draws it at 116. */
  wordmarkWidth?: number;
  onNight?: boolean;
  /** Fires once the wings, antennae, eyespots and wordmark have all landed. */
  onFinished?: () => void;
}

/**
 * The splash animation — the one piece of motion most people will see most
 * often, so it is short and never repeats within a session.
 *
 * Wings open from `scaleX: 0.15` about the body's centre line on the `bloom`
 * spring, antennae draw in at 180ms, the eyespots fade at 320ms with a 60ms
 * stagger, and the wordmark rises at 420ms. Total 800ms, then the caller holds
 * 400ms before handing off. Values from `design/motion.md`.
 *
 * Reduced motion: the assembled lockup cross-fades over `base`. No scaling, no
 * drawing — but the same `onFinished` still fires, because the splash is a
 * gate and skipping the animation must not skip the gate.
 */
export function SplashLockup({
  markWidth = 112,
  wordmarkWidth = 116,
  onNight = true,
  onFinished,
}: SplashLockupProps) {
  const reduced = useReducedMotion();
  const ink = markInk(onNight);

  const wings = useSharedValue(reduced ? 1 : 0.15);
  const wingOpacity = useSharedValue(reduced ? 0 : 0);
  const antennae = useSharedValue(reduced ? 0 : 60);
  const eyespotL = useSharedValue(reduced ? 0 : 0);
  const eyespotR = useSharedValue(reduced ? 0 : 0);
  const word = useSharedValue(0);
  const wordLift = useSharedValue(reduced ? 0 : 8);

  useEffect(() => {
    const { duration, easing, spring } = MOTION;

    if (reduced) {
      // Everything arrives together as a single cross-fade.
      wingOpacity.value = withTiming(1, { duration: duration.base });
      word.value = withTiming(1, { duration: duration.base });
      const t = setTimeout(() => onFinished?.(), duration.base + 400);
      return () => clearTimeout(t);
    }

    wingOpacity.value = withTiming(1, { duration: duration.quick });
    wings.value = withSpring(1, spring.bloom);
    antennae.value = withDelay(
      180,
      withTiming(0, { duration: duration.base, easing: Easing.bezier(...easing.enter) }),
    );
    eyespotR.value = withDelay(320, withTiming(1, { duration: duration.quick }));
    eyespotL.value = withDelay(380, withTiming(1, { duration: duration.quick }));
    word.value = withDelay(
      420,
      withTiming(1, { duration: duration.slow, easing: Easing.bezier(...easing.enter) }),
    );
    wordLift.value = withDelay(
      420,
      withTiming(0, { duration: duration.slow, easing: Easing.bezier(...easing.enter) }),
    );

    // 800ms of animation, then hold 400ms before handing off to the first screen.
    const t = setTimeout(() => onFinished?.(), 1200);
    return () => clearTimeout(t);
  }, [reduced, antennae, eyespotL, eyespotR, wingOpacity, wings, word, wordLift, onFinished]);

  // Each wing opens about the body's centre line at x=32 in the mark's viewBox.
  const rightWing = useAnimatedProps(() => ({
    transform: [{ translateX: 32 }, { scaleX: wings.value }, { translateX: -32 }],
    opacity: wingOpacity.value,
  }));
  const leftWing = useAnimatedProps(() => ({
    transform: [{ translateX: 32 }, { scaleX: wings.value }, { translateX: -32 }],
    opacity: wingOpacity.value,
  }));
  const antennaProps = useAnimatedProps(() => ({ strokeDashoffset: antennae.value }));
  const spotRight = useAnimatedProps(() => ({ opacity: eyespotR.value }));
  const spotLeft = useAnimatedProps(() => ({ opacity: eyespotL.value }));
  const wordStyle = useAnimatedStyle(() => ({
    opacity: word.value,
    transform: [{ translateY: wordLift.value }],
  }));

  return (
    <View style={{ alignItems: 'center', gap: 26 }}>
      <Svg
        width={markWidth}
        height={markWidth * MARK_RATIO}
        viewBox={MARK_VIEWBOX}
        fill="none"
        accessibilityRole="image"
        accessibilityLabel="Nuva"
      >
        <AnimatedPath
          d={MARK_ANTENNA_RIGHT}
          stroke={ink.antenna}
          strokeWidth={2.3}
          strokeLinecap="round"
          strokeDasharray={60}
          animatedProps={antennaProps}
        />
        <AnimatedPath
          d={MARK_ANTENNA_LEFT}
          stroke={ink.antenna}
          strokeWidth={2.3}
          strokeLinecap="round"
          strokeDasharray={60}
          animatedProps={antennaProps}
        />
        <AnimatedG animatedProps={rightWing}>
          <Path d={MARK_WING_RIGHT} fill={ink.wing} />
        </AnimatedG>
        <AnimatedG animatedProps={leftWing}>
          <Path d={MARK_WING_LEFT} fill={ink.wing} />
        </AnimatedG>
        <AnimatedCircle
          cx={MARK_EYESPOTS[0].cx}
          cy={MARK_EYESPOTS[0].cy}
          r={MARK_EYESPOTS[0].r}
          fill={ink.eyespot}
          animatedProps={spotRight}
        />
        <AnimatedCircle
          cx={MARK_EYESPOTS[1].cx}
          cy={MARK_EYESPOTS[1].cy}
          r={MARK_EYESPOTS[1].r}
          fill={ink.eyespot}
          animatedProps={spotLeft}
        />
        <Path d={MARK_BODY} fill={ink.body} />
      </Svg>

      <Animated.View style={wordStyle}>
        <NuvaWordmark size={wordmarkWidth} onNight={onNight} />
      </Animated.View>
    </View>
  );
}

/**
 * Where a spinner would go. The wings scale between 1 and 1.06 on `breathe`
 * over `ambient`, looping. Slow on purpose — a fast pulse reads as anxiety,
 * which is the wrong feeling in this app.
 *
 * Reduced motion: a static mark at 60% opacity.
 */
export function LoadingMark({ size = 40, onNight = false }: NuvaMarkProps) {
  const reduced = useReducedMotion();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (reduced) return;
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, {
          duration: MOTION.duration.ambient / 2,
          easing: Easing.bezier(...MOTION.easing.breathe),
        }),
        withTiming(1, {
          duration: MOTION.duration.ambient / 2,
          easing: Easing.bezier(...MOTION.easing.breathe),
        }),
      ),
      -1,
      false,
    );
  }, [reduced, pulse]);

  const style = useAnimatedStyle(() => ({ transform: [{ scaleX: pulse.value }] }));

  if (reduced) {
    return <NuvaMark size={size} onNight={onNight} style={{ opacity: 0.6 }} />;
  }
  return (
    <Animated.View style={style}>
      <NuvaMark size={size} onNight={onNight} />
    </Animated.View>
  );
}
