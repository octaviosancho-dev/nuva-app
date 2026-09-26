import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { alpha } from '@/constants/nuva';
import { color, opacity, radius, space, type as typeStyles } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';
import { ArrowLeft } from 'lucide-react-native';

const grainTile = require('@/assets/textures/grain.png') as number;

/**
 * The paper grain, at `opacity.grain` (0.05), over the whole screen. Every
 * screen gets it — it is what stops `canvas` reading as flat.
 *
 * `react-native-web` ignores `resizeMode="repeat"`, so this only tiles
 * correctly on the device. Always `require` the base name: Metro reads
 * `@2x`/`@3x` as density suffixes and requiring them directly never resolves.
 */
export function GrainOverlay() {
  return (
    <View style={styles.grain} pointerEvents="none" accessible={false}>
      {/*
        React Native's own Image, not expo-image: `repeat` is the resize mode
        that tiles, and expo-image has no `contentFit` equivalent. The tile is
        authored at 100×100 with @2x and @3x beside it.
      */}
      <Image source={grainTile} style={StyleSheet.absoluteFill} resizeMode="repeat" />
    </View>
  );
}

export type EyebrowVariant = 'onNight' | 'onLight' | 'onLightFill' | 'ember';

export interface EyebrowPillProps {
  label: string;
  variant?: EyebrowVariant;
  style?: StyleProp<ViewStyle>;
}

/**
 * Section markers and question counters. The `eyebrow` style is the only thing
 * in the app that is ever uppercased, and the only letter-spaced text.
 */
export function EyebrowPill({ label, variant = 'onNight', style }: EyebrowPillProps) {
  const { c } = useTheme();

  const skin: Record<EyebrowVariant, { background: string; foreground: string }> = {
    onNight: { background: alpha(color.light.textOnNight, 0.14), foreground: c.textOnNight },
    onLight: { background: c.surfaceSunken, foreground: c.textSecondary },
    // Q5 and Q6 move the header to `luna`. A sunken surface would read as a
    // hole punched in the fill, so the pill becomes a wash of ink instead.
    //
    // Both values are fixed, not theme-resolved: `luna` holds the same green in
    // light and dark, so text on it must hold the same ink. Using the theme's
    // `textPrimary` here puts near-white on green in dark mode.
    onLightFill: { background: alpha(color.light.onLuna, 0.1), foreground: color.light.onLuna },
    ember: { background: c.ember, foreground: c.onEmber },
  };

  const { background, foreground } = skin[variant];

  return (
    <View style={[styles.eyebrow, { backgroundColor: background }, style]}>
      <Text style={[typeStyles.eyebrow, { color: foreground }]} numberOfLines={1}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

export interface TextLinkProps {
  label: string;
  size?: 'body' | 'caption';
  onDark?: boolean;
  onPress?: () => void;
  /** Overrides the link colour. The welcome screen's account link uses ink. */
  color?: string;
  style?: StyleProp<TextStyle>;
}

/**
 * Inline and standalone links. **Always underlined** — colour alone never
 * carries meaning in this system, so the underline is not a hover affordance.
 *
 * On `night` or `night-deep`, `text-link` does not clear contrast; `ember`
 * does, at 6.3:1, so `onDark` swaps it. No scale on press: a link is not a
 * button, and making it behave like one invites the wrong expectation.
 */
export function TextLink({
  label,
  size = 'body',
  onDark = false,
  onPress,
  color: override,
  style,
}: TextLinkProps) {
  const { c } = useTheme();
  const tint = override ?? (onDark ? c.ember : c.textLink);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={onPress}
      // Links are shorter than 44px, so the target is grown rather than the text.
      hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}
      style={({ pressed }) => (pressed ? { opacity: opacity.pressed } : null)}
    >
      <Text
        style={[
          size === 'caption' ? typeStyles.caption : typeStyles.body,
          styles.link,
          { color: tint },
          style,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export interface BackButtonProps {
  onPress?: () => void;
  onDark?: boolean;
  /**
   * Hides the control but keeps its 36px box. Q1 has no back destination inside
   * onboarding, and removing the control outright shifts the progress trail so
   * the header visibly jumps between Q1 and Q2.
   */
  hidden?: boolean;
}

export function BackButton({ onPress, onDark = true, hidden = false }: BackButtonProps) {
  const { c } = useTheme();

  if (hidden) {
    return <View style={styles.back} />;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.back,
        styles.backControl,
        { borderColor: onDark ? color.light.lineOnNight : c.line },
        pressed ? { opacity: opacity.pressed } : null,
      ]}
    >
      <ArrowLeft size={18} strokeWidth={2} color={onDark ? c.textOnNight : c.textPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grain: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: opacity.grain,
    zIndex: 8,
  },
  eyebrow: {
    alignSelf: 'flex-start',
    height: 26,
    paddingHorizontal: space.space3,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  back: {
    width: 36,
    height: 36,
  },
  backControl: {
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
