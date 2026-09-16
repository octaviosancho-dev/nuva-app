/**
 * Nuva type system.
 *
 * Two families, no exceptions:
 *   Bricolage Grotesque — display. 800 for headlines, 600 for anything a finger touches.
 *   DM Sans            — body, supporting copy, eyebrows, sub-labels.
 *
 * Load both with @expo-google-fonts. Text never renders before fonts are ready —
 * gate the splash screen on `fontsLoaded`, since the fallback metrics differ enough
 * to visibly reflow the headlines.
 */

import { StyleSheet, type TextStyle } from 'react-native';
import { text } from './tokens';

export const fontFamily = {
  displayBold: 'BricolageGrotesque_800ExtraBold',
  displayMedium: 'BricolageGrotesque_600SemiBold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_600SemiBold',
} as const;

/**
 * React Native has no `line-height: 1.05` — line height is absolute px.
 * Every value below is already multiplied out from the mockup's ratio.
 */
export const type = StyleSheet.create({
  /* ---------------------------------------------------------------- display */

  /** Welcome headline. The largest type in the app; one screen uses it. */
  displayXL: {
    fontFamily: fontFamily.displayBold,
    fontSize: 43,
    lineHeight: 41,
    letterSpacing: -1.5,
    color: text.primary,
  },

  /** Quiz question, standard. Two or three lines beside an illustration. */
  displayLG: {
    fontFamily: fontFamily.displayBold,
    fontSize: 29,
    lineHeight: 30,
    letterSpacing: -1,
    color: text.primary,
  },

  /** Quiz question, full-width variant — used when the illustration sits below
   *  the text rather than beside it, so the line can run wider. */
  displayMD: {
    fontFamily: fontFamily.displayBold,
    fontSize: 26,
    lineHeight: 27,
    letterSpacing: -0.9,
    color: text.primary,
  },

  /** Section headings inside the app shell (Home, Insights, Report). */
  displaySM: {
    fontFamily: fontFamily.displayBold,
    fontSize: 22,
    lineHeight: 24,
    letterSpacing: -0.7,
    color: text.primary,
  },

  /* ------------------------------------------------------- touchable labels */

  /** Primary button on the welcome screen. */
  buttonLG: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: -0.36,
    color: text.onDark,
  },

  /** Primary button everywhere else. */
  button: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 17,
    lineHeight: 21,
    letterSpacing: -0.34,
    color: text.onDark,
  },

  /** Option card label, single-line list. */
  optionLabel: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 16.5,
    lineHeight: 21,
    letterSpacing: -0.33,
    color: text.primary,
  },

  /** Option card label when the card also carries a sub-label. */
  optionTitle: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
    lineHeight: 19,
    letterSpacing: -0.32,
    color: text.primary,
  },

  /** Symptom chip label. Wraps to two lines on the longest entries. */
  chipLabel: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 12.5,
    lineHeight: 15,
    letterSpacing: -0.19,
    color: text.primary,
  },

  /* ------------------------------------------------------------------ body */

  /** Lead paragraph under a headline. */
  bodyLG: {
    fontFamily: fontFamily.body,
    fontSize: 15.5,
    lineHeight: 24,
    color: text.secondary,
  },

  /** Supporting line under a quiz question. */
  body: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 21,
    color: text.secondary,
  },

  /** Sub-label inside an option card. */
  caption: {
    fontFamily: fontFamily.body,
    fontSize: 12,
    lineHeight: 17,
    color: text.onFillMuted,
  },

  /** The account link and other inline text actions. */
  link: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 13.5,
    lineHeight: 18,
    color: text.tertiary,
  },

  /* ---------------------------------------------------------------- eyebrow */

  /**
   * "Question 2 of 6", the audience badge, tab labels.
   * The only letter-spaced text in the app, and the only place DM Sans goes
   * semibold at a small size.
   */
  eyebrow: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 10.5,
    lineHeight: 14,
    letterSpacing: 0.63,
    color: text.onDark,
  },

  /** Wordmark. Never rendered as an image — it is type. */
  wordmark: {
    fontFamily: fontFamily.displayBold,
    fontSize: 25,
    lineHeight: 28,
    letterSpacing: -0.75,
    color: text.onDark,
  },
});

/**
 * Emphasis inside a headline: the last clause of every question is set in an
 * accent color while keeping the same weight and size. Never italic, never bold —
 * Bricolage at 800 is already the heaviest weight we use.
 *
 * Usage: <Text style={type.displayLG}>Which symptoms hit you <Text style={accent(color.mustard)}>hardest?</Text></Text>
 */
export const accent = (value: string): TextStyle => ({ color: value });
