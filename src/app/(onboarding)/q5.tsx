import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ChartLine, FileText, Lightbulb, ShieldCheck, type LucideIcon } from 'lucide-react-native';
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
import { artColor, color, layout, screen, space, text } from '@/constants/tokens';
import { accent, type } from '@/constants/typography';

const outcomeCards = require<ImageSourcePropType>('@/assets/illustrations/outcome-cards.jpg');

/**
 * The first three are the product's own mechanism — understand, track, show
 * (PRODUCT_BRIEF.md §2) — and they match the three cards in the illustration:
 * a sparkle, a dot grid, a document.
 *
 * The fourth is the one that is not a feature. §1 says what she actually leaves
 * with is clarity and agency, and that nobody around her is talking about this;
 * being believed is a real answer to this question, so it is offered as one.
 */
const options: { label: string; icon: LucideIcon }[] = [
  { label: 'Understanding what’s happening', icon: Lightbulb },
  { label: 'Seeing my patterns over time', icon: ChartLine },
  { label: 'Something to show my doctor', icon: FileText },
  { label: 'Knowing I’m not imagining it', icon: ShieldCheck },
];

/**
 * Onboarding screen 6 of 8 — Q5 · What she wants from this.
 *
 * §7 has no mockup: it specifies Q5 follows Q3's shape on plum, with the art
 * floating at the right and `arch.standard`. Copy is written here — see the
 * note on `options`.
 */
export default function Q5OutcomeScreen() {
  const [selected, setSelected] = useState<number | null>(null);

  useStatusBarStyle('light');

  const onBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/q4');
    }
  };

  const onContinue = () => {
    router.push('/q6');
  };

  return (
    <View style={styles.screen}>
      <ArchHeader
        backgroundColor={artColor.headerPlumQ5}
        depth="standard"
        height={screen.quizHeaderHeight}
        halftone="cream"
        paddingBottom={0}
        style={styles.header}
      >
        <Image
          source={outcomeCards}
          style={styles.art}
          contentFit="cover"
          accessibilityLabel="Three cards fanned like a hand on a brick disc"
        />

        <View style={styles.headerContent}>
          <View style={styles.controls}>
            <BackButton onPress={onBack} />
            <ProgressSegments current={5} tone="onDark" />
          </View>

          <View style={styles.afterControls} />
          <EyebrowPill label="Question 5 of 6" variant="outlined" />

          <View style={styles.afterEyebrow} />
          {/* Bounded by the art's left edge — see Q2. */}
          <View style={styles.besideArt}>
            <Text style={[type.displayLG, styles.question]}>
              What do you want Nuva to{' '}
              <Text style={accent(color.mustard)}>help you with?</Text>
            </Text>

            <View style={styles.afterQuestion} />
            <Text style={[type.body, styles.support]}>Pick the one that matters most.</Text>
          </View>
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
              onPress={() => setSelected(index)}
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
    // Unpadded block so the absolutely placed art means the same thing on both
    // renderers — see Q2.
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  headerContent: {
    paddingTop: layout.headerTopInset,
    paddingHorizontal: layout.gutter,
  },
  art: {
    position: 'absolute',
    right: screen.q5.artRight,
    top: screen.quizEyebrowTop,
    width: screen.q5.artSize,
    height: screen.q5.artSize,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xl,
  },
  afterControls: {
    height: space['3xl'],
  },
  afterEyebrow: {
    height: space.xl,
  },
  besideArt: {
    paddingRight:
      screen.q5.artRight + screen.q5.artSize + screen.q5.artClearance - layout.gutter,
  },
  question: {
    color: text.onDark,
    maxWidth: screen.q5.questionMaxWidth,
  },
  afterQuestion: {
    height: space.md,
  },
  support: {
    color: text.onDarkMuted,
    maxWidth: screen.q5.supportMaxWidth,
  },
  body: {
    flex: 1,
    paddingTop: space['6xl'],
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
