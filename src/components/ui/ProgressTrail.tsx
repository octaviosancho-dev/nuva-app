import { useEffect } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { MOTION } from '@/constants/nuva';
import { radius, space, type as typeStyles } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';
import {
  MARK_ANTENNA_LEFT,
  MARK_ANTENNA_RIGHT,
  MARK_BODY,
  MARK_EYESPOTS,
  MARK_VIEWBOX,
  MARK_WING_LEFT,
  MARK_WING_RIGHT,
} from '@/components/art/paths';
import { ease } from './motion';

const SEGMENT_HEIGHT = 3;
const SEGMENT_GAP = space.space1 + 1; // 5px, as the artboards draw it
const MOTH_SIZE = 16;
/** The artboards place the moth at `top: -11px` against the segment row. */
const MOTH_LIFT = 11;

const TRACK_ON_DARK = 'rgba(253,248,241,0.24)';
const TRACK_ON_LIGHT = 'rgba(31,27,46,0.22)';

export interface ProgressTrailProps {
  /** 6 in onboarding. */
  total?: number;
  /** 0–6. Fills cumulatively — every segment up to `current`. */
  current: number;
  onDark?: boolean;
  /**
   * Overrides for non-standard grounds. On a brand fill like `luna` these must
   * be passed as fixed values — the fill holds the same colour in both themes,
   * so anything drawn on it has to as well.
   */
  fill?: string;
  track?: string;
  countColor?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Six segments showing onboarding progress, with the moth travelling the filled
 * edge. Visible from question 1 onward, and **never outside onboarding** — the
 * tracker is not a progress bar.
 *
 * The count is rendered in text beside it, because six small bars is not a
 * number.
 */
export function ProgressTrail({
  total = 6,
  current,
  onDark = true,
  fill,
  track,
  countColor,
  style,
}: ProgressTrailProps) {
  const { c } = useTheme();

  const filledColor = fill ?? (onDark ? c.textOnNight : c.textPrimary);
  const trackColor = track ?? (onDark ? TRACK_ON_DARK : TRACK_ON_LIGHT);

  const clamped = Math.max(0, Math.min(current, total));
  // Hidden at 0 and at `total`: before she starts there is nothing to travel,
  // and once the set is complete the moth has arrived and leaves with it.
  const showMoth = clamped > 0 && clamped < total;

  return (
    <View style={[styles.row, style]}>
      <View style={styles.trail}>
        <View style={styles.segments}>
          {Array.from({ length: total }, (_, i) => (
            <Segment
              key={i}
              index={i}
              filled={i < clamped}
              // Only the newly filled segment animates; the ones behind it hold.
              animate={i === clamped - 1}
              fill={filledColor}
              track={trackColor}
            />
          ))}
        </View>

        {showMoth ? <Moth position={clamped / total} tint={filledColor} /> : null}
      </View>

      {/*
        The count is muted, not the filled colour. It is a readout, not part of
        the trail, and at full strength it competes with the headline below.
      */}
      <Text
        style={[
          typeStyles.caption,
          styles.count,
          { color: countColor ?? (onDark ? c.textOnNightMuted : c.textSecondary) },
        ]}
      >
        {clamped} of {total}
      </Text>
    </View>
  );
}

interface SegmentProps {
  index: number;
  filled: boolean;
  animate: boolean;
  fill: string;
  track: string;
}

function Segment({ filled, animate, fill, track }: SegmentProps) {
  const reduced = useReducedMotion();
  const grow = useSharedValue(filled && !animate ? 1 : 0);

  useEffect(() => {
    if (!filled) {
      grow.value = 0;
      return;
    }
    if (!animate || reduced) {
      grow.value = 1;
      return;
    }
    grow.value = withTiming(1, { duration: MOTION.duration.base, easing: ease.standard });
  }, [filled, animate, reduced, grow]);

  // `scaleX` from the left, so the fill reads as travelling forward.
  const style = useAnimatedStyle(() => ({ transform: [{ scaleX: grow.value }] }));

  return (
    <View style={[styles.segment, { backgroundColor: track }]}>
      <Animated.View style={[styles.segmentFill, { backgroundColor: fill }, style]} />
    </View>
  );
}

interface MothProps {
  /** 0–1 along the trail. */
  position: number;
  tint: string;
}

/**
 * The mark's two wings at 16px, sitting on the boundary between filled and
 * unfilled. The only place the mascot appears as a moving element rather than
 * as a character — which is what makes this a trail rather than a bar.
 */
function Moth({ position, tint }: MothProps) {
  const reduced = useReducedMotion();
  const at = useSharedValue(position);

  useEffect(() => {
    at.value = reduced ? position : withSpring(position, MOTION.spring.settle);
  }, [position, reduced, at]);

  const style = useAnimatedStyle(() => ({
    left: `${at.value * 100}%`,
  }));

  return (
    <Animated.View style={[styles.moth, style]} pointerEvents="none">
      {/*
        A silhouette, not the full-colour mark: at 16px on a 3px track the luna
        wings and ember eyespots would read as noise, so the whole moth takes
        the filled colour.
      */}
      <Svg width={MOTH_SIZE} height={MOTH_SIZE * (50 / 64)} viewBox={MARK_VIEWBOX} fill="none">
        <Path d={MARK_ANTENNA_RIGHT} stroke={tint} strokeWidth={2.3} strokeLinecap="round" />
        <Path d={MARK_ANTENNA_LEFT} stroke={tint} strokeWidth={2.3} strokeLinecap="round" />
        <Path d={MARK_WING_RIGHT} fill={tint} />
        <Path d={MARK_WING_LEFT} fill={tint} />
        {MARK_EYESPOTS.map((spot) => (
          <Circle key={spot.cx} cx={spot.cx} cy={spot.cy} r={spot.r} fill={tint} />
        ))}
        <Path d={MARK_BODY} fill={tint} />
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space3,
  },
  trail: {
    flex: 1,
    justifyContent: 'center',
  },
  segments: {
    flexDirection: 'row',
    gap: SEGMENT_GAP,
  },
  segment: {
    flex: 1,
    height: SEGMENT_HEIGHT,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  segmentFill: {
    width: '100%',
    height: '100%',
    borderRadius: radius.pill,
    transformOrigin: 'left',
  },
  moth: {
    position: 'absolute',
    bottom: MOTH_LIFT,
    marginLeft: -MOTH_SIZE / 2,
  },
  count: {
    fontVariant: ['tabular-nums'],
  },
});
