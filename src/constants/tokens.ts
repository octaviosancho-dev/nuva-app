/**
 * Nuva design tokens.
 * Extracted from the approved onboarding mockups (direction C — "Bold Bloom").
 * Nothing in the app may define a color, radius, space or shadow outside this file.
 */

import { Platform, type ViewStyle } from 'react-native';

/* ------------------------------------------------------------------ palette */

export const color = {
  /** Warm near-black. Text, outlines, primary button, check badges. */
  ink: '#241A16',
  /** App background. Never pure white. */
  cream: '#FFF4E6',
  /** Cards and unselected chips sitting on cream. */
  paper: '#FFF9F0',

  /** Primary brand accent. Headline emphasis, CTA offset shadow. */
  brick: '#B5462A',
  /** Deepest tone. Header blocks, secondary emphasis on light headers. */
  plum: '#63283E',
  /** Highest-energy accent. Progress fill, CTA icon well, first option. */
  mustard: '#E3A32F',
  /** The cool note. Progress/growth, second option. */
  sage: '#7E9B78',
  /** Soft warm mid. Third option. */
  blush: '#E8927A',
  /** Lightest fill. Fourth option, "not sure" states. */
  tan: '#EBCBA4',
} as const;

/**
 * Header backgrounds that sit behind an illustration.
 *
 * Each value is sampled from the edge of its illustration file so the artwork
 * bleeds into the header with no visible seam. These are NOT design choices and
 * NOT interchangeable with `color` — if an illustration is regenerated, resample
 * its edge and update the matching value here.
 *
 * Q1/Q4 are both "brick", Q2/Q5 both "plum", Q3/Q6 both "sage", but each pair
 * differs by a few points because each image was generated separately. Use the
 * token that names the screen; sharing one value across a pair puts a visible
 * seam on one of them.
 */
export const artColor = {
  /** behind hero-profile.jpg — onboarding welcome */
  heroPlum: '#582437',
  /** behind timeline-branch.jpg — question 1 */
  headerBrick: '#AD3C22',
  /** behind body-signals.jpg — question 2 */
  headerPlum: '#5D293F',
  /** behind cycle-moons.jpg — question 3 */
  headerSage: '#7B9571',
  /** behind doctor-gap.jpg — question 4 */
  headerBrickQ4: '#AA3B24',
  /** behind outcome-cards.jpg — question 5 */
  headerPlumQ5: '#59253B',
  /** behind day-arc.jpg — question 6 */
  headerSageQ6: '#7E9875',
  /** behind bloom-full.jpg — magic moment */
  magicPlum: '#54273A',
} as const;

/* --------------------------------------------------------------------- text */

export const text = {
  /** Body and headlines on cream or on a light-filled surface. */
  primary: color.ink,
  /** Supporting copy on cream. */
  secondary: '#5C4A42',
  /** Captions, inactive tabs, the "I already have an account" link. */
  tertiary: '#8A6E5E',

  /** Everything on plum and brick headers. */
  onDark: color.cream,
  /** Supporting copy on plum and brick headers. */
  onDarkMuted: 'rgba(255, 244, 230, 0.72)',

  /** Supporting copy on the sage header. */
  onLightMuted: 'rgba(36, 26, 22, 0.66)',
  /** Sub-labels inside a color-filled option card. */
  onFillMuted: 'rgba(36, 26, 22, 0.62)',
} as const;

/* -------------------------------------------------------------------- lines */

export const line = {
  /** Chip and selected-card outline. */
  ink: color.ink,
  /** Eyebrow pill outline on a dark header. */
  onDark: 'rgba(255, 244, 230, 0.55)',
  /** Unfilled progress segment on a dark header. */
  trackOnDark: 'rgba(255, 244, 230, 0.28)',
  /** Unfilled progress segment on the sage header. */
  trackOnLight: 'rgba(36, 26, 22, 0.22)',
} as const;

export const borderWidth = {
  /** Chip outline. */
  chip: 2,
  /** Option card outline — reserved as transparent when unselected so the card never reflows. */
  card: 2.5,
  /** Eyebrow pill outline. */
  hairline: 1.5,
} as const;

/* ------------------------------------------------------------------ spacing */

/** Base unit 2px. Only these values appear in layouts. */
export const space = {
  xxs: 3,
  xs: 6,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  '2xl': 18,
  '3xl': 22,
  '4xl': 26,
  '5xl': 30,
  '6xl': 34,
  '7xl': 40,
} as const;

export const layout = {
  /** Horizontal gutter on every screen. */
  gutter: 26,
  /** Top inset inside a header block, measured from the top of the screen. */
  headerTopInset: 62,
  /** Gap between a header block and the content below it. */
  headerGap: 30,
  /** Bottom inset below the primary button. */
  screenBottom: 30,
  /** Minimum touch target, enforced everywhere. */
  minTarget: 44,
  /** Base artboard the mockups were drawn at (iPhone 15 Pro). */
  baseWidth: 393,
  baseHeight: 852,
} as const;

