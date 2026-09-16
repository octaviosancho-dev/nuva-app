import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { space } from '@/constants/tokens';
import { type } from '@/constants/typography';

export interface TextLinkProps {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Inline text action. No underline — the weight and the tertiary tone carry it.
 *
 * The label's own box is only 18px tall, and padding it out to the 44px minimum
 * target would swallow the measured gaps around it (§7 puts the welcome link
 * exactly 18 below the CTA and 30 above the screen's edge). `hitSlop` grows the
 * touch area to 46 without touching the layout.
 */
export function TextLink({ label, onPress, style }: TextLinkProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={space.xl}
      accessibilityRole="link"
      accessibilityLabel={label}
      style={[styles.link, style]}
    >
      <Text style={type.link}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    alignSelf: 'center',
  },
});
