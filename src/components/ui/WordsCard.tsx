import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
  type AnimatedStyle,
} from 'react-native-reanimated';
import { Copy } from 'lucide-react-native';

import { MOTION } from '@/constants/nuva';
import { radius, space, type as typeStyles } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';
import { Button } from './Button';
import { EyebrowPill } from './chrome';
import { ease, useEntrance } from './motion';

/** Roughly what reading three of these aloud takes. */
const WORDS_PER_SECOND = 2.6;

export interface WordsCardProps {
  /** Two or three. Never more — she has to remember them. */
  sentences: readonly string[];
  onCopy: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Find Your Words — the sentences she can say at her appointment.
 *
 * The problem was never that she lacks data. It is that she lacks language, and
 * that the appointment runs out before she can explain herself. What a woman
 * brings to ten minutes, nervous and historically dismissed, is not a chart —
 * it is words she can say.
 *
 * Set in `quote`, italic Fraunces, because italic reads as a voice rather than
 * a label, and because she may literally read it aloud.
 */
export function WordsCard({ sentences, onCopy, style }: WordsCardProps) {
  const { c, shadow } = useTheme();
  const reduced = useReducedMotion();

  const [copied, setCopied] = useState(false);
  const flash = useSharedValue(0);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1400);
    return () => clearTimeout(t);
  }, [copied]);

  const onPress = () => {
    onCopy();
    setCopied(true);
    if (!reduced) {
      flash.value = withSequence(
        withTiming(1, { duration: MOTION.duration.instant, easing: ease.standard }),
        withTiming(0, { duration: MOTION.duration.base, easing: ease.standard }),
      );
    }
  };

  // The block flashes toward luna-soft and settles back to ember-soft.
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  const words = sentences.join(' ').split(/\s+/).length;
  const seconds = Math.max(5, Math.round(words / WORDS_PER_SECOND / 5) * 5);

  return (
    <View style={[styles.card, { backgroundColor: c.surface }, shadow.sm, style]}>
      <View style={styles.head}>
        <EyebrowPill label="Say this" variant="onLight" />
        <View style={styles.spacer} />
        {copied ? (
          <View style={[styles.copied, { backgroundColor: c.lunaSoft }]}>
            <Text style={[typeStyles.eyebrow, { color: c.onLunaSoft }]}>COPIED</Text>
          </View>
        ) : null}
      </View>

      {sentences.map((sentence, i) => (
        <Sentence key={sentence} sentence={sentence} index={i} flashStyle={flashStyle} />
      ))}

      <View style={styles.actions}>
        {/*
          One tap for all of them. She is not going to copy three sentences one
          at a time in a waiting room.
        */}
        <Button
          label={sentences.length === 3 ? 'Copy all three' : 'Copy both'}
          icon={Copy}
          variant="primary"
          compact
          onPress={onPress}
        />
        <Text style={[typeStyles.caption, styles.timing, { color: c.textTertiary }]}>
          Reads aloud in about {seconds} seconds
        </Text>
      </View>
    </View>
  );
}

function Sentence({
  sentence,
  index,
  flashStyle,
}: {
  sentence: string;
  index: number;
  flashStyle: AnimatedStyle<ViewStyle>;
}) {
  const { c } = useTheme();
  const entrance = useEntrance(index);

  return (
    <Animated.View style={[styles.block, { backgroundColor: c.emberSoft }, entrance]}>
      {/* The flash rides above the resting fill rather than replacing it, so
          the colour cannot be left stuck on a failed animation. */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.flash, { backgroundColor: c.lunaSoft }, flashStyle]}
        pointerEvents="none"
      />
      <Text style={[typeStyles.quote, { color: c.textPrimary }]}>{sentence}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    padding: space.space5,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  spacer: {
    flex: 1,
  },
  copied: {
    height: 26,
    paddingHorizontal: space.space3,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  block: {
    borderRadius: radius.lg,
    paddingVertical: space.space4,
    paddingHorizontal: 18,
    marginBottom: space.space3,
    overflow: 'hidden',
  },
  flash: {
    borderRadius: radius.lg,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space3,
    marginTop: 18,
  },
  timing: {
    flex: 1,
  },
});
