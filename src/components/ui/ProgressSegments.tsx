import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { color, line, motion, radius, size } from '@/constants/tokens';

export type ProgressTone = 'onDark' | 'onLight';

export interface ProgressSegmentsProps {
  /** 1-based index of the question being answered. */
  current: number;
  /** Six in the onboarding quiz. */
  total?: number;
  /** `onDark` on plum and brick headers, `onLight` on the sage header. */
  tone?: ProgressTone;
}

const fillColor: Record<ProgressTone, string> = {
  onDark: color.mustard,
  onLight: color.ink,
};

const trackColor: Record<ProgressTone, string> = {
  onDark: line.trackOnDark,
  onLight: line.trackOnLight,
};

/**
 * Six segments, never a continuous bar — the segmentation is what makes the
 * quiz feel short (DESIGN_SYSTEM.md §5).
 *
 * Only the segment that just completed animates. Segments already filled when
 * the screen mounts snap straight to their end state, so arriving on question 4
 * does not replay three fills.
 */
export function ProgressSegments({ current, total = 6, tone = 'onDark' }: ProgressSegmentsProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_unused, index) => (
        <Segment key={index} filled={index < current} tone={tone} />
      ))}
    </View>
  );
}

function Segment({ filled, tone }: { filled: boolean; tone: ProgressTone }) {
  const progress = useSharedValue(filled ? 1 : 0);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      progress.value = filled ? 1 : 0;
      return;
    }
    progress.value = withTiming(filled ? 1 : 0, {
      duration: motion.duration.progress,
      easing: Easing.out(Easing.quad),
    });
  }, [filled, progress]);

  // Opacity only, so this animation is already correct under reduced motion.
  const fillStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <View style={[styles.segment, { backgroundColor: trackColor[tone] }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.fill,
          { backgroundColor: fillColor[tone] },
          fillStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: size.progressSegmentGap,
  },
  segment: {
    flex: 1,
    height: size.progressSegmentHeight,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: radius.pill,
  },
});
