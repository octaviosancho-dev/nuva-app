import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  AudioWaveform,
  CalendarClock,
  CircleQuestionMark,
  Droplet,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

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
import { readAnswer, saveAnswer } from '@/lib/storage/onboarding';

const cycleMoons = require<ImageSourcePropType>('@/assets/illustrations/cycle-moons.jpg');

/**
 * Four answers, each with a sub-label. The fourth is deliberately generous —
 * hormonal contraception makes the cycle unreadable, and she should not be left
 * feeling the question wasn't for her.
 */
const options: { label: string; subLabel: string; icon: LucideIcon }[] = [
  {
    label: 'Still regular, but something feels off',
    subLabel: 'Cycle changing in length or flow',
    icon: Droplet,
  },
  {
    label: 'Getting irregular — skipping or unpredictable',
    subLabel: 'More than 7 days variation',
    icon: AudioWaveform,
  },
  {
    label: 'Haven’t had a period in a few months',
    subLabel: 'But not 12 months yet',
    icon: CalendarClock,
  },
  {
    label: 'I’m not sure / I have an IUD',
    subLabel: 'Or other hormonal contraception — we’ll still help you track',
    icon: CircleQuestionMark,
  },
];

/**
 * Onboarding screen 4 of 8 — Q3 · Periods, DESIGN_SYSTEM.md §7.
 *
 * The sage header is the palette's breath: three saturated dark screens in a row
 * would be exhausting. Everything inverts to ink on light — progress, eyebrow,
 * headline, halftone and the status bar.
 */
export default function Q3PeriodsScreen() {
  const [selected, setSelected] = useState<number | null>(() => readAnswer('periods') ?? null);

  const choose = (index: number) => {
    setSelected(index);
    saveAnswer('periods', index);
  };

  useStatusBarStyle('dark');

  const onBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/q2');
    }
  };

  const onContinue = () => {
    router.push('/q4');
  };

  return (
    <View style={styles.screen}>
      <ArchHeader
        backgroundColor={artColor.headerSage}
        depth="standard"
        height={screen.quizHeaderHeight}
        halftone="ink"
        paddingBottom={0}
        style={styles.header}
      >
        <Image
          source={cycleMoons}
          style={styles.art}
          contentFit="cover"
          accessibilityLabel="A ring of moon phases, unevenly spaced with one gap, a drop at the centre"
        />

        <View style={styles.headerContent}>
          <View style={styles.controls}>
            <BackButton onPress={onBack} />
            <ProgressSegments current={3} tone="onLight" />
          </View>

          <View style={styles.afterControls} />
          <EyebrowPill label="Question 3 of 6" variant="solid" />

          <View style={styles.afterEyebrow} />
          <View style={styles.besideArt}>
            <Text style={[type.displayLG, styles.question]}>
              How are your periods <Text style={accent(color.plum)}>right now?</Text>
            </Text>

            <View style={styles.afterQuestion} />
            <Text style={[type.body, styles.support]}>
              This tells us where you are in the journey.
            </Text>
          </View>
        </View>
      </ArchHeader>

      <View style={styles.body}>
        {/* Only these scroll. Four cards carrying sub-labels wrap to three lines
            at 375 and overflow the screen by 26px; the CTA stays pinned so it
            keeps its 30px inset and never leaves the viewport. At 393 there is
            nothing to scroll and the layout is identical to §7. */}
        <ScrollView
          style={styles.optionScroll}
          contentContainerStyle={styles.optionScrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {options.map((option, index) => (
            <OptionCard
              key={option.label}
              label={option.label}
              subLabel={option.subLabel}
              icon={option.icon}
              index={index}
              selected={selected === index}
              onPress={() => choose(index)}
            />
          ))}
        </ScrollView>

        <View style={styles.ctaGutter}>
          <PrimaryButton label="Continue" onPress={onContinue} disabled={selected === null} />
        </View>
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
    // See Q2: the block stays unpadded so the absolutely placed art means the
    // same thing on React Native and on the web renderer.
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  headerContent: {
    paddingTop: layout.headerTopInset,
    paddingHorizontal: layout.gutter,
    paddingBottom: layout.headerGap,
  },
  art: {
    position: 'absolute',
    right: screen.q3.artRight,
    top: screen.quizEyebrowTop,
    width: screen.q3.artSize,
    height: screen.q3.artSize,
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
      screen.q3.artRight + screen.q3.artSize + screen.q3.artClearance - layout.gutter,
  },
  question: {
    // `displayLG` already defaults to ink — the sage header needs no override.
    maxWidth: screen.q3.questionMaxWidth,
  },
  afterQuestion: {
    height: space.md,
  },
  support: {
    color: text.onLightMuted,
    maxWidth: screen.q3.supportMaxWidth,
  },
  body: {
    flex: 1,
    /**
     * Tighter than §7's 30. The fixed header plus four sub-labelled cards (378)
     * plus the CTA and its inset leaves 30px to split above and below the list;
     * this keeps every card visible at 393 with no scroll and still leaves a
     * gap before the button. The arch dips into this space, so the cream showing
     * at the block's sides is far wider than the number suggests.
     */
    paddingTop: space.xl,
    paddingBottom: layout.screenBottom,
  },
  /**
   * The gutter lives on the scroller's CONTENT, not on the scroller. A ScrollView
   * clips to its bounds on iOS, so a card exactly as wide as the scroller loses
   * the right half of its 5pt offset shadow when selected. Full-width scroller,
   * padded content, shadow intact.
   */
  ctaGutter: {
    paddingHorizontal: layout.gutter,
  },
  optionScroll: {
    flex: 1,
  },
  optionScrollContent: {
    // flexGrow keeps the cards at the top and the CTA at the bottom when there
    // is slack, which is what §7's flex spacer does at 393.
    flexGrow: 1,
    gap: space.lg,
    paddingHorizontal: layout.gutter,
    paddingBottom: space.sm,
  },
});
