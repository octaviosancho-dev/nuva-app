import { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { MOTION, category } from '@/constants/nuva';
import { radius, space, type as typeStyles, type ColorToken } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';
import { icon } from './icons';
import { ease } from './motion';
import type { Symptom } from './SymptomChip';

/**
 * Reanimated can only drive a prop, and `Text` has no prop for its content —
 * `TextInput`'s `text` is the one writable text prop on the platform. That is
 * what keeps the counting number on the UI thread instead of re-rendering
 * React sixty times a second.
 */
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
type CountingProps = TextInputProps & { text: string };

export interface ValidationCardProps {
  symptom: Symptom;
  /** Whole number. Never round a real figure to something rounder. */
  percent: number;
  /** The sentence after the number: "of women in early perimenopause report…". */
  lede: string;
  /** The italic line naming the cause. This is what separates it from a statistic. */
  mechanism?: string;
  /** When it was logged, e.g. "logged just now". */
  loggedLabel?: string;
  variant?: 'full' | 'compact';
  style?: StyleProp<ViewStyle>;
}

/**
 * The validation stat, shown the moment a log saves. The product's emotional
 * core: she has been told her symptoms are stress, or age, or nothing, and this
 * is often the first thing that confirms what she is experiencing.
 *
 * **Nothing celebrates here.** No sparks, no confetti, no `vera-celebrate` —
 * she has just reported feeling bad, and the answer is recognition, not
 * applause. The spec card names this as the single most common way to get the
 * card wrong.
 *
 * Show the full card for the first symptom in a session and compact rows for
 * the rest. Three full cards in a row is a lecture.
 */
export function ValidationCard({
  symptom,
  percent,
  lede,
  mechanism,
  loggedLabel = 'logged just now',
  variant = 'full',
  style,
}: ValidationCardProps) {
  if (variant === 'compact') {
    return (
      <CompactRow symptom={symptom} percent={percent} lede={lede} style={style} />
    );
  }
  return (
    <FullCard
      symptom={symptom}
      percent={percent}
      lede={lede}
      mechanism={mechanism}
      loggedLabel={loggedLabel}
      style={style}
    />
  );
}

function FullCard({
  symptom,
  percent,
  lede,
  mechanism,
  loggedLabel,
  style,
}: Required<Pick<ValidationCardProps, 'symptom' | 'percent' | 'lede' | 'loggedLabel'>> &
  Pick<ValidationCardProps, 'mechanism' | 'style'>) {
  const { c, shadow } = useTheme();
  const reduced = useReducedMotion();

  const rise = useSharedValue(reduced ? 1 : 0);
  const count = useSharedValue(reduced ? percent : 0);
  const mech = useSharedValue(0);

  const cat = category(symptom.category);
  const Icon = icon(cat?.icon ?? 'circle-dashed');

  useEffect(() => {
    if (reduced) {
      // The card cross-fades and the number is simply there at its value.
      rise.value = withTiming(1, { duration: MOTION.duration.base });
      count.value = percent;
      mech.value = withTiming(1, { duration: MOTION.duration.base });
      return;
    }
    rise.value = withTiming(1, { duration: MOTION.duration.reveal, easing: ease.enter });
    count.value = withTiming(percent, {
      duration: MOTION.duration.reveal,
      easing: ease.standard,
    });
    // +280ms after the card starts, so she reads the number before the cause.
    mech.value = withDelay(280, withTiming(1, { duration: MOTION.duration.base }));
  }, [percent, reduced, rise, count, mech]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: rise.value,
    transform: reduced ? [] : [{ translateY: 20 * (1 - rise.value) }],
  }));
  const mechStyle = useAnimatedStyle(() => ({ opacity: mech.value }));

  const countingProps = useAnimatedProps<CountingProps>(() => ({
    text: `${Math.round(count.value)}%`,
  }));

  return (
    <Animated.View
      style={[styles.card, { backgroundColor: c.night }, shadow.lg, cardStyle, style]}
      accessibilityRole="summary"
      accessibilityLabel={`${percent} percent ${lede} ${mechanism ?? ''}`.trim()}
    >
      <View style={styles.head}>
        <View style={[styles.disc, { backgroundColor: c[(cat?.token ?? 'catPhysical') as ColorToken] }]}>
          <Icon size={16} strokeWidth={2} color={c[(cat?.on ?? 'onLuna') as ColorToken]} />
        </View>
        <Text style={[typeStyles.eyebrow, { color: c.textOnNightMuted }]} numberOfLines={1}>
          {`${symptom.label} · ${loggedLabel}`.toUpperCase()}
        </Text>
      </View>

      {/*
        Tabular numerals, so the card holds its width while the number counts
        rather than jittering from 8% to 71%. The number is the one ember on
        this screen.
      */}
      <AnimatedTextInput
        editable={false}
        // The value the screen reader and the first frame both see.
        defaultValue={`${reduced ? percent : 0}%`}
        animatedProps={countingProps}
        accessible={false}
        style={[typeStyles.statNumber, styles.percent, { color: c.ember }]}
      />

      <Text style={[typeStyles.bodyLG, styles.lede, { color: c.textOnNight }]}>{lede}</Text>

      {mechanism ? (
        <Animated.Text
          style={[typeStyles.quote, styles.mechanism, { color: c.textOnNightMuted }, mechStyle]}
        >
          {mechanism}
        </Animated.Text>
      ) : null}
    </Animated.View>
  );
}

function CompactRow({
  symptom,
  percent,
  lede,
  style,
}: Pick<ValidationCardProps, 'symptom' | 'percent' | 'lede' | 'style'>) {
  const { c, shadow } = useTheme();

  return (
    <View style={[styles.row, { backgroundColor: c.surface }, shadow.xs, style]}>
      {/*
        `ember-deep`, never `ember`. Ember on a light ground is 2.2:1 — the
        moment the hue carries text it has to step down.
      */}
      <Text style={[typeStyles.statNumber, styles.rowPercent, { color: c.emberDeep }]}>
        {percent}%
      </Text>
      <View style={styles.rowBody}>
        <Text style={[typeStyles.labelLG, { color: c.textPrimary }]}>{symptom.label}</Text>
        <Text style={[typeStyles.bodySM, styles.rowLede, { color: c.textSecondary }]}>
          {lede}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: space.space6,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    // 10px, as the artboard sets it.
    gap: 10,
  },
  disc: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    marginTop: space.space4,
    // TextInput carries platform padding that Text does not.
    padding: 0,
    includeFontPadding: false,
  },
  lede: {
    marginTop: space.space2,
  },
  mechanism: {
    marginTop: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderRadius: radius.lg,
    paddingVertical: space.space4,
    paddingHorizontal: 18,
  },
  rowPercent: {
    // The compact variant sets `statNumber` at 26. Derived from the token
    // rather than restated, so a change to the family still reaches it.
    fontSize: 26,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  rowBody: {
    flex: 1,
  },
  rowLede: {
    marginTop: 3,
  },
});
