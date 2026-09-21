import { router } from 'expo-router';
import { useState } from 'react';

import {
  DISC_CYCLE,
  OptionList,
  type QuestionOption,
} from '@/components/onboarding/OptionList';
import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { readAnswer, saveAnswer } from '@/lib/storage/onboarding';

/** The four answers are the product's own four promises, in her words. */
const OPTIONS: readonly QuestionOption[] = [
  { label: 'Understanding what is happening', icon: 'cloud', ...DISC_CYCLE[0] },
  { label: 'Seeing the pattern over time', icon: 'activity', ...DISC_CYCLE[1] },
  { label: 'Knowing what to say to my doctor', icon: 'message-circle-heart', ...DISC_CYCLE[2] },
  { label: 'Tracking HRT and how it is working', icon: 'pill', ...DISC_CYCLE[3] },
];

/**
 * Onboarding 6 of 8 — Q5 · Goal, from `design/screens/Q5Goal.dc.html`.
 *
 * The header moves to `luna` here and stays there through Q6 — the mood lifts
 * as she nears the magic moment. Everything in the header inverts with it: ink
 * headline, an ink wash behind the eyebrow, and the trail's light-ground track.
 */
export default function Q5GoalScreen() {
  const [selected, setSelected] = useState<number | null>(() => readAnswer('goal') ?? null);

  const choose = (index: number) => {
    setSelected(index);
    saveAnswer('goal', index);
  };

  return (
    <QuestionScreen
      step={5}
      headerHeight={246}
      fill="luna"
      onDark={false}
      title={<>What should Nuva{'\n'}help with?</>}
      ctaDisabled={selected === null}
      onContinue={() => router.push('/q6')}
    >
      <OptionList options={OPTIONS} selected={selected} onSelect={choose} />
    </QuestionScreen>
  );
}
