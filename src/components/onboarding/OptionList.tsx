import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { OptionCard, icon, useEntrance } from '@/components/ui';
import { space, type ColorToken } from '@/constants/tokens';

export interface QuestionOption {
  label: string;
  /** Second line, in `bodySM`. Q3 uses it to define what each answer means. */
  subLabel?: string;
  /** A Lucide name, as `icons.ts` spells them. */
  icon: string;
  /** Disc fill. */
  fill: ColorToken;
  /** The `on-*` partner legible on `fill`. */
  on: ColorToken;
}

/**
 * The disc colours every four-option question cycles through, in order.
 * Rotating them keeps four answers distinguishable at a glance without making
 * any one of them look like the recommended choice.
 */
export const DISC_CYCLE: readonly { fill: ColorToken; on: ColorToken }[] = [
  { fill: 'emberSoft', on: 'emberDeep' },
  { fill: 'lunaSoft', on: 'lunaDeep' },
  { fill: 'claySoft', on: 'clay' },
  { fill: 'sand', on: 'onSand' },
];

export interface OptionListProps {
  options: readonly QuestionOption[];
  selected: number | null;
  onSelect: (index: number) => void;
}

/**
 * The stacked answers for every single-select question — Q1, Q3, Q4, Q5, Q6.
 *
 * Each card enters on the shared 44ms stagger, offset by one so the eyebrow
 * and headline above it land first.
 */
export function OptionList({ options, selected, onSelect }: OptionListProps) {
  return (
    <View style={styles.list}>
      {options.map((option, index) => (
        <Row
          key={option.label}
          option={option}
          index={index}
          selected={selected === index}
          onPress={() => onSelect(index)}
        />
      ))}
    </View>
  );
}

interface RowProps {
  option: QuestionOption;
  index: number;
  selected: boolean;
  onPress: () => void;
}

function Row({ option, index, selected, onPress }: RowProps) {
  const entrance = useEntrance(index + 1);

  return (
    <Animated.View style={entrance}>
      <OptionCard
        icon={icon(option.icon)}
        iconFill={option.fill}
        iconOn={option.on}
        label={option.label}
        subLabel={option.subLabel}
        selected={selected}
        onPress={onPress}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: space.space3,
  },
});
