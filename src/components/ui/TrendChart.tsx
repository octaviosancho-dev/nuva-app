import { useEffect } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { MOTION, category } from '@/constants/nuva';
import { space, type as typeStyles, type ColorToken } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';
import { ease } from './motion';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/** The artboard's geometry: 132 tall, gridlines at 6, 46, 86, 126. */
const HEIGHT = 132;
const TOP = 6;
const STEP = 40;
/** Severity 1 sits on the floor at 126, 4 at the ceiling at 6. */
const LEVELS = [4, 3, 2, 1];

/** A dot every sixth point, so 30 days yields five. */
const DOT_EVERY = 6;

/** How far the area sits behind its line. See the note on `fill`. */
const AREA_ALPHA = 0.22;

/** Long enough to cover any path this chart draws. */
const DASH = 900;

export interface TrendPoint {
  date: string;
  severity: number | null;
}

export interface TrendChartProps {
  points: readonly TrendPoint[];
  /** A category slug — the line takes its colour and the area a tint of it. */
  categorySlug: string;
  /** Width of the plot area, excluding the y-axis column and its gap. */
  width: number;
  style?: StyleProp<ViewStyle>;
}

/** Severity 1–4 to a y coordinate. Fixed, never derived from the data. */
function y(severity: number): number {
  return TOP + (4 - severity) * STEP;
}

/**
 * A 30-day severity line for one symptom.
 *
 * **The y axis is fixed at 1–4 and never auto-scales.** A chart that rescales
 * to its own data makes a mild month look identical to a severe one, which is
 * exactly the misreading this product exists to prevent.
 *
 * Days she did not log break the line rather than dropping it to zero: no data
 * is not the same claim as no symptoms, and only one of those is hers to make.
 */
export function TrendChart({ points, categorySlug, width, style }: TrendChartProps) {
  const { c } = useTheme();
  const reduced = useReducedMotion();

  const draw = useSharedValue(reduced ? 1 : 0);
  const area = useSharedValue(reduced ? 1 : 0);
  const dots = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) {
      draw.value = 1;
      area.value = 1;
      dots.value = 1;
      return;
    }
    draw.value = withDelay(
      120,
      withTiming(1, { duration: MOTION.duration.reveal, easing: ease.standard }),
    );
    area.value = withDelay(240, withTiming(1, { duration: MOTION.duration.base }));
    // After the line has finished, so the dots land on a drawn path.
    dots.value = withDelay(640, withTiming(1, { duration: MOTION.duration.quick }));
  }, [points, reduced, draw, area, dots]);

  const cat = category(categorySlug);
  const stroke = c[(cat?.token ?? 'catPhysical') as ColorToken];

  /**
   * The spec asks for the category's `-soft` tint under the line, but the
   * palette only defines three of them — `ember-soft`, `clay-soft` and
   * `luna-soft`. Mood, cognitive, sleep and cycle have none, so mapping each
   * category to a token meant four of the six drawing an area in exactly the
   * line's colour.
   *
   * One rule for all six instead: the category colour at low alpha. That is
   * what a `-soft` token is — the same hue, lightened toward the surface —
   * and deriving it keeps the six areas at equal visual weight, which picking
   * real tints for two and raw hues for four would not.
   */
  const fill = stroke;

  const step = points.length > 1 ? width / (points.length - 1) : 0;

  // Runs of consecutive logged days. A gap starts a new run rather than
  // joining across it.
  const runs: { x: number; y: number }[][] = [];
  let run: { x: number; y: number }[] = [];
  points.forEach((p, i) => {
    if (p.severity === null) {
      if (run.length) runs.push(run);
      run = [];
      return;
    }
    run.push({ x: i * step, y: y(p.severity) });
  });
  if (run.length) runs.push(run);

  const linePath = runs
    .map((r) => r.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' '))
    .join(' ');

  const areaPath = runs
    .filter((r) => r.length > 1)
    .map((r) => {
      const body = r.map((pt) => `L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(' ');
      return `M ${r[0].x.toFixed(1)} ${HEIGHT} ${body} L ${r[r.length - 1].x.toFixed(1)} ${HEIGHT} Z`;
    })
    .join(' ');

  const lineProps = useAnimatedProps(() => ({ strokeDashoffset: DASH * (1 - draw.value) }));
  const areaStyle = useAnimatedStyle(() => ({ opacity: area.value * AREA_ALPHA }));
  const dotStyle = useAnimatedStyle(() => ({ opacity: dots.value }));

  const dotPoints = runs.flat().filter((_, i) => i % DOT_EVERY === 0);

  return (
    <View style={[styles.row, style]}>
      <View style={styles.axis}>
        {LEVELS.map((n) => (
          <Text key={n} style={[typeStyles.caption, styles.axisLabel, { color: c.textTertiary }]}>
            {n}
          </Text>
        ))}
      </View>

      <View style={{ width, height: HEIGHT }}>
        <Svg width={width} height={HEIGHT}>
          {LEVELS.map((n) => (
            <Line key={n} x1={0} y1={y(n)} x2={width} y2={y(n)} stroke={c.line} strokeWidth={1} />
          ))}
        </Svg>

        <Animated.View style={[StyleSheet.absoluteFill, areaStyle]} pointerEvents="none">
          <Svg width={width} height={HEIGHT}>
            <Path d={areaPath} fill={fill} />
          </Svg>
        </Animated.View>

        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <Svg width={width} height={HEIGHT}>
            <AnimatedPath
              d={linePath}
              stroke={stroke}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray={DASH}
              animatedProps={lineProps}
            />
          </Svg>
        </View>

        <Animated.View style={[StyleSheet.absoluteFill, dotStyle]} pointerEvents="none">
          <Svg width={width} height={HEIGHT}>
            {dotPoints.map((pt, i) => (
              <Circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={4}
                fill={c.surface}
                stroke={stroke}
                strokeWidth={2.2}
              />
            ))}
          </Svg>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  axis: {
    height: HEIGHT,
    justifyContent: 'space-between',
    paddingVertical: space.space1,
  },
  axisLabel: {
    fontVariant: ['tabular-nums'],
  },
});
