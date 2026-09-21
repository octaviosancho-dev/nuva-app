import type { ReactNode } from 'react';
import { StyleSheet, View, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { CREST, crestPath, type CrestDepth } from '@/constants/nuva';
import { space, type ColorToken } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';

export interface CrestHeaderProps {
  /**
   * `hero` for a header that is the screen — welcome, the paywall. `standard`
   * for every onboarding question and primary screen. `subtle` for dense
   * screens: the tracker, patterns, settings. There is no fourth depth.
   */
  depth?: CrestDepth;
  /** The block's height to the crest's *shoulders*, not to its lowest point. */
  height: number;
  /** A colour token name. `night` is the default; `night-deep` for welcome and the paywall. */
  fill?: ColorToken;
  /** Picks the text and trail colours. Set it to match the fill's darkness. */
  onDark?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Drops the default `space-6` gutter, for a header that positions its own content. */
  bare?: boolean;
}

/**
 * The screen header, ending in the crest — the soft convex curve that is the
 * system's one structural signature. It carries the back control, the progress
 * trail, the eyebrow and the headline.
 *
 * The curve is an SVG path, never `borderRadius`, which cannot produce it. The
 * sides sit at `height` and the centre dips `bulge` lower, so the SVG has to be
 * `height + bulge` tall or the curve clips at the bottom.
 *
 * Two things this deliberately does not do. It draws no shadow — the curve is
 * the edge. And it never stacks: one crest, at the top of a screen, and the
 * magic moment has none at all.
 */
export function CrestHeader({
  depth = 'standard',
  height,
  fill = 'night',
  onDark = true,
  children,
  style,
  bare = false,
}: CrestHeaderProps) {
  const { c } = useTheme();
  const { width } = useWindowDimensions();

  const bulge = CREST[depth];
  const surface = c[fill];

  return (
    <View style={[{ height: height + bulge }, style]}>
      <Svg
        width={width}
        height={height + bulge}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Path d={crestPath(width, height, depth)} fill={surface} />
      </Svg>

      {/*
        Content sits above the curve inside the block's own bounds. The headline
        must keep its last baseline at least 20px above `height`, or a long
        title collides with the crest — that is the consumer's job, since only
        it knows how many lines the copy runs to.
      */}
      <View style={[styles.content, bare ? null : styles.gutter]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  gutter: {
    paddingHorizontal: space.space6,
  },
});
