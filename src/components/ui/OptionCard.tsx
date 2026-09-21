import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { Check, type LucideIcon } from 'lucide-react-native';

import { radius, space, type as typeStyles, type ColorToken } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';
import { usePressScale } from './motion';

export interface OptionCardProps {
  icon: LucideIcon;
  /** Colour token for the 44px disc. */
  iconFill: ColorToken;
  /** The `on-*` token legible on `iconFill`. Pair them — never guess. */
  iconOn: ColorToken;
  label: string;
  /** Switches to the two-line variant. Q3 uses it to define its answers. */
  subLabel?: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Single-select answer card, used for every onboarding question except Q2.
 *
 * **Selection never changes the fill.** The card stays `surface` in both
 * states; selection is a 2px ink border, `shadow-md`, and a check in the
 * trailing slot. That slot holds its 26px whether or not the card is selected,
 * which is why choosing an option never reflows the list.
 */
export function OptionCard({
  icon: Icon,
  iconFill,
  iconOn,
  label,
  subLabel,
  selected = false,
  onPress,
  style,
}: OptionCardProps) {
  const { c, shadow } = useTheme();
  const press = usePressScale(0.99);

  return (
    <Animated.View style={[press.style, style]}>
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        accessibilityLabel={subLabel ? `${label}. ${subLabel}` : label}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[
          styles.card,
          { backgroundColor: c.surface },
          selected
            ? [{ borderColor: c.textPrimary }, shadow.md]
            : [{ borderColor: 'transparent' }, shadow.xs],
        ]}
      >
        <View style={[styles.disc, { backgroundColor: c[iconFill] }]}>
          <Icon size={20} strokeWidth={2} color={c[iconOn]} />
        </View>

        <View style={styles.body}>
          <Text style={[typeStyles.labelLG, { color: c.textPrimary }]}>{label}</Text>
          {subLabel ? (
            <Text style={[typeStyles.bodySM, styles.sub, { color: c.textSecondary }]}>
              {subLabel}
            </Text>
          ) : null}
        </View>

        {/* Always 26px wide. Collapsing it when unselected is what makes a list jump. */}
        <View
          style={[
            styles.check,
            selected ? { backgroundColor: c.textPrimary } : null,
          ]}
        >
          {selected ? <Check size={15} strokeWidth={2.6} color={c.surface} /> : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space4,
    width: '100%',
    minHeight: 72,
    paddingVertical: space.space4,
    paddingHorizontal: space.space5,
    borderWidth: 2,
    borderRadius: radius.lg,
  },
  disc: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  sub: {
    marginTop: 2,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
