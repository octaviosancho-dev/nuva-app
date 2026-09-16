import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { borderWidth, color, line, radius, size, space } from '@/constants/tokens';
import { type } from '@/constants/typography';

export type EyebrowVariant = 'outlined' | 'solid';

export interface EyebrowPillProps {
  label: string;
  /**
   * Picked by header luminance, not by preference: `outlined` on plum and brick,
   * `solid` on sage.
   */
  variant?: EyebrowVariant;
  style?: StyleProp<ViewStyle>;
}

/** "Question 2 of 6", the audience badge. The only letter-spaced text in the app. */
export function EyebrowPill({ label, variant = 'outlined', style }: EyebrowPillProps) {
  return (
    <View style={[styles.pill, variant === 'solid' ? styles.solid : styles.outlined, style]}>
      <Text style={type.eyebrow}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    height: size.eyebrowHeight,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlined: {
    borderWidth: borderWidth.hairline,
    borderColor: line.onDark,
  },
  solid: {
    backgroundColor: color.ink,
  },
});
