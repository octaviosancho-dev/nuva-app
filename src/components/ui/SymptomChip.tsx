import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { MOTION, SYMPTOM_ICONS, category, type CategorySlug } from '@/constants/nuva';
import { radius, space, type as typeStyles, type ColorToken } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';
import { icon } from './icons';
import { usePressScale } from './motion';

export interface Symptom {
  slug: string;
  label: string;
  category: CategorySlug;
}

export interface SymptomChipProps {
  symptom: Symptom;
  selected?: boolean;
  onToggle?: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * The scrim behind the icon inside a *selected* chip. The disc has to hold
 * against both dark category fills and the two light ones, so it is a wash of
 * the label's own colour rather than a fixed tint.
 */
const SCRIM_ON_DARK = 'rgba(253,248,241,0.22)';
const SCRIM_ON_LIGHT = 'rgba(31,27,46,0.13)';

/** The two category fills that take dark text — see `on-blush` and `on-luna`. */
const LIGHT_FILLS: ReadonlySet<CategorySlug> = new Set<CategorySlug>(['mood', 'physical']);

/**
 * Multi-select symptom chip, coloured by its category.
 *
 * The chip's colour is its **category, not its selection state** — that is the
 * one place this system lets a fill change, and it is why there is no check
 * mark: the flip is the signal, and twelve check marks in a row is noise.
 *
 * Chips wrap in a flowing row. Never force a fixed grid: the names run from
 * "Rage" to "Unrefreshing sleep" and a grid either clips or wastes half a row.
 */
export function SymptomChip({ symptom, selected = false, onToggle, style }: SymptomChipProps) {
  const { c, shadow } = useTheme();
  const reduced = useReducedMotion();
  const press = usePressScale(0.97);
  const disc = useSharedValue(1);

  const cat = category(symptom.category);
  const fill = c[(cat?.token ?? 'catPhysical') as ColorToken];
  const on = c[(cat?.on ?? 'onLuna') as ColorToken];
  /**
   * The **symptom's** icon, not the category's. `SYMPTOM_ICONS` is the design
   * system's stated source of truth here: she learns each glyph in Q2 and then
   * uses it daily in the tracker, so one icon per category would hand her six
   * symbols where the product promised thirty-four. The category icon is only a
   * fallback for a slug the map does not know.
   */
  const Icon = icon(SYMPTOM_ICONS[symptom.slug] ?? cat?.icon ?? 'circle-dashed');

  const onPress = () => {
    if (!reduced && !selected) {
      // The disc blooms only on select, not on deselect — the gesture that adds
      // something gets the flourish; taking it away is quiet.
      disc.value = withSequence(
        withSpring(1.12, MOTION.spring.bloom),
        withSpring(1, MOTION.spring.bloom),
      );
    }
    onToggle?.();
  };

  const discStyle = useAnimatedStyle(() => ({ transform: [{ scale: disc.value }] }));

  const scrim = LIGHT_FILLS.has(symptom.category) ? SCRIM_ON_LIGHT : SCRIM_ON_DARK;

  return (
    <Animated.View style={[press.style, style]}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={symptom.label}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        style={[
          styles.chip,
          selected
            ? [{ backgroundColor: fill, borderColor: 'transparent' }, shadow.sm]
            : { backgroundColor: c.surface, borderColor: c.lineStrong },
        ]}
      >
        <Animated.View
          style={[
            styles.disc,
            { backgroundColor: selected ? scrim : fill },
            reduced ? null : discStyle,
          ]}
        >
          <Icon size={16} strokeWidth={2} color={selected ? on : c[(cat?.on ?? 'onLuna') as ColorToken]} />
        </Animated.View>

        <Text style={[typeStyles.label, { color: selected ? on : c.textPrimary }]}>
          {symptom.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space2,
    minHeight: 46,
    paddingTop: space.space2,
    paddingRight: space.space4,
    paddingBottom: space.space2,
    paddingLeft: space.space2,
    borderWidth: 1.5,
    borderRadius: radius.pill,
  },
  disc: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
