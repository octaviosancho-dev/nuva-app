import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Image as SvgImage, Pattern, Rect } from 'react-native-svg';

import { color, opacity } from '@/constants/tokens';

/**
 * Tiling texture overlays, drawn as `react-native-svg` patterns.
 *
 * These were `<Image resizeMode="repeat">` per DESIGN_SYSTEM.md §4, which is
 * what the mockups' CSS implies. Two problems with that: `react-native-web`
 * ignores `repeat` and paints a single tile, so there was no way to verify the
 * texture anywhere except on a device — and on the device the halftone did not
 * show up at all.
 *
 * An SVG pattern renders identically everywhere and is a closer match besides:
 * the mockups draw the halftone with `radial-gradient(<colour> 1.6px,
 * transparent 1.6px)` on a 12px grid, which is a vector circle, not a bitmap.
 * The dots are now resolution-independent, so there is nothing to resample.
 */

/** Grid pitch in dp, and the dot radius the mockups' radial-gradient uses. */
const HALFTONE_PITCH = 12;
const HALFTONE_RADIUS = 1.6;

/** Grain stays a bitmap — it is noise, which no primitive can express. */
const GRAIN_PITCH = 100;
const grainSource = require('@/assets/textures/grain.png') as number;

export type HalftoneVariant = 'cream' | 'ink';

const halftoneColor: Record<HalftoneVariant, string> = {
  cream: color.cream,
  ink: color.ink,
};

const halftoneOpacity: Record<HalftoneVariant, number> = {
  cream: opacity.halftoneOnDark,
  ink: opacity.halftoneOnLight,
};

/** Absolute-fill grain. One per screen, over the content. */
export function GrainOverlay() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.passThrough, { opacity: opacity.grain }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id="nuva-grain"
            patternUnits="userSpaceOnUse"
            width={GRAIN_PITCH}
            height={GRAIN_PITCH}
          >
            <SvgImage
              href={grainSource}
              x={0}
              y={0}
              width={GRAIN_PITCH}
              height={GRAIN_PITCH}
              preserveAspectRatio="xMidYMid slice"
            />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill="url(#nuva-grain)" />
      </Svg>
    </View>
  );
}

/**
 * Dot texture inside a header block. Sits below the illustration in z-order so
 * the artwork stays clean and the dots only show on the empty part of the block.
 */
export function HalftoneOverlay({ variant }: { variant: HalftoneVariant }) {
  const id = `nuva-halftone-${variant}`;
  return (
    <View
      style={[StyleSheet.absoluteFill, styles.passThrough, { opacity: halftoneOpacity[variant] }]}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern
            id={id}
            patternUnits="userSpaceOnUse"
            width={HALFTONE_PITCH}
            height={HALFTONE_PITCH}
          >
            <Circle
              cx={HALFTONE_PITCH / 2}
              cy={HALFTONE_PITCH / 2}
              r={HALFTONE_RADIUS}
              fill={halftoneColor[variant]}
            />
          </Pattern>
        </Defs>
        <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  passThrough: {
    pointerEvents: 'none',
  },
});
