import { ArrowLeft } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import { color, icon, radius, size } from '@/constants/tokens';
import { usePressFeedback } from './usePressFeedback';

export interface BackButtonProps {
  onPress: () => void;
  /** Spoken label. The glyph alone is not a label. */
  accessibilityLabel?: string;
}

/**
 * Top-left of every quiz header, sharing a 14px-gap row with `ProgressSegments`.
 * Back is always available — never trap her (PRODUCT_BRIEF.md §5.1).
 */
export function BackButton({ onPress, accessibilityLabel = 'Go back' }: BackButtonProps) {
  const feedback = usePressFeedback();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={feedback.onPressIn}
      onPressOut={feedback.onPressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Animated.View style={[styles.button, feedback.style]}>
        <ArrowLeft
          size={icon.control.size}
          strokeWidth={icon.control.strokeWidth}
          color={color.ink}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: size.backButton,
    height: size.backButton,
    borderRadius: radius.sm,
    backgroundColor: color.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
