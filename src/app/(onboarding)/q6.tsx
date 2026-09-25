import { router } from 'expo-router';
import { useState } from 'react';

import { CHECK_IN_OPTIONS as OPTIONS } from '@/components/onboarding/checkInOptions';
import { OptionList } from '@/components/onboarding/OptionList';
import { QuestionScreen } from '@/components/onboarding/QuestionScreen';
import { readAnswer, saveAnswer } from '@/lib/storage/onboarding';

/**
 * Onboarding 7 of 8 — Q6 · Check-in time, from `design/screens/Q6CheckIn.dc.html`.
 *
 * Last, and deliberately the lowest-friction question in the set, so she
 * arrives at the magic moment with momentum rather than fatigue. Choosing a
 * time is also a micro-commitment, taken one screen before the paywall.
 */
export default function Q6CheckInScreen() {
  const [selected, setSelected] = useState<number | null>(
    () => readAnswer('checkIn')?.index ?? null,
  );

  const choose = (index: number) => {
    setSelected(index);
    saveAnswer('checkIn', { index, reminderHour: OPTIONS[index].reminderHour });
  };

  return (
    <QuestionScreen
      step={6}
      headerHeight={246}
      fill="luna"
      onDark={false}
      title={<>When do you want{'\n'}to check in?</>}
      ctaDisabled={selected === null}
      onContinue={() => router.push('/magic-moment')}
    >
      <OptionList options={OPTIONS} selected={selected} onSelect={choose} />
    </QuestionScreen>
  );
}
