import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { SymptomChip, useEntrance, type Symptom } from '@/components/ui';
import { space } from '@/constants/tokens';
import { readAnswer, saveAnswer } from '@/lib/storage/onboarding';

/**
 * The twelve most-reported entry symptoms — not the tracker's full 34. Her
 * picks here seed the tracker's default ordering, so the twelve are a product
 * decision, not a layout one.
 *
 * Each slug drives its icon through `SYMPTOM_ICONS`, and its colour through the
 * category. That mapping is fixed: she learns it here and uses it daily after.
 */
const SYMPTOMS: readonly Symptom[] = [
  { slug: 'hot-flashes', label: 'Hot flashes', category: 'temperature' },
  { slug: 'night-sweats', label: 'Night sweats', category: 'temperature' },
  { slug: 'anxiety', label: 'Anxiety', category: 'mood' },
  { slug: 'irritability', label: 'Irritability', category: 'mood' },
  { slug: 'low-mood', label: 'Low mood', category: 'mood' },
  { slug: 'brain-fog', label: 'Brain fog', category: 'cognitive' },
  { slug: 'word-finding', label: 'Losing words', category: 'cognitive' },
  { slug: 'insomnia', label: 'Insomnia', category: 'sleep' },
  { slug: 'waking-3am', label: 'Waking at 3am', category: 'sleep' },
  { slug: 'fatigue', label: 'Fatigue', category: 'physical' },
  { slug: 'palpitations', label: 'Palpitations', category: 'physical' },
  { slug: 'irregular-periods', label: 'Irregular periods', category: 'cycle' },
];

/**
 * Onboarding 3 of 8 — Q2 · Symptoms, from `design/screens/Q2Symptoms.dc.html`.
 *
 * The only multi-select in the quiz, and **zero selections is a real answer** —
 * Continue stays enabled throughout. "None of these" is information, and
 * forcing a pick to get past the screen would make it noise.
 *
 * The chips wrap in a flowing row rather than a grid. The names run from
 * "Anxiety" to "Irregular periods" and a fixed grid either clips the long ones
 * or wastes half a row on the short ones.
 */
export default function Q2SymptomsScreen() {
  const [picked, setPicked] = useState<readonly string[]>(() => readAnswer('symptoms') ?? []);

  const toggle = (slug: string) => {
    const next = picked.includes(slug) ? picked.filter((s) => s !== slug) : [...picked, slug];
    setPicked(next);
    saveAnswer('symptoms', [...next]);
  };

  return (
    <QuestionScreen
      step={2}
      headerHeight={232}
      title={<>Which symptoms{'\n'}hit you hardest?</>}
      footnote={`${picked.length} selected. Pick as many as apply, or none.`}
      onContinue={() => router.push('/q3')}
    >
      <View style={styles.grid}>
        {SYMPTOMS.map((symptom, index) => (
          <Chip
            key={symptom.slug}
            symptom={symptom}
            index={index}
            selected={picked.includes(symptom.slug)}
            onToggle={() => toggle(symptom.slug)}
          />
        ))}
      </View>
    </QuestionScreen>
  );
}

interface ChipProps {
  symptom: Symptom;
  index: number;
  selected: boolean;
  onToggle: () => void;
}

function Chip({ symptom, index, selected, onToggle }: ChipProps) {
  // `useEntrance` clamps at 8, which is what the artboard does too: the last
  // four chips share the `d8` delay rather than trailing off past 500ms.
  const entrance = useEntrance(index + 1);

  return (
    <Animated.View style={entrance}>
      <SymptomChip symptom={symptom} selected={selected} onToggle={onToggle} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.space3,
  },
});