/* ------------------------------------------------------------------- radius */

export const radius = {
  /** Icon square inside a symptom chip. */
  xs: 9,
  /** Back button, CTA icon well. */
  sm: 14,
  /** Symptom chip. */
  md: 16,
  /** Primary and secondary buttons. */
  lg: 20,
  /** Option cards. */
  xl: 22,
  /** Pills: eyebrow, progress segments, icon circles, badges. */
  pill: 100,
} as const;

/**
 * Header arch depth — the curved bottom edge, as a fraction of header height.
 * Drawn with react-native-svg; `borderRadius` cannot express an elliptical arch.
 * See `ArchHeader` in docs/DESIGN_SYSTEM.md.
 */
export const arch = {
  /** Welcome hero. Deepest curve — the header is tall and the art is centred. */
  hero: 0.15,
  /** Standard quiz header. */
  standard: 0.11,
  /** Quiz header whose base is a full-bleed illustration band; a shallow curve
   *  keeps the artwork's own edge details from being clipped at the sides. */
  shallow: 0.06,
} as const;

/* ------------------------------------------------------------------ shadows */

/**
 * Hard offset shadows. Never blurred — `shadowRadius` is always 0.
 *
 * iOS reproduces these exactly. Android's `elevation` cannot express a colored,
 * un-blurred offset: on Android render a second absolutely-positioned View of the
 * shadow color, offset by the same amount, behind the element. Nuva ships iOS-first,
 * so the fallback is only needed if Android is added.
 */
const hardShadow = (offset: number, shadowColor: string): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor,
      shadowOffset: { width: offset, height: offset },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
    default: {},
  })!;

/**
 * Throw distance of each hard shadow, in dp. Shared by the iOS shadow props
 * above and by the fallback layer everywhere else, so the two can never drift.
 */
export const shadowOffset = {
  card: 5,
  chip: 3,
  cta: 5,
} as const;

/** Colour of each hard shadow, paired with `shadowOffset`. */
export const shadowColor = {
  card: color.ink,
  chip: color.ink,
  cta: color.brick,
} as const;

/**
 * Whether the platform draws `shadow.*` itself.
 *
 * Only iOS does. Everywhere else `shadow.*` resolves to an empty object and the
 * offset has to be drawn by hand — see `HardShadowLayer`. Without it the
 * selected card, the selected chip and the primary button all lose the hard
 * offset, which is the most distinctive thing in the whole direction.
 */
export const hasNativeShadow = Platform.OS === 'ios';

export const shadow = {
  /** Selected option card. */
  card: hardShadow(shadowOffset.card, shadowColor.card),
  /** Selected symptom chip — smaller element, shorter throw. */
  chip: hardShadow(shadowOffset.chip, shadowColor.chip),
  /** Enabled primary button. Brick, not ink, so the button reads as brand. */
  cta: hardShadow(shadowOffset.cta, shadowColor.cta),
  /** Disabled primary button carries no shadow at all. */
  none: {} as ViewStyle,
} as const;

/* ------------------------------------------------------------------ opacity */

export const opacity = {
  /** Disabled primary button. */
  disabled: 0.4,
  /** Halftone dot texture over a dark header. */
  halftoneOnDark: 0.14,
  /** Halftone dot texture over the sage header. */
  halftoneOnLight: 0.13,
  /** Grain overlay on every screen. */
  grain: 0.06,
} as const;

/* ------------------------------------------------------------------- motion */

/**
 * Reanimated. Every transform-based entrance must collapse to an opacity-only
 * fade of the same duration when `useReducedMotion()` is true.
 */
export const motion = {
  duration: {
    /** Border and background color swaps on selection. */
    select: 160,
    /** Progress bar fill. */
    progress: 320,
    /** Element entrance. */
    enter: 360,
    /** Screen transition. */
    screen: 280,
  },
  /** Stagger between sequential entrances. Never stagger more than 3 elements. */
  stagger: 90,
  /** Entrance offset, in px, before settling to 0. */
  enterOffsetY: 14,
  /** Press feedback. */
  press: { scale: 0.98, damping: 18, stiffness: 320 },
  /** Screen push. */
  screenSpring: { damping: 20, stiffness: 180, mass: 0.9 },
} as const;

/* -------------------------------------------------------------------- icons */

/** Lucide, outline only. Never filled, never a solid variant. */
export const icon = {
  /** Inside a symptom chip's icon square. */
  chip: { size: 16, strokeWidth: 2 },
  /** Inside an option card's icon circle. */
  option: { size: 20, strokeWidth: 2 },
  /** Back chevron, CTA arrow. */
  control: { size: 20, strokeWidth: 2.3 },
  /** Check glyph inside a selection badge. */
  check: { size: 15, strokeWidth: 3.2 },
} as const;

/* ---------------------------------------------------------- component sizes */

