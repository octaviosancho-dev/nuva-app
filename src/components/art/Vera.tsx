import { useEffect } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';

import { MOTION, type VeraPose } from '@/constants/nuva';
import { color } from '@/constants/tokens';

/** Her own coordinate space, from `assets/vera/*.svg`. */
const VIEWBOX = { w: 220, h: 200 };
const RATIO = VIEWBOX.h / VIEWBOX.w;

/**
 * Vera's ink is fixed in both themes. She does not recolour per screen, per
 * category or per theme — on a dark ground the wings carry the contrast.
 */
const INK = {
  wing: color.light.luna,
  wingVein: color.light.lunaDeep,
  body: color.light.night,
  eye: color.light.nightDeep,
  glint: color.light.textOnNight,
  cheek: color.light.blush,
  antenna: color.light.clay,
  antennaTip: color.light.ember,
  eyespot: color.light.ember,
  eyespotCentre: color.light.textOnNight,
  bodySheen: color.light.lunaSoft,
  spark: color.light.ember,
  mote: color.light.lunaSoft,
} as const;

/** The wing and antenna curves, mirrored about her centre line at x=110. */
const ANTENNA_RIGHT = 'M120 52 C138 30 156 16 174 8';
const ANTENNA_LEFT = 'M 100 52 C 82 30 64 16 46 8';
const WING_RIGHT =
  'M 110 63.88 C 135.93 33.95 178.62 23.98 194.79 41.36 C 208.82 56.18 191.74 84.11 174.66 100.64 C 163.68 110.9 153.92 123.44 145.99 137.69 C 137.45 153.08 114.88 153.65 113.66 132.56 C 112.44 110.33 108.17 83.54 110 63.88 Z';
const WING_LEFT =
  'M 110 63.88 C 84.07 33.95 41.38 23.98 25.21 41.36 C 11.18 56.18 28.26 84.11 45.34 100.64 C 56.32 110.9 66.08 123.44 74.01 137.69 C 82.55 153.08 105.12 153.65 106.34 132.56 C 107.56 110.33 111.83 83.54 110 63.88 Z';
const VEIN_RIGHT = 'M124 76 C144 56 172 46 190 48';
const VEIN_LEFT = 'M 96 76 C 76 56 48 46 30 48';

/**
 * Each pose is the same drawing at different angles. `lift` is degrees of
 * outward rotation — positive lifts, negative droops — applied mirrored to the
 * two sides. `eyes` picks open ellipses, a closed arc curving up (pleased) or
 * a closed arc curving down (asleep).
 *
 * The pose carries meaning, so pose swaps still fire under reduced motion; only
 * the loops and transforms stop.
 */
interface PoseSpec {
  antennaLift: number;
  wingLift: number;
  eyes: 'open' | 'closedUp' | 'closedDown';
  /** Vertical centre of open eyes, and their radii. */
  eyeY: number;
  eyeRx: number;
  eyeRy: number;
  extras: 'none' | 'sparks' | 'motes';
}

const POSES: Record<VeraPose, PoseSpec> = {
  neutral: { antennaLift: 0, wingLift: 0, eyes: 'open', eyeY: 74, eyeRx: 6.708, eyeRy: 8.6, extras: 'none' },
  attentive: { antennaLift: 8, wingLift: 7, eyes: 'open', eyeY: 73, eyeRx: 7.488, eyeRy: 9.6, extras: 'none' },
  celebrate: { antennaLift: 12, wingLift: 15, eyes: 'closedUp', eyeY: 76, eyeRx: 0, eyeRy: 0, extras: 'sparks' },
  resting: { antennaLift: -10, wingLift: -9, eyes: 'closedDown', eyeY: 72, eyeRx: 0, eyeRy: 0, extras: 'motes' },
  reading: { antennaLift: 3, wingLift: 2, eyes: 'open', eyeY: 78, eyeRx: 6.708, eyeRy: 8.6, extras: 'none' },
};

/** Ember sparks radiating outward on `celebrate`. */
const SPARKS = [
  { cx: 28, cy: 36, r: 3.6 },
  { cx: 196, cy: 30, r: 4.2 },
  { cx: 40, cy: 150, r: 3 },
  { cx: 186, cy: 146, r: 3.4 },
] as const;

