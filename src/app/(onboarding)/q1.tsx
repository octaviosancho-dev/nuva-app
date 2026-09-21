import { router } from 'expo-router';
import { useState } from 'react';

import {
  DISC_CYCLE,
  OptionList,
  type QuestionOption,
} from '@/components/onboarding/OptionList';
import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { readAnswer, saveAnswer } from '@/lib/storage/onboarding';

/** The four answers, in the order the artboard sets them. */
const OPTIONS: readonly QuestionOption[] = [
  { label: 'In the last few months', icon: 'sunrise', ...DISC_CYCLE[0] },
  { label: 'Six months to a year ago', icon: 'moon', ...DISC_CYCLE[1] },
  { label: 'One to two years ago', icon: 'clock', ...DISC_CYCLE[2] },
  { label: 'Longer than two years', icon: 'calendar', ...DISC_CYCLE[3] },
];

/**
 * Onboarding 2 of 8 — Q1 · Timeline, from `design/screens/Q1Timeline.dc.html`.
 *
 * The first question is deliberately the easiest to answer, and it carries no
 * support paragraph: the quiz is a conversation, not a form. Back is hidden
 * here — there is no destination inside onboarding — but its box is kept, or
 * the header visibly jumps on the way to Q2.
 */
export default function Q1TimelineScreen() {
  // MMKV is synchronous, so a resumed session renders already-answered rather
  // than flashing unselected and correcting itself a frame later.
  const [selected, setSelected] = useState<number | null>(() => readAnswer('timeline') ?? null);

  const choose = (index: number) => {
    setSelected(index);
    saveAnswer('timeline', index);
  };

  return (
    <QuestionScreen
      step={1}
      headerHeight={290}
      title={<>When did you first{'\n'}notice something{'\n'}was different?</>}
      ctaDisabled={selected === null}
      onContinue={() => router.push('/q2')}
    >
      <OptionList options={OPTIONS} selected={selected} onSelect={choose} />
    </QuestionScreen>
  );
}
