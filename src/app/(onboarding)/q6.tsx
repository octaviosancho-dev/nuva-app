import { Image } from 'expo-image';
import { router } from 'expo-router';
import { BellOff, Sun, SunMedium, Sunset, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import {
  ArchHeader,
  BackButton,
  EyebrowPill,
  GrainOverlay,
  OptionCard,
  PrimaryButton,
  ProgressSegments,
  useStatusBarStyle,
} from '@/components/ui';
import { artColor, color, layout, screen, size, space, text } from '@/constants/tokens';
import { accent, type } from '@/constants/typography';
import { readAnswer, saveAnswer } from '@/lib/storage/onboarding';

const dayArc = require<ImageSourcePropType>('@/assets/illustrations/day-arc.jpg');

/**
 * Each answer carries the `profiles.reminder_hour` it writes. The notification
 * cron reads that column, so without this question every reminder would fire at
 * a guessed time (PRODUCT_BRIEF.md §5.1).
 *
 * `null` is not "ask again later" — it means the cron skips her permanently
 * until she changes it in settings. Offering it costs some retention and buys
 * the trust the product depends on.
 *
 * The first icon is `sun`, never `sunrise`: §9 already spends `sunrise` on Q1's
 * "in the last few months", and two time-themed screens cannot share a glyph.
 */
const options: { label: string; icon: LucideIcon; reminderHour: number | null }[] = [
  { label: 'In the morning', icon: Sun, reminderHour: 8 },
  { label: 'Around midday', icon: SunMedium, reminderHour: 13 },
  { label: 'In the evening', icon: Sunset, reminderHour: 20 },
  { label: 'I’d rather not be reminded', icon: BellOff, reminderHour: null },
];

/**
 * Onboarding screen 7 of 8 — Q6 · Check-in time, DESIGN_SYSTEM.md §7.
 *
 * Last question, and deliberately the lowest-friction one: she arrives at the
 * magic moment with momentum rather than fatigue. §7 is explicit that this
 * screen takes no sub-labels — the taller card would make it feel like work.
 *
 * Sage header, so everything inverts to ink on light, status bar included.
 */
export default function Q6CheckInScreen() {
  const [selected, setSelected] = useState<number | null>(
    () => readAnswer('checkIn')?.index ?? null,
  );

  const choose = (index: number) => {
    setSelected(index);
    const option = options[index];
    if (option) {
      // The hour travels with the answer — it is what profiles.reminder_hour
      // gets set to, and null there means the cron skips her permanently.
      saveAnswer('checkIn', { index, reminderHour: option.reminderHour });
    }
  };

  useStatusBarStyle('dark');

  const onBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/q5');
    }
  };

  const onContinue = () => {
    router.push('/magic-moment');
  };

  return (
    <View style={styles.screen}>
      <ArchHeader
        backgroundColor={artColor.headerSageQ6}
        depth="shallow"
        height={screen.quizHeaderHeight}
        halftone="ink"
        paddingBottom={0}
        style={styles.header}
      >
        {/* Anchored to the block's base — see Q1. */}
        <Image
          source={dayArc}
          style={styles.band}
          contentFit="cover"
          accessibilityLabel="One day as an arc, sun rising at the left and a crescent at the right"
        />

        <View style={styles.headerContent}>
          <View style={styles.controls}>
            <BackButton onPress={onBack} />
            <ProgressSegments current={6} tone="onLight" />
          </View>

          <View style={styles.afterControls} />
          <EyebrowPill label="Question 6 of 6" variant="solid" />

          <View style={styles.afterEyebrow} />
          <Text style={[type.displayMD, styles.question]}>
            When do you want to <Text style={accent(color.plum)}>check in?</Text>
          </Text>

          <View style={styles.afterQuestion} />
          {/* §7 writes this as "We'll send one quiet reminder. You can change it
              any time." That runs to two lines, and with the header pinned to a
              shared height the second line lands on top of the illustration band
              anchored below it. Trimmed to one line, keeping both promises: the
              reminder is quiet, and it is reversible. */}
          <Text style={[type.body, styles.support]}>
            One quiet reminder. You can change it any time.
          </Text>
        </View>
      </ArchHeader>

      <View style={styles.body}>
        <View style={styles.options}>
          {options.map((option, index) => (
            <OptionCard
              key={option.label}
              label={option.label}
              icon={option.icon}
              index={index}
              selected={selected === index}
              onPress={() => choose(index)}
            />
          ))}
        </View>

        <View style={styles.spacer} />

        <PrimaryButton label="Continue" onPress={onContinue} disabled={selected === null} />
      </View>

      <GrainOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: color.cream,
  },
  header: {
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  headerContent: {
    paddingTop: layout.headerTopInset,
    paddingHorizontal: layout.gutter,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xl,
  },
  afterControls: {
    height: space['2xl'],
  },
  afterEyebrow: {
    height: space.lg,
  },
  question: {
    // `displayMD` already defaults to ink — the sage header needs no override.
    maxWidth: screen.bandQuestionMaxWidth,
  },
  afterQuestion: {
    height: space.sm,
  },
  support: {
    color: text.onLightMuted,
  },
  band: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: size.illustrationBand,
  },
  body: {
    flex: 1,
    paddingTop: space['4xl'],
    paddingHorizontal: layout.gutter,
    paddingBottom: layout.screenBottom,
  },
  options: {
    gap: space.md,
  },
  spacer: {
    flex: 1,
  },
});
