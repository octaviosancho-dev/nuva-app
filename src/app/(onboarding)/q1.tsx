import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Clock, Hourglass, Moon, Sunrise, type LucideIcon } from 'lucide-react-native';
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

const timelineBranch = require<ImageSourcePropType>(
  '@/assets/illustrations/timeline-branch.jpg',
);

/** The four answers, in the order they appear. Icons are fixed by §9. */
const options: { label: string; icon: LucideIcon }[] = [
  { label: 'In the last few months', icon: Sunrise },
  { label: 'About 6–12 months ago', icon: Moon },
  { label: '1–2 years ago', icon: Clock },
  { label: 'Longer than 2 years', icon: Hourglass },
];

/**
 * Onboarding screen 2 of 8 — Q1 · Timeline, DESIGN_SYSTEM.md §7.
 *
 * The question runs full width and uses `displayMD` because the artwork is a
 * band below it rather than a square beside it. That is also why the header
 * takes `arch.shallow` — a deeper curve would clip the branch's detail.
 */
export default function Q1TimelineScreen() {
  const [selected, setSelected] = useState<number | null>(() => readAnswer('timeline') ?? null);

  const choose = (index: number) => {
    setSelected(index);
    saveAnswer('timeline', index);
  };

  useStatusBarStyle('light');

  const onBack = () => {
    // Back is always available; a cold deep link has no history to pop.
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/welcome');
    }
  };

  const onContinue = () => {
    router.push('/q2');
  };

  return (
    <View style={styles.screen}>
      <ArchHeader
        backgroundColor={artColor.headerBrick}
        depth="shallow"
        height={screen.quizHeaderHeight}
        halftone="cream"
        paddingBottom={0}
        style={styles.header}
      >
        {/* Anchored to the block's base rather than flowed after the text: the
            header is a fixed height now, so a flowed band would leave a strip of
            brick beneath it. */}
        <Image
          source={timelineBranch}
          style={styles.band}
          contentFit="cover"
          contentPosition={{ left: '50%', top: '78%' }}
          accessibilityLabel="A branch in four stages, bare twig to full bloom, along a measured line"
        />

        <View style={styles.headerContent}>
          <View style={styles.controls}>
            <BackButton onPress={onBack} />
            <ProgressSegments current={1} tone="onDark" />
          </View>

          <View style={styles.afterControls} />
          <EyebrowPill label="Question 1 of 6" variant="outlined" />

          <View style={styles.afterEyebrow} />
          <Text style={[type.displayMD, styles.question]}>
            When did you first notice something was{' '}
            <Text style={accent(color.mustard)}>different?</Text>
          </Text>

          <View style={styles.afterQuestion} />
          <Text style={[type.body, styles.support]}>There’s no wrong answer.</Text>
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
    color: text.onDark,
    maxWidth: screen.bandQuestionMaxWidth,
  },
  afterQuestion: {
    height: space.sm,
  },
  support: {
    color: text.onDarkMuted,
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
  /**
   * No minimum. §7 specifies a plain flex spacer for the quiz screens, and a
   * floor here over-constrains the column: when the cards run tall the spacer
   * refuses to shrink and the CTA's 30px bottom inset — a §4 global rule — is
   * what gives way instead.
   */
  spacer: {
    flex: 1,
  },
});
