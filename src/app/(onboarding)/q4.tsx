import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  MessageCircleHeart,
  MessageCircleOff,
  MessageCircleX,
  Pill,
  type LucideIcon,
} from 'lucide-react-native';
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

const doctorGap = require<ImageSourcePropType>('@/assets/illustrations/doctor-gap.jpg');

/**
 * The four answers are drawn from what PRODUCT_BRIEF.md §1 says actually happens
 * to her: told she is too young, or handed an SSRI without anyone checking her
 * hormones. Naming those outcomes plainly is the point of the question — it is
 * the first place the product shows it already knows how this usually goes.
 */
const options: { label: string; icon: LucideIcon }[] = [
  { label: 'Not yet', icon: MessageCircleOff },
  { label: 'Yes, and I was told I’m too young', icon: MessageCircleX },
  { label: 'Yes, and I was offered antidepressants', icon: Pill },
  { label: 'Yes, and it’s being taken seriously', icon: MessageCircleHeart },
];

/**
 * Onboarding screen 5 of 8 — Q4 · The doctor conversation.
 *
 * §7 has no mockup for this one: it specifies that Q4 follows Q1 exactly, on
 * brick, with the band layout and `arch.shallow`. The copy is written here
 * rather than lifted from a mockup — see the note on `options`.
 */
export default function Q4DoctorScreen() {
  const [selected, setSelected] = useState<number | null>(() => readAnswer('doctor') ?? null);

  const choose = (index: number) => {
    setSelected(index);
    saveAnswer('doctor', index);
  };

  useStatusBarStyle('light');

  const onBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/q3');
    }
  };

  const onContinue = () => {
    router.push('/q5');
  };

  return (
    <View style={styles.screen}>
      <ArchHeader
        backgroundColor={artColor.headerBrickQ4}
        depth="shallow"
        height={screen.quizHeaderHeight}
        halftone="cream"
        paddingBottom={0}
        style={styles.header}
      >
        {/* Anchored to the block's base — see Q1. */}
        {/* The source is 800×264 and the band is 393×100, so `cover` drops 60
            rows. Biasing the crop to the bottom keeps the whole frame — the top
            of the source is empty brick, while the dashed line and its leaf sit
            low enough that a centred crop leaves them in the arch's path. */}
        <Image
          source={doctorGap}
          style={styles.band}
          contentFit="cover"
          contentPosition={{ left: '50%', top: '100%' }}
          accessibilityLabel="A large speech bubble, a small one far away, and a dashed line broken by a gap"
        />

        <View style={styles.headerContent}>
          <View style={styles.controls}>
            <BackButton onPress={onBack} />
            <ProgressSegments current={4} tone="onDark" />
          </View>

          <View style={styles.afterControls} />
          <EyebrowPill label="Question 4 of 6" variant="outlined" />

          <View style={styles.afterEyebrow} />
          <Text style={[type.displayMD, styles.question]}>
            Have you talked to a doctor{' '}
            <Text style={accent(color.mustard)}>about this?</Text>
          </Text>

          <View style={styles.afterQuestion} />
          <Text style={[type.body, styles.support]}>However it went, it helps to know.</Text>
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
  spacer: {
    flex: 1,
  },
});
