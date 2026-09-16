import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  Activity,
  BatteryLow,
  Calendar,
  CircleAlert,
  Cloud,
  HeartOff,
  HeartPulse,
  Moon,
  MoonStar,
  Repeat,
  Thermometer,
  Zap,
  type LucideIcon,
} from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import {
  ArchHeader,
  BackButton,
  EyebrowPill,
  GrainOverlay,
  PrimaryButton,
  ProgressSegments,
  SymptomChip,
  useStatusBarStyle,
} from '@/components/ui';
import { artColor, color, layout, screen, size, space, text } from '@/constants/tokens';
import { accent, type } from '@/constants/typography';

const bodySignals = require<ImageSourcePropType>('@/assets/illustrations/body-signals.jpg');

/**
 * The twelve most-reported entry symptoms — not the tracker's full 34. What she
 * picks here seeds the home screen's prioritisation. Icons are fixed by §9;
 * users learn them, so they are never re-picked.
 */
const symptoms: { label: string; icon: LucideIcon }[] = [
  { label: 'Hot flashes', icon: Thermometer },
  { label: 'Night sweats', icon: Moon },
  { label: 'Brain fog', icon: Cloud },
  { label: 'Anxiety', icon: Activity },
  { label: 'Mood swings', icon: Repeat },
  { label: 'Sleep problems', icon: MoonStar },
  { label: 'Irregular periods', icon: Calendar },
  { label: 'Fatigue', icon: BatteryLow },
  { label: 'Joint pain', icon: Zap },
  { label: 'Low libido', icon: HeartOff },
  { label: 'Heart palpitations', icon: HeartPulse },
  { label: 'Headaches', icon: CircleAlert },
];

/**
 * Onboarding screen 3 of 8 — Q2 · Symptoms, DESIGN_SYSTEM.md §7.
 *
 * The art floats at the right rather than forming a band, so the header takes
 * `arch.standard` and the question narrows to 198 to clear it.
 *
 * The header block itself carries no padding: the illustration is absolutely
 * placed against the block's own edges, and React Native and the web renderer
 * disagree about whether a parent's padding offsets an absolute child. Padding
 * lives on the inner content view instead, which makes `right`/`top` mean the
 * same thing everywhere.
 */
export default function Q2SymptomsScreen() {
  const [picked, setPicked] = useState<readonly number[]>([]);

  useStatusBarStyle('light');

  const toggle = (index: number) => {
    setPicked((current) =>
      current.includes(index) ? current.filter((i) => i !== index) : [...current, index],
    );
  };

  const onBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/q1');
    }
  };

  const onContinue = () => {
    router.push('/q3');
  };

  return (
    <View style={styles.screen}>
      <ArchHeader
        backgroundColor={artColor.headerPlum}
        depth="standard"
        height={screen.quizHeaderHeight}
        halftone="cream"
        paddingBottom={0}
        style={styles.header}
      >
        <Image
          source={bodySignals}
          style={styles.art}
          contentFit="cover"
          accessibilityLabel="A body giving off heat, fog, pulse and spiral signals"
        />

        <View style={styles.headerContent}>
          <View style={styles.controls}>
            <BackButton onPress={onBack} />
            <ProgressSegments current={2} tone="onDark" />
          </View>

          <View style={styles.afterControls} />
          <EyebrowPill label="Question 2 of 6" variant="outlined" />

          <View style={styles.afterEyebrow} />
          {/* Bounded by the art's left edge, not by a fixed width: the art is
              anchored to the right, so on a 375 screen it moves 18px inward and
              a flat maxWidth would let the question run under it. */}
          <View style={styles.besideArt}>
            <Text style={[type.displayLG, styles.question]}>
              Which symptoms hit you <Text style={accent(color.mustard)}>hardest?</Text>
            </Text>

            <View style={styles.afterQuestion} />
            <Text style={[type.body, styles.support]}>
              Select all that apply. We’ll track these from day one.
            </Text>
          </View>
        </View>
      </ArchHeader>

      <View style={styles.body}>
        <View style={styles.grid}>
          {symptoms.map((symptom, index) => (
            <SymptomChip
              key={symptom.label}
              label={symptom.label}
              icon={symptom.icon}
              index={index}
              selected={picked.includes(index)}
              onPress={() => toggle(index)}
              style={styles.chip}
            />
          ))}
        </View>

        <View style={styles.spacer} />

        <PrimaryButton
          label={picked.length > 0 ? `Continue (${picked.length})` : 'Continue'}
          onPress={onContinue}
          disabled={picked.length === 0}
        />
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
    paddingBottom: layout.headerGap,
  },
  art: {
    position: 'absolute',
    right: screen.q2.artRight,
    top: screen.quizEyebrowTop,
    width: screen.q2.artSize,
    height: screen.q2.artSize,
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
    // The art's left edge sits `artRight + artSize` from the block's right edge;
    // the gutter is already applied by the content view, so only the remainder
    // plus the clearance is needed here. 142 at every screen width.
    paddingRight:
      screen.q2.artRight + screen.q2.artSize + screen.q2.artClearance - layout.gutter,
  },
  question: {
    color: text.onDark,
    maxWidth: screen.q2.questionMaxWidth,
  },
  afterQuestion: {
    height: space.md,
  },
  support: {
    color: text.onDarkMuted,
    maxWidth: screen.q2.supportMaxWidth,
  },
  body: {
    flex: 1,
    paddingTop: space['6xl'],
    paddingHorizontal: layout.gutter,
    paddingBottom: layout.screenBottom,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: size.chipGridGap,
  },
  /**
   * Exact halves without measuring anything. A 40% basis is too wide for three
   * per row and narrow enough for two, so the row always breaks after the second
   * chip, and `flexGrow` then splits the remainder evenly — (row − gap) / 2 at
   * any width. Depends on the count staying even; §7 fixes it at twelve.
   */
  chip: {
    flexGrow: 1,
    flexBasis: '40%',
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
