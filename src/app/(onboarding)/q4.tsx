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
 * "Yes, and I was dismissed" is named plainly and placed second, not buried.
 * PRODUCT_BRIEF.md section 1 says this is what actually happens to her, and
 * this is the first place the product shows it already knows how it usually
 * goes. Softening the wording here would undo that.
 */
const OPTIONS: readonly QuestionOption[] = [
  { label: 'Yes, and I was taken seriously', icon: 'stethoscope', ...DISC_CYCLE[0] },
  { label: 'Yes, and I was dismissed', icon: 'message-circle-x', ...DISC_CYCLE[1] },
  { label: 'Not yet', icon: 'message-circle-off', ...DISC_CYCLE[2] },
  { label: 'I have an appointment coming up', icon: 'calendar', ...DISC_CYCLE[3] },
];

/**
 * Onboarding 5 of 8 — Q4 · The doctor conversation, from
 * `design/screens/Q4Doctor.dc.html`. The last question on `night`; Q5 moves to
 * `luna` as she nears the magic moment.
 */
export default function Q4DoctorScreen() {
  const [selected, setSelected] = useState<number | null>(() => readAnswer('doctor') ?? null);

  const choose = (index: number) => {
    setSelected(index);
    saveAnswer('doctor', index);
  };

  return (
    <QuestionScreen
      step={4}
      headerHeight={252}
      title={<>Have you talked to{'\n'}a doctor about this?</>}
      ctaDisabled={selected === null}
      onContinue={() => router.push('/q5')}
    >
      <OptionList options={OPTIONS} selected={selected} onSelect={choose} />
    </QuestionScreen>
  );
}
