import { router } from 'expo-router';
import { useState } from 'react';

import {
  DISC_CYCLE,
  OptionList,
  type QuestionOption,
} from '@/components/onboarding/OptionList';
import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { readAnswer, saveAnswer } from '@/lib/storage/onboarding';

/**
 * The only question that takes sub-labels. "Shorter and closer together" means
 * nothing without a number attached, and guessing wrong here puts her in the
 * wrong stage — so each answer carries its own definition.
 */
const OPTIONS: readonly QuestionOption[] = [
  {
    label: 'Still regular',
    subLabel: 'Within a few days of usual',
    icon: 'droplet',
    ...DISC_CYCLE[0],
  },
  {
    label: 'Shorter and closer together',
    subLabel: 'Under 24 days apart',
    icon: 'moon',
    ...DISC_CYCLE[1],
  },
  {
    label: 'Longer gaps, skipping months',
    subLabel: '35 days or more, or missed',
    icon: 'calendar',
    ...DISC_CYCLE[2],
  },
  {
    label: 'They have stopped',
    subLabel: 'Nothing for 12 months',
    icon: 'circle-dashed',
    ...DISC_CYCLE[3],
  },
];

/**
 * Onboarding 4 of 8 — Q3 · Periods, from `design/screens/Q3Periods.dc.html`.
 *
 * Its header is 20px taller than Q2's on the same two-line headline, because
 * the sub-labelled cards below run tall and the extra breathing room is what
 * keeps the CTA off the last card at 375px.
 */
export default function Q3PeriodsScreen() {
  const [selected, setSelected] = useState<number | null>(() => readAnswer('periods') ?? null);

  const choose = (index: number) => {
    setSelected(index);
    saveAnswer('periods', index);
  };

  return (
    <QuestionScreen
      step={3}
      headerHeight={252}
      title={<>How are your periods{'\n'}right now?</>}
      ctaDisabled={selected === null}
      onContinue={() => router.push('/q4')}
    >
      <OptionList options={OPTIONS} selected={selected} onSelect={choose} />
    </QuestionScreen>
  );
}