export const size = {
  backButton: 44,
  /** Icon well inside the primary button. */
  ctaIcon: 48,
  ctaHeight: 62,
  /** The welcome screen's CTA is 2px taller — it is the only one on the screen. */
  ctaHeightHero: 64,
  /** Icon circle inside an option card. */
  optionIcon: 42,
  /** Icon circle inside a taller option card that carries a sub-label. */
  optionIconLarge: 44,
  optionMinHeight: 74,
  optionMinHeightWithSubLabel: 84,
  /** Option card interior, single-line variant. */
  optionPaddingVertical: 11,
  optionPaddingHorizontal: 15,
  optionGap: 13,
  /** Option card interior when the card carries a sub-label — taller, roomier. */
  optionPaddingVerticalWithSubLabel: 12,
  optionPaddingHorizontalWithSubLabel: 16,
  optionGapWithSubLabel: 14,
  /** Icon square inside a symptom chip. */
  chipIcon: 30,
  chipMinHeight: 52,
  /** Row and column gap of the 2-column symptom grid. Tightest case at 375px. */
  chipGridGap: 9,
  /** Selection badge. */
  badge: 26,
  /** Full-bleed illustration band forming a header's base (Q1, Q4, Q6). */
  illustrationBand: 100,
  eyebrowHeight: 26,
  /** The welcome screen's audience badge — a touch larger than an eyebrow pill. */
  audienceBadgeHeight: 28,
  audienceBadgePaddingHorizontal: 13,
  progressSegmentHeight: 9,
  progressSegmentGap: 6,
} as const;

/**
 * Per-screen measurements from DESIGN_SYSTEM.md §7, taken at 393×852.
 *
 * These are one screen's layout, not reusable scale values: a new screen adds
 * its own group rather than reaching into another's. Anything that turns out to
 * repeat across screens belongs in `space`, `layout` or `size` instead.
 */
export const screen = {
  /**
   * y of the eyebrow pill inside a quiz header: top inset, the back-button row,
   * the gap. A floating illustration aligns its top edge to this, so the art
   * starts level with "Question n of 6".
   *
   * §7's measured values (Q2 110, Q3 108) sit a little above the pill; aligning
   * to it exactly is the call made here.
   */
  quizEyebrowTop: layout.headerTopInset + size.backButton + space['3xl'],

  /**
   * One fixed height for every quiz header, Q1 through Q6.
   *
   * Content-sized headers drift: the block ends up as tall as whatever the
   * question happens to wrap to, so the coloured container is a different height
   * on every screen. Pinning it keeps the arch landing in the same place all the
   * way through the quiz.
   *
   * Bounded below by Q1's band variant, whose text runs to 245 before a 100px
   * illustration band anchored at the base — so the block cannot go under ~345
   * without the band riding up over the supporting line.
   *
   * Bounded above by Q2, the fullest screen: twelve chips in six rows are 357
   * tall, and at 364 they ended five pixels short of the CTA. 352 leaves that
   * screen a breathable gap and still clears both floating illustrations by
   * more than 17px.
   */
  quizHeaderHeight: 352,

  /**
   * Question measure on the band-layout screens — Q1, Q4, Q6. The art sits below
   * the text rather than beside it, so the line runs wide and uses displayMD.
   */
  bandQuestionMaxWidth: 312,
  welcome: {
    /** The only fixed-height header in the app; every other one sizes to content. */
    headerHeight: 452,
    wordmarkTop: 54,
    badgeTop: 56,
    /** Caps the lead paragraph at roughly 36 characters a line. */
    leadMaxWidth: 292,
  },

  q2: {
    /** Both measures clear the floating illustration by ≥4px — see §6. */
    questionMaxWidth: 198,
    supportMaxWidth: 200,
    artSize: 162,
    artRight: 2,
    /** §6's minimum gap between question text and a floating illustration. */
    artClearance: 4,
  },
  q3: {
    questionMaxWidth: 194,
    supportMaxWidth: 194,
    artSize: 168,
    artRight: 0,
    artClearance: 4,
  },
  magicMoment: {
    /**
     * bloom-full.jpg is 1179×1579. The art bleeds to both edges and is anchored
     * to the screen's lower half, so its height follows from the screen width.
     */
    artAspectRatio: 1179 / 1579,
  },
  q5: {
    /** Same floating-square geometry as Q2 — §6 lists 198 as a measure that works. */
    questionMaxWidth: 198,
    supportMaxWidth: 200,
    artSize: 162,
    artRight: 2,
    artClearance: 4,
  },
} as const;

/**
 * Option fills, in the order they appear down a list.
 * Cycle this array — never pick a fill ad hoc.
 */
export const optionFills = [color.mustard, color.sage, color.blush, color.tan] as const;

/**
 * Symptom chip tones, cycled across the grid in reading order.
 * Same four hues as `optionFills`; ink text is legible on all of them.
 */
export const chipTones = [color.mustard, color.sage, color.blush, color.tan] as const;
