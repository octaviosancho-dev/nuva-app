/**
 * Shared geometry, maps and motion constants.
 *
 * Ported from the design system's own bundle (design/components/bundle.js),
 * which is the source of truth for all of it. Port it; don't re-derive it.
 */

/* ------------------------------------------------------------------ the crest
 * The soft convex curve at the bottom of every screen header. The sides sit at
 * `h`; the centre dips `bulge` px lower. A quadratic control point at twice the
 * bulge puts the curve's midpoint exactly at h + bulge.
 *
 * The SVG's height must be h + bulge or the curve clips at the bottom.
 * borderRadius cannot produce this — always react-native-svg.
 */
export const CREST = { hero: 30, standard: 22, subtle: 13 } as const;
export type CrestDepth = keyof typeof CREST;

export function crestPath(w: number, h: number, depth: CrestDepth | number): string {
  const bulge = typeof depth === 'number' ? depth : CREST[depth];
  return `M 0 0 H ${w} V ${h} Q ${w / 2} ${h + 2 * bulge} 0 ${h} Z`;
}

/* -------------------------------------------------------------- categories
 * `token` is the colour token, `on` the text token legible on it. The order is
 * the tracker's order. The mapping is fixed: she learns it in Q2 and uses it
 * daily, so re-picking a colour or an icon costs her that recognition.
 */
export const CATEGORIES = [
  { slug: 'temperature', label: 'Temperature', token: 'catTemperature', on: 'onClay', icon: 'thermometer' },
  { slug: 'mood', label: 'Mood', token: 'catMood', on: 'onBlush', icon: 'waves' },
  { slug: 'cognitive', label: 'Cognitive', token: 'catCognitive', on: 'onIris', icon: 'cloud' },
  { slug: 'sleep', label: 'Sleep', token: 'catSleep', on: 'onTide', icon: 'moon' },
  { slug: 'physical', label: 'Physical', token: 'catPhysical', on: 'onLuna', icon: 'activity' },
  { slug: 'cycle', label: 'Cycle', token: 'catCycle', on: 'onPlum', icon: 'circle-dashed' },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

export const category = (slug: string) => CATEGORIES.find((c) => c.slug === slug) ?? null;

/**
 * A token colour at a given opacity: `alpha(color.light.textOnNight, 0.16)`.
 *
 * The artboards draw washes on night grounds (the 36px icon buttons, the
 * selected-day fill, chip scrims) as a token at an opacity. This keeps the
 * colour coming from the token and only the opacity from the artboard, so no
 * component carries a literal colour. Accepts `#rrggbb`.
 */
export function alpha(hex: string, opacity: number): string {
  const n = parseInt(hex.replace('#', ''), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${opacity})`;
}

/* ----------------------------------------------------------------- severity
 * Four levels. The label is not decoration: colour alone must never carry
 * severity, so every severity control renders the word and the filled dots.
 */
export const SEVERITY = [
  { value: 1, label: 'Mild', token: 'severity1' },
  { value: 2, label: 'Moderate', token: 'severity2' },
  { value: 3, label: 'Strong', token: 'severity3' },
  { value: 4, label: 'Severe', token: 'severity4' },
] as const;

/* -------------------------------------------------------------------- icons
 * Lucide names, outline only. Fixed — see the note on CATEGORIES.
 */
export const SYMPTOM_ICONS: Record<string, string> = {
  'hot-flashes': 'thermometer', 'night-sweats': 'droplets', chills: 'snowflake',
  anxiety: 'waves', irritability: 'flame', 'low-mood': 'cloud-rain', rage: 'zap',
  'brain-fog': 'cloud', 'word-finding': 'message-circle-dashed', 'memory-lapses': 'brain',
  insomnia: 'moon', 'waking-3am': 'alarm-clock', 'unrefreshing-sleep': 'bed',
  'joint-pain': 'bone', palpitations: 'heart-pulse', headaches: 'circle-dot',
  fatigue: 'battery-low', 'weight-change': 'scale',
  'irregular-periods': 'calendar', flooding: 'droplet', spotting: 'circle-dashed',
  cramping: 'spiral',
  // The 12 that bring the catalogue to the brief's 34.
  'day-sweats': 'thermometer-sun', 'cold-flashes': 'thermometer-snowflake',
  'temperature-swings': 'sun-snow',
  panic: 'vibrate', 'loss-of-motivation': 'anchor',
  concentration: 'focus', 'misplacing-things': 'search-x',
  'restless-legs': 'footprints', 'vivid-dreams': 'cloud-moon',
  bloating: 'expand', dizziness: 'orbit',
  'breast-tenderness': 'hand-heart',
};

/* ------------------------------------------------------------------- motion
 * Durations in ms, easings as cubic-bezier control points for
 * Easing.bezier(...spread). Reanimated 4 on the UI thread; the legacy Animated
 * API is not used anywhere in this app.
 *
 * Every entry has a reduced-motion answer in design/motion.md. None of them is
 * "do nothing", and none removes the state change itself.
 */
export const MOTION = {
  duration: { instant: 90, quick: 160, base: 240, slow: 380, reveal: 560, ambient: 3200 },
  easing: {
    standard: [0.2, 0.8, 0.2, 1],
    exit: [0.4, 0, 1, 1],
    enter: [0, 0, 0.2, 1],
    breathe: [0.45, 0, 0.55, 1],
  },
  spring: {
    press: { damping: 18, stiffness: 320, mass: 0.7 },
    settle: { damping: 22, stiffness: 180, mass: 1 },
    bloom: { damping: 12, stiffness: 140, mass: 1.1 },
  },
  stagger: 44,
} as const;

/* -------------------------------------------------------------------- Vera */
export const VERA_POSES = ['neutral', 'attentive', 'celebrate', 'resting', 'reading'] as const;
export type VeraPose = (typeof VERA_POSES)[number];

/* ----------------------------------------------------------------- helpers */
/** Dash array and offset for drawing the progress trail as one stroked path. */
export function trailDash(total: number, current: number, length: number) {
  const filled = Math.max(0, Math.min(current, total)) / total;
  return { array: length, offset: length * (1 - filled) };
}
