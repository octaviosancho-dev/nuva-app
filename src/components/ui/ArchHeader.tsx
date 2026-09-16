import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { arch, color, layout } from '@/constants/tokens';
import { HalftoneOverlay, type HalftoneVariant } from './Texture';

export type ArchDepth = keyof typeof arch;

/**
 * The arch is drawn in a square unit box and stretched to the block with
 * `preserveAspectRatio="none"`, so it needs no measurement at all.
 *
 * That non-uniform stretch is what makes it exact: x scales by W/100 and y by
 * H/100, so the arc's radii land on `(W/2, arch × H)` — the same ellipse the
 * mockups get from `border-radius: 0 0 50% 50% / 0 0 <arch>% <arch>%`.
 *
 * The earlier version measured the block with `onLayout` and gated the SVG on a
 * non-zero size. `onLayout` does not fire reliably, and when it didn't the
 * header rendered with a flat bottom edge and no arch at all.
 */
const VIEWBOX = 100;

export interface ArchHeaderProps {
  /**
   * The header fill. When the block carries an illustration this MUST be the
   * `artColor` sampled from that image's edge, or the art shows a seam.
   */
  backgroundColor: string;
  /** Curve depth. `hero` 0.15, `standard` 0.11, `shallow` 0.06. */
  depth?: ArchDepth;
  /** Fixed block height, as on the welcome screen. Omit to size to content. */
  height?: number;
  /** Dot texture inside the block. `cream` on plum/brick, `ink` on sage. */
  halftone?: HalftoneVariant;
  /** The screen color behind the header — the arch is cut out in this color. */
  surfaceColor?: string;
  /** 0 when the block's base is a full-bleed illustration band. */
  paddingBottom?: number;
  style?: StyleProp<ViewStyle>;
  children?: ReactNode;
}

/**
 * The signature element: a full-bleed block of saturated color whose bottom
 * edge curves. `borderRadius` cannot express an elliptical arch, so the curve
 * is drawn with `react-native-svg` (DESIGN_SYSTEM.md §5).
 *
 * The curve is painted as a CUT-OUT rather than as the block's fill: the block
 * is a plain rectangle with `overflow: hidden`, and an SVG in `surfaceColor`
 * covers everything below the curve. That clips the children — including a
 * full-bleed illustration band — to the arch without a native masking library.
 *
 * It is an elliptical arc, not the quadratic §5 writes. The mockups draw the
 * edge with `border-radius: 0 0 50% 50% / 0 0 <arch>% <arch>%`, which is half an
 * ellipse of radii `(W/2, H × arch)`. A quadratic through the same three points
 * follows `y = H − d·s²` where the ellipse follows `y = H − d·(1 − √(1 − s²))`;
 * the two diverge by up to 0.24·d, which measured against CQ3 pinched nearly
 * 10px out of each shoulder. `A` reproduces the mockup to within half a pixel.
 *
 * `d` is the full depth, so the arc's low point lands exactly at `H` — §5's
 * control point of `(W/2, H)` would have dipped only half that.
 */
export function ArchHeader({
  backgroundColor,
  depth = 'standard',
  height,
  halftone,
  surfaceColor = color.cream,
  paddingBottom = layout.headerGap,
  style,
  children,
}: ArchHeaderProps) {
  // Depth as a percentage of the viewBox rather than of a measured height.
  const d = arch[depth] * VIEWBOX;

  return (
    <View
      style={[styles.block, { backgroundColor, paddingBottom }, height != null && { height }, style]}
    >
      {halftone != null && <HalftoneOverlay variant={halftone} />}
      {children}
      <View style={[StyleSheet.absoluteFill, styles.passThrough]}>
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          preserveAspectRatio="none"
        >
          <Path
            d={
              `M 0 ${VIEWBOX - d} ` +
              `A ${VIEWBOX / 2} ${d} 0 0 0 ${VIEWBOX} ${VIEWBOX - d} ` +
              `L ${VIEWBOX} ${VIEWBOX} L 0 ${VIEWBOX} Z`
            }
            fill={surfaceColor}
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    overflow: 'hidden',
    paddingTop: layout.headerTopInset,
    paddingHorizontal: layout.gutter,
  },
  passThrough: {
    pointerEvents: 'none',
  },
});
