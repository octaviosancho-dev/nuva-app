import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Vera } from '@/components/art/Vera';
import { Button, EyebrowPill, GrainOverlay, ease } from '@/components/ui';
import { MOTION } from '@/constants/nuva';
import { color, space, type as typeStyles } from '@/constants/tokens';
import { track } from '@/lib/analytics';
import { useTheme } from '@/lib/theme';

const GLOW = 380;

/**
 * Onboarding 8 of 8 — the magic moment, from
 * `design/screens/MagicMoment.dc.html`.
 *
 * The screen that breaks the pattern: no crest, no progress, no back. Breaking
 * it is the point — for many users this is the first time anyone, human or
 * software, has named what they are experiencing, and it should not look like
 * question seven.
 *
 * The headline arrives line by line, 140ms apart, because she should read it at
 * the speed it is written. At +900ms a slow ember bloom rises behind Vera over
 * 1600ms — the only element in the app allowed to take longer than a second,
 * and it is the light the moth has been moving toward.
 *
 * Reduced motion: Vera and all three lines cross-fade together over `slow`, and
 * the bloom renders at its resting 0.08 with no animation.
 */
export default function MagicMomentScreen() {
  const reduced = useReducedMotion();
  const { c } = useTheme();

  const vera = useSharedValue(reduced ? 1 : 0);
  const veraScale = useSharedValue(reduced ? 1 : 0.94);
  const l1 = useSharedValue(0);
  const l2 = useSharedValue(0);
  const l3 = useSharedValue(0);
  const body = useSharedValue(0);
  const cta = useSharedValue(0);
  const glow = useSharedValue(reduced ? 0.08 : 0);

  useEffect(() => {
    track('magic_moment_viewed');
  }, []);

  useEffect(() => {
    const { duration } = MOTION;

    if (reduced) {
      const fade = withTiming(1, { duration: duration.slow });
      vera.value = fade;
      l1.value = fade;
      l2.value = fade;
      l3.value = fade;
      body.value = fade;
      cta.value = fade;
      return;
    }

    vera.value = withTiming(1, { duration: duration.reveal, easing: ease.standard });
    veraScale.value = withSpring(1, MOTION.spring.bloom);

    const line = (delay: number) =>
      withDelay(delay, withTiming(1, { duration: duration.base, easing: ease.enter }));
    l1.value = line(200);
    l2.value = line(340);
    l3.value = line(480);

    body.value = withDelay(760, withTiming(1, { duration: duration.slow, easing: ease.enter }));
    cta.value = withDelay(1100, withTiming(1, { duration: duration.slow, easing: ease.enter }));

    // Rises past its resting value, then settles — light arriving, not a fade-in.
    glow.value = withDelay(
      900,
      withSequence(
        withTiming(0.13, { duration: 880, easing: ease.breathe }),
        withTiming(0.08, { duration: 720, easing: ease.breathe }),
      ),
    );
  }, [reduced, vera, veraScale, l1, l2, l3, body, cta, glow]);

  const veraStyle = useAnimatedStyle(() => ({
    opacity: vera.value,
    transform: reduced ? [] : [{ scale: veraScale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));
  // Each line rises 14px as it fades. Written out rather than produced by a
  // helper, because a hook behind a function call is a rule-of-hooks trap.
  const l1Style = useAnimatedStyle(() => ({
    opacity: l1.value,
    transform: reduced ? [] : [{ translateY: 14 * (1 - l1.value) }],
  }));
  const l2Style = useAnimatedStyle(() => ({
    opacity: l2.value,
    transform: reduced ? [] : [{ translateY: 14 * (1 - l2.value) }],
  }));
  const l3Style = useAnimatedStyle(() => ({
    opacity: l3.value,
    transform: reduced ? [] : [{ translateY: 14 * (1 - l3.value) }],
  }));
  const bodyStyle = useAnimatedStyle(() => ({ opacity: body.value }));
  const ctaStyle = useAnimatedStyle(() => ({ opacity: cta.value }));

  return (
    <View style={[styles.screen, { backgroundColor: c.nightDeep }]}>
      <Animated.View style={[styles.glow, glowStyle]} pointerEvents="none">
        <Svg width={GLOW} height={GLOW}>
          <Defs>
            <RadialGradient id="mmGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor={color.light.ember} stopOpacity={0.55} />
              <Stop offset="70%" stopColor={color.light.ember} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Rect width={GLOW} height={GLOW} fill="url(#mmGlow)" />
        </Svg>
      </Animated.View>

      <View style={styles.content}>
        <Animated.View style={[styles.veraRow, veraStyle]}>
          {/* Neutral, never `celebrate`. She has just told us she is unwell;
              the app's answer is recognition, not applause. */}
          <Vera pose="neutral" size={180} />
        </Animated.View>

        <Animated.View style={[styles.eyebrowRow, l1Style]}>
          <EyebrowPill label="Based on your answers" variant="onNight" />
        </Animated.View>

        <View style={styles.headline}>
          <Animated.Text style={[typeStyles.displayXL, styles.display, { color: c.textOnNight }, l1Style]}>
            Your symptoms
          </Animated.Text>
          <Animated.Text style={[typeStyles.displayXL, styles.display, { color: c.textOnNight }, l2Style]}>
            have a name.
          </Animated.Text>
        </View>

        <Animated.Text style={[typeStyles.quote, styles.verdict, l3Style]}>
          Early perimenopause.
        </Animated.Text>

        <Animated.Text style={[typeStyles.bodyLG, styles.lead, { color: c.textOnNightMuted }, bodyStyle]}>
          Irregular cycles, anxiety spikes and brain fog, starting under a year ago. That pattern
          has a name, a mechanism, and from today it is trackable.
        </Animated.Text>

        <View style={styles.spacer} />

        <Animated.View style={[styles.cta, ctaStyle]}>
          <Button
            label="See what happens next"
            icon={ArrowRight}
            onPress={() => router.push('/paywall')}
          />
        </Animated.View>
      </View>

      <GrainOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    top: 120,
    left: '50%',
    marginLeft: -GLOW / 2,
  },
  content: {
    flex: 1,
    paddingTop: 74,
    paddingHorizontal: space.space6,
    paddingBottom: space.space6,
    alignItems: 'flex-start',
  },
  veraRow: {
    alignSelf: 'center',
  },
  eyebrowRow: {
    marginTop: 14,
  },
  headline: {
    marginTop: space.space4,
  },
  display: {},
  verdict: {
    marginTop: 14,
    color: color.light.ember,
  },
  lead: {
    marginTop: 18,
  },
  spacer: {
    flex: 1,
  },
  cta: {
    width: '100%',
  },
});