/** Pale motes drifting upward on `resting`. */
const MOTES = [
  { cx: 150, cy: 30, r: 3 },
  { cx: 163, cy: 20, r: 4.4 },
  { cx: 178, cy: 33, r: 2.4 },
] as const;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface VeraProps {
  pose?: VeraPose;
  /**
   * Width in dp. 96–220 for the full poses; below 96 her face collapses and
   * `VeraAvatar` is the right form. Above 220 she becomes the subject of the
   * screen, which is only correct on welcome and the magic moment.
   */
  size?: number;
  /**
   * Runs the ambient breathe. Leave it off wherever the person is reading —
   * nothing of hers loops under body text.
   */
  breathe?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Vera, the luna moth from the logo given a face. The app's one recurring
 * character and its only illustration.
 *
 * She reacts to what the person *does*, never to what she *reports*: no sad
 * face at a hard log, no celebration on a mild day. `celebrate` never appears
 * where a severity value is the subject.
 */
export function Vera({ pose = 'neutral', size = 160, breathe = false, style }: VeraProps) {
  const reduced = useReducedMotion();
  const spec = POSES[pose];

  const bob = useSharedValue(0);
  const spark = useSharedValue(0);
  const mote = useSharedValue(0);

  useEffect(() => {
    if (reduced || !breathe) {
      bob.value = 0;
      return;
    }
    const half = MOTION.duration.ambient / 2;
    const ease = Easing.bezier(...MOTION.easing.breathe);
    bob.value = withRepeat(
      withSequence(withTiming(1, { duration: half, easing: ease }), withTiming(0, { duration: half, easing: ease })),
      -1,
      false,
    );
  }, [reduced, breathe, bob]);

  useEffect(() => {
    if (reduced) {
      spark.value = 1;
      mote.value = 1;
      return;
    }
    if (spec.extras === 'sparks') {
      // Scale 0 → 1 → 0 over `slow`, then settle visible so the pose reads.
      spark.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: MOTION.duration.slow, easing: Easing.bezier(...MOTION.easing.enter) }),
      );
    }
    if (spec.extras === 'motes') {
      mote.value = withRepeat(
        withTiming(1, { duration: MOTION.duration.ambient, easing: Easing.bezier(...MOTION.easing.breathe) }),
        -1,
        false,
      );
    }
  }, [reduced, spec.extras, spark, mote]);

  // Body `scaleY` 1 → 1.015 and `translateY` 0 → −1.5, anchored at her base.
  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -1.5 * bob.value }, { scaleY: 1 + 0.015 * bob.value }],
  }));

  const sparkProps = useAnimatedStyle(() => ({ opacity: spark.value }));
  const moteProps = useAnimatedStyle(() => ({ opacity: 0.85 * (1 - mote.value) }));

  const height = size * RATIO;

  return (
    <Animated.View
      style={[{ width: size, height }, breathe && !reduced ? breatheStyle : null, style]}
      accessibilityRole="image"
      accessibilityLabel="Vera, the Nuva moth"
    >
      <Svg width={size} height={height} viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`} fill="none">
        {/* Antennae. Rotated about her head, mirrored. */}
        <G transform={`rotate(${-spec.antennaLift} 110 56)`}>
          <Path d={ANTENNA_RIGHT} stroke={INK.antenna} strokeWidth={4.2} strokeLinecap="round" />
          <Circle cx={174} cy={8} r={4.4} fill={INK.antennaTip} />
        </G>
        <G transform={`rotate(${spec.antennaLift} 110 56)`}>
          <Path d={ANTENNA_LEFT} stroke={INK.antenna} strokeWidth={4.2} strokeLinecap="round" />
          <Circle cx={46} cy={8} r={4.4} fill={INK.antennaTip} />
        </G>

        {/* Wings. Same curve as the mark, at her scale. */}
        <G transform={`rotate(${-spec.wingLift} 110 96)`}>
          <Path d={WING_RIGHT} fill={INK.wing} />
          <Path d={VEIN_RIGHT} stroke={INK.wingVein} strokeWidth={2.6} strokeLinecap="round" opacity={0.45} />
          <Circle cx={163} cy={62} r={10} fill={INK.eyespot} />
          <Circle cx={163} cy={62} r={3.8} fill={INK.eyespotCentre} />
        </G>
        <G transform={`rotate(${spec.wingLift} 110 96)`}>
          <Path d={WING_LEFT} fill={INK.wing} />
          <Path d={VEIN_LEFT} stroke={INK.wingVein} strokeWidth={2.6} strokeLinecap="round" opacity={0.45} />
          <Circle cx={57} cy={62} r={10} fill={INK.eyespot} />
          <Circle cx={57} cy={62} r={3.8} fill={INK.eyespotCentre} />
        </G>

        {/* Body and head. */}
        <Ellipse cx={110} cy={128} rx={23} ry={30} fill={INK.body} />
        <Circle cx={110} cy={76} r={33} fill={INK.body} />
        <Ellipse cx={110} cy={132} rx={13} ry={19} fill={INK.bodySheen} opacity={0.15} />

        {/* Eyes. */}
        {spec.eyes === 'open' ? (
          <>
            <Ellipse cx={98} cy={spec.eyeY} rx={spec.eyeRx} ry={spec.eyeRy} fill={INK.eye} />
            <Ellipse cx={122} cy={spec.eyeY} rx={spec.eyeRx} ry={spec.eyeRy} fill={INK.eye} />
            <Circle cx={95.4} cy={spec.eyeY - 3.4} r={2.7} fill={INK.glint} />
            <Circle cx={119.4} cy={spec.eyeY - 3.4} r={2.7} fill={INK.glint} />
          </>
        ) : spec.eyes === 'closedUp' ? (
          <>
            <Path d="M91 76 Q98 66 105 76" stroke={INK.eye} strokeWidth={4.6} strokeLinecap="round" />
            <Path d="M115 76 Q122 66 129 76" stroke={INK.eye} strokeWidth={4.6} strokeLinecap="round" />
          </>
        ) : (
          <>
            <Path d="M91 72 Q98 81 105 72" stroke={INK.eye} strokeWidth={4.6} strokeLinecap="round" />
            <Path d="M115 72 Q122 81 129 72" stroke={INK.eye} strokeWidth={4.6} strokeLinecap="round" />
          </>
        )}

        {/* Cheeks. */}
        <Ellipse cx={86} cy={91} rx={8.5} ry={5} fill={INK.cheek} opacity={0.5} />
        <Ellipse cx={134} cy={91} rx={8.5} ry={5} fill={INK.cheek} opacity={0.5} />
      </Svg>

      {/* Sparks and motes ride above the drawing so they can fade on their own. */}
      {spec.extras === 'sparks' ? (
        <Animated.View style={[{ position: 'absolute', inset: 0 }, sparkProps]} pointerEvents="none">
          <Svg width={size} height={height} viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`} fill="none">
            {SPARKS.map((s) => (
              <Circle key={`${s.cx}-${s.cy}`} cx={s.cx} cy={s.cy} r={s.r} fill={INK.spark} />
            ))}
          </Svg>
        </Animated.View>
      ) : null}

      {spec.extras === 'motes' ? (
        <Animated.View style={[{ position: 'absolute', inset: 0 }, moteProps]} pointerEvents="none">
          <Svg width={size} height={height} viewBox={`0 0 ${VIEWBOX.w} ${VIEWBOX.h}`} fill="none">
            {MOTES.map((m) => (
              <Circle key={`${m.cx}-${m.cy}`} cx={m.cx} cy={m.cy} r={m.r} fill={INK.mote} />
            ))}
          </Svg>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

export interface VeraAvatarProps {
  /** 120 in the source file. The only form allowed below 96. */
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** Her head on a `luna-soft` disc. Profile rows, notification icons, under 64px. */
export function VeraAvatar({ size = 48, style }: VeraAvatarProps) {
  return (
    <View style={style} accessibilityRole="image" accessibilityLabel="Vera">
      <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <Circle cx={60} cy={60} r={60} fill={INK.mote} />
        <Circle cx={60} cy={62} r={33} fill={INK.body} />
        <Ellipse cx={48} cy={60} rx={6.708} ry={8.6} fill={INK.eye} />
        <Ellipse cx={72} cy={60} rx={6.708} ry={8.6} fill={INK.eye} />
        <Circle cx={45.4} cy={56.6} r={2.7} fill={INK.glint} />
        <Circle cx={69.4} cy={56.6} r={2.7} fill={INK.glint} />
        <Ellipse cx={36} cy={77} rx={8.5} ry={5} fill={INK.cheek} opacity={0.5} />
        <Ellipse cx={84} cy={77} rx={8.5} ry={5} fill={INK.cheek} opacity={0.5} />
      </Svg>
    </View>
  );
}
