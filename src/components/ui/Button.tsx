import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import type { LucideIcon } from 'lucide-react-native';

import { opacity, radius, space, type as typeStyles } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';
import { LoadingMark } from '@/components/art/Logo';
import { usePressScale } from './motion';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'onNight';

export interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  /** Rendered after the label at 18px, stroke 2. */
  icon?: LucideIcon;
  /** 42px tall, `buttonSM`, auto width — for inline actions like Copy or Edit. */
  compact?: boolean;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * The primary action control, and the only element in the system that carries a
 * glow. One `primary` per screen — if a screen seems to need two, one of them
 * is `secondary`.
 *
 * Disabled keeps the fill and drops to `opacity-disabled` with the glow
 * removed. It is never greyed: the colour staying put is what tells her it is
 * the same button, still waiting on her.
 */
export function Button({
  label,
  variant = 'primary',
  icon: Icon,
  compact = false,
  disabled = false,
  loading = false,
  onPress,
  style,
}: ButtonProps) {
  const { c, shadow } = useTheme();
  const press = usePressScale(0.98);

  const fills: Record<ButtonVariant, { background: string; foreground: string }> = {
    primary: { background: c.ember, foreground: c.onEmber },
    secondary: { background: c.sand, foreground: c.onSand },
    ghost: { background: 'transparent', foreground: c.textLink },
    onNight: { background: c.textOnNight, foreground: c.night },
  };

  const { background, foreground } = fills[variant];
  const inactive = disabled || loading;

  // The glow belongs to an *enabled* primary button and to nothing else.
  const glow = variant === 'primary' && !inactive ? shadow.ember : null;

  return (
    <Animated.View style={[compact ? null : styles.block, press.style, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: inactive, busy: loading }}
        accessibilityLabel={label}
        disabled={inactive}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        // Compact is 42px tall on the artboards; the slop takes the touch
        // target past the 44px minimum without changing what she sees.
        hitSlop={compact ? { top: 2, bottom: 2, left: 0, right: 0 } : undefined}
        style={[
          styles.base,
          compact ? styles.compact : styles.full,
          { backgroundColor: background },
          glow,
          inactive ? { opacity: opacity.disabled } : null,
        ]}
      >
        {loading ? (
          // The width is held by the label's absence, not by a measurement:
          // `full` is already 100%, and `compact` callers size themselves.
          <LoadingMark size={20} onNight={variant === 'primary'} />
        ) : (
          <View style={styles.row}>
            <Text
              style={[compact ? typeStyles.buttonSM : typeStyles.button, { color: foreground }]}
              numberOfLines={1}
            >
              {label}
            </Text>
            {Icon ? <Icon size={18} strokeWidth={2} color={foreground} /> : null}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  block: {
    width: '100%',
  },
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  full: {
    minHeight: 56,
    paddingHorizontal: space.space6,
    width: '100%',
  },
  compact: {
    minHeight: 42,
    paddingHorizontal: space.space5,
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space2,
  },
});
