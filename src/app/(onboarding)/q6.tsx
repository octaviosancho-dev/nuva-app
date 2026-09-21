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
 * Each answer carries the `profiles.reminder_hour` it writes. The notification
 * cron reads that column, so without this question every reminder fires at a
 * guessed time.
 *
 * `null` is not "ask again later" — it means the cron skips her permanently
 * until she changes it in settings. PRODUCT_BRIEF.md section 5.1 is explicit
 * that offering it costs some retention and buys the trust the whole product
 * depends on.
 */
const OPTIONS: readonly (QuestionOption & { reminderHour: number | null })[] = [
  { label: 'Morning, 7–9am', icon: 'sunrise', reminderHour: 8, ...DISC_CYCLE[0] },
  { label: 'Midday, 12–2pm', icon: 'sun', reminderHour: 13, ...DISC_CYCLE[1] },
  { label: 'Evening, 8–10pm', icon: 'sunset', reminderHour: 20, ...DISC_CYCLE[2] },
  { label: 'I would rather not be reminded', icon: 'bell-off', reminderHour: null, ...DISC_CYCLE[3] },
];

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
