import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';

import {
  BackButton,
  Button,
  CrestHeader,
  EyebrowPill,
  GrainOverlay,
  ProgressTrail,
  useEntrance,
} from '@/components/ui';
import { color, space, type as typeStyles, type ColorToken } from '@/constants/tokens';
import { useTheme } from '@/lib/theme';

export interface QuestionScreenProps {
  /** 1–6. Drives the eyebrow, the trail and the back control's visibility. */
  step: number;
  /**
   * The crest's shoulder height, taken from the screen's own artboard. It
   * varies per question because the headline runs to a different number of
   * lines — the header sizes to its content rather than to a shared constant.
   */
  headerHeight: number;
  /** The headline, with its line breaks exactly as the artboard sets them. */
  title: ReactNode;
  /**
   * The header fill. `night` for Q1–Q3; the later questions move to `luna`,
   * which lifts the mood as she nears the magic moment.
   */
  fill?: ColorToken;
  onDark?: boolean;
  /** The answer controls. */
  children: ReactNode;
  /** A quiet line above the CTA — Q2's selection count, for instance. */
  footnote?: string;
  ctaLabel?: string;
  ctaDisabled?: boolean;
  onContinue: () => void;
}

/**
 * The shared skeleton for Q1–Q6, from `design/screens/Q*.dc.html`.
 *
 * Every question is a `standard` crest carrying the nav row, the eyebrow and
 * the headline, then a body of answers with the CTA pinned to the bottom. The
 * crest is the one element that stays put between screens — its colour
 * cross-fades and its depth animates, but it does not slide — which is what
 * makes the six questions read as one continuous surface rather than six pages.
 */
export function QuestionScreen({
  step,
  headerHeight,
  title,
  fill = 'night',
  onDark = true,
  children,
  footnote,
  ctaLabel = 'Continue',
  ctaDisabled = false,
  onContinue,
}: QuestionScreenProps) {
  const { c } = useTheme();

  /**
   * Header content colour follows the **fill**, not the theme.
   *
   * `night` and `night-deep` do shift between themes, so their text comes from
   * the resolved set. `luna` does not — it is a brand fill and holds the same
   * green in light and dark, so its text has to hold the same ink. Reading
   * `textPrimary` here instead puts near-white on green in dark mode, which is
   * the exact failure the palette's fixed `on-*` partners exist to prevent.
   */
  const ink = onDark
    ? { text: c.textOnNight, muted: c.textOnNightMuted }
    : { text: color.light.onLuna, muted: 'rgba(31,27,46,0.7)' };

  const eyebrow = useEntrance(0);
  const headline = useEntrance(2);
  const cta = useEntrance(6);
  const note = useEntrance(8);

  const onBack = () => {
    // A cold deep link has no history to pop, so back still has to go
    // somewhere — never trap her on a question.
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/welcome');
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: c.canvas }]}>
      <CrestHeader depth="standard" height={headerHeight} fill={fill} onDark={onDark} bare>
        <View style={styles.headerInner}>
          <View style={styles.nav}>
            {/*
              Q1 has no back destination inside onboarding, so the control is
              hidden but its 36px box stays. Removing it outright shifts the
              trail and the header visibly jumps between Q1 and Q2.
            */}
            <BackButton onPress={onBack} onDark={onDark} hidden={step === 1} />
            <ProgressTrail
              current={step}
              total={6}
              onDark={onDark}
              fill={ink.text}
              countColor={ink.muted}
            />
          </View>

          <Animated.View style={eyebrow}>
            <EyebrowPill
              label={`Question ${step} of 6`}
              variant={onDark ? 'onNight' : 'onLightFill'}
            />
          </Animated.View>

          <Animated.View style={headline}>
            <Text
              style={[
                typeStyles.displayLG,
                styles.title,
                { color: ink.text },
              ]}
            >
              {title}
            </Text>
          </Animated.View>
        </View>
      </CrestHeader>

      <View style={styles.body}>
        {children}

        {/* `min-height: 20px` in the artboards: the spacer may shrink, but never
            to nothing, or the answers touch the CTA at 375px. */}
        <View style={styles.spacer} />

        {footnote ? (
          <Animated.View style={note}>
            <Text style={[typeStyles.caption, styles.footnote, { color: c.textTertiary }]}>
              {footnote}
            </Text>
          </Animated.View>
        ) : null}

        <Animated.View style={cta}>
          <Button label={ctaLabel} disabled={ctaDisabled} onPress={onContinue} />
        </Animated.View>
      </View>

      <GrainOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  headerInner: {
    flex: 1,
    paddingTop: 58,
    paddingHorizontal: space.space6,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.space3,
    marginBottom: space.space4,
  },
  title: {
    marginTop: space.space3,
  },
  body: {
    flex: 1,
    paddingTop: 28,
    paddingHorizontal: space.space6,
    paddingBottom: space.space6,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
  },
  footnote: {
    marginBottom: 14,
  },
});
