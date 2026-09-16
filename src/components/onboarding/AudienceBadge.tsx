import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { color, radius, size, text } from '@/constants/tokens';
import { type } from '@/constants/typography';

export interface AudienceBadgeProps {
  label: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The mustard pill in the welcome header.
 *
 * It is not an `EyebrowPill` — that component is the quiz's outlined/solid pair,
 * picked by header luminance. This one is a touch larger, filled mustard with
 * ink text, and it exists to name the audience in the first second, which is the
 * whole positioning (DESIGN_SYSTEM.md §7).
 */
export function AudienceBadge({ label, style }: AudienceBadgeProps) {
  return (
    <View style={[styles.badge, style]}>
      <Text style={[type.eyebrow, styles.label]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: size.audienceBadgeHeight,
    paddingHorizontal: size.audienceBadgePaddingHorizontal,
    borderRadius: radius.pill,
    backgroundColor: color.mustard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    // `eyebrow` defaults to cream for dark headers; ink clears 4.5:1 on mustard.
    color: text.primary,
  },
});
