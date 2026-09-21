/* @ds-bundle: {"format":4,"namespace":"Nuva","components":[{"name":"Logo"},{"name":"Vera"},{"name":"CrestHeader"},{"name":"TabBar"},{"name":"Button"},{"name":"TextLink"},{"name":"OptionCard"},{"name":"SymptomChip"},{"name":"SeverityScale"},{"name":"ValidationCard"},{"name":"InsightCard"},{"name":"WordsCard"},{"name":"ProgressTrail"},{"name":"CalendarHeat"},{"name":"MedicationCard"}]} */
/*
 * Nuva design system — shared geometry, maps and motion constants.
 *
 * This bundle deliberately exports no UI components. The consuming app is React
 * Native, not React DOM, so a web component bundle would be dead weight there.
 * What IS shared between the previews here and the app is the maths and the
 * lookup tables, and those live below. Everything is framework-free.
 */
window.Nuva = (function () {
  'use strict';

  /* ---------------------------------------------------------------- geometry
   * The crest: the soft convex curve at the bottom of every screen header.
   * Sides sit at `h`; the centre dips `bulge` px lower. A quadratic control
   * point at 2x the bulge puts the curve's midpoint exactly at h + bulge.
   */
  var CREST = { hero: 30, standard: 22, subtle: 13 };

  function crestPath(w, h, bulge) {
    if (typeof bulge === 'string') bulge = CREST[bulge];
    return 'M 0 0 H ' + w + ' V ' + h +
           ' Q ' + (w / 2) + ' ' + (h + 2 * bulge) + ' 0 ' + h + ' Z';
  }

  /* ------------------------------------------------------------- categories
   * The six symptom categories from the tracker. `token` is the colour token,
   * `on` is the text token that is legible on it. Order is the tracker order.
   */
  var CATEGORIES = [
    { slug: 'temperature', label: 'Temperature', token: 'cat-temperature', on: 'on-clay',  icon: 'thermometer' },
    { slug: 'mood',        label: 'Mood',        token: 'cat-mood',        on: 'on-blush', icon: 'waves' },
    { slug: 'cognitive',   label: 'Cognitive',   token: 'cat-cognitive',   on: 'on-iris',  icon: 'cloud' },
    { slug: 'sleep',       label: 'Sleep',       token: 'cat-sleep',       on: 'on-tide',  icon: 'moon' },
    { slug: 'physical',    label: 'Physical',    token: 'cat-physical',    on: 'on-luna',  icon: 'activity' },
    { slug: 'cycle',       label: 'Cycle',       token: 'cat-cycle',       on: 'on-plum',  icon: 'circle-dashed' }
  ];

  function category(slug) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].slug === slug) return CATEGORIES[i];
    }
    return null;
  }

  /* --------------------------------------------------------------- severity
   * Four levels. `label` is not optional decoration — colour alone must never
   * carry severity, so every severity control renders the word and the dots.
   */
  var SEVERITY = [
    { value: 1, label: 'Mild',     token: 'severity-1' },
    { value: 2, label: 'Moderate', token: 'severity-2' },
    { value: 3, label: 'Strong',   token: 'severity-3' },
    { value: 4, label: 'Severe',   token: 'severity-4' }
  ];

  /* ------------------------------------------------------------------ icons
   * Lucide names, outline only. These are fixed: the person learns them across
   * onboarding Q2 and the daily tracker, so they must not be re-picked later.
   */
  var SYMPTOM_ICONS = {
    'hot-flashes': 'thermometer', 'night-sweats': 'droplets', 'chills': 'snowflake',
    'anxiety': 'waves', 'irritability': 'flame', 'low-mood': 'cloud-rain', 'rage': 'zap',
    'brain-fog': 'cloud', 'word-finding': 'message-circle-dashed', 'memory-lapses': 'brain',
    'insomnia': 'moon', 'waking-3am': 'alarm-clock', 'unrefreshing-sleep': 'bed',
    'joint-pain': 'bone', 'palpitations': 'heart-pulse', 'headaches': 'circle-dot',
    'fatigue': 'battery-low', 'weight-change': 'scale',
    'irregular-periods': 'calendar', 'flooding': 'droplet', 'spotting': 'circle-dashed',
    'cramping': 'spiral'
  };

  /* ----------------------------------------------------------------- motion
   * Durations in ms, easings as cubic-bezier control points. Reanimated 4 on
   * the UI thread; `Easing.bezier(...spread)` takes these four numbers.
   * Every entry has a reduced-motion answer in the brand book — none of them
   * is "do nothing", and none of them removes the state change itself.
   */
  var MOTION = {
    duration: { instant: 90, quick: 160, base: 240, slow: 380, reveal: 560, ambient: 3200 },
    easing: {
      standard: [0.2, 0.8, 0.2, 1],   // most transitions
      exit:     [0.4, 0, 1, 1],       // things leaving
      enter:    [0, 0, 0.2, 1],       // things arriving
      breathe:  [0.45, 0, 0.55, 1]    // looping ambient motion
    },
    spring: {
      press:  { damping: 18, stiffness: 320, mass: 0.7 },
      settle: { damping: 22, stiffness: 180, mass: 1 },
      bloom:  { damping: 12, stiffness: 140, mass: 1.1 }
    },
    stagger: 44   // ms between siblings in a list reveal
  };

  /* ------------------------------------------------------------------ Vera */
  var VERA_POSES = ['neutral', 'attentive', 'celebrate', 'resting', 'reading'];

  /* --------------------------------------------------------------- helpers */
  function token(name) { return 'var(--' + name + ')'; }

  // Cumulative dash offset for the progress trail's drawn line.
  function trailDash(total, current, length) {
    var filled = Math.max(0, Math.min(current, total)) / total;
    return { array: length, offset: length * (1 - filled) };
  }

  return {
    CREST: CREST, crestPath: crestPath,
    CATEGORIES: CATEGORIES, category: category,
    SEVERITY: SEVERITY,
    SYMPTOM_ICONS: SYMPTOM_ICONS,
    MOTION: MOTION,
    VERA_POSES: VERA_POSES,
    token: token, trailDash: trailDash
  };
})();
