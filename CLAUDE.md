# Nuva — agent instructions

An iOS app for women 35–45 who have started experiencing symptoms they can't name and don't yet
know they're in perimenopause. The promise is not "bring data to your doctor". It is **finally
understand what's happening to you**.

Two feelings govern every screen: **clarity** ("now I understand what's happening in my body") and
**agency** ("I know how to talk about this, and I have data to back it up"). She is intelligent,
busy, and allergic to anything generic or condescending. If a screen could appear in a generic
wellness app, it is wrong.

Read `docs/PRODUCT_BRIEF.md` for what we're building and why.
Read `design/README.md` before writing any UI. It is the visual source of truth.

Expo changes fast and your training data is behind it. Check the versioned docs at
https://docs.expo.dev/versions/v57.0.0/ before using an API you haven't verified in this repo.

## Where the design lives

- `design/README.md` — the brand book. Colour rules, typography, spacing, elevation, iconography.
- `design/tokens.json` — every token. The source `src/constants/tokens.ts` is generated from.
- `design/motion.md` — every animation, its trigger, its values and its reduced-motion answer.
- `design/components/<Name>/README.md` — the spec for each of the 16 components.
- `design/assets/Logo/README.md`, `design/assets/Mascot/README.md` — the mark and Vera.
- `design/screens/*.dc.html` — one self-contained HTML file per screen, at real values.
- `docs/DESIGN_SYSTEM.md` — the index, plus what changed from the retired v1.0.

**Build screens from the HTML, not from memory.** Each file carries the actual padding, radius,
font size and line-height. Copy those numbers; never round or snap them to a 4/8px grid.
The HTML is web CSS — translate flex/gap directly, and see "Translating the artboards" below.

`design/screens/*.dc.html` are reference, **not** app source. Never import from them, never port
their CSS directly. Read them to check spacing and hierarchy; build from the tokens.

## The rules that break silently

Each of these looks fine in a screenshot and is wrong in the product.

1. **The crest is an SVG path.** `react-native-svg` with `crestPath()` from `src/constants/nuva.ts`.
   `borderRadius` cannot draw it. Three depths and no others: hero 30, standard 22, subtle 13.
   The SVG's height must be `h + bulge` or the curve clips. Animate it by interpolating the
   bulge argument inside `useAnimatedProps`, never by swapping whole path strings.
2. **`ember` is fill-only on light grounds.** Ember on canvas is 2.2:1. The moment the hue
   carries text, a hairline or a small icon on canvas, it becomes `emberDeep`. Same for
   `luna` → `lunaDeep`. This is the most common mistake available in the palette.
3. **One ember per screen.** The primary button is the only element that carries
   `shadow.ember`, and the tab bar's centre log button is the primary action on the tab
   screens — so those screens do not get a second glowing button.
4. **Severity renders three signals.** Colour, the filled-dot count, and the word, always.
   No text ever sits on a severity swatch. The ramp is reinforcement, not the mechanism.
5. **Selection never changes a fill.** `OptionCard` shows selection with a border, a shadow
   and a check in a slot that is always reserved, so nothing reflows. `SymptomChip` is the
   exception: its fill flips, because its colour is its category, not its state.
6. **Colour is never the only signal.** Categories carry colour and icon. Links are underlined,
   always, and `textLink` on `night` becomes `ember`.
7. **`bodyLG` is the daily insight and nothing else.** It is the one style tuned for 90
   continuous seconds of reading.
8. **Emphasis is a colour change, never a heavier weight.** DM Sans 500 is the heaviest text
   weight in the app. Never letterspace Fraunces.
9. **Vera is absent from the tracker, the pattern view and the Health Report.** She reacts to
   what the person *does*, never to what she *reports*: no sad face at a hard log, no
   celebration on a mild day. `vera-celebrate` never appears where a severity value is the
   subject — most often got wrong on the ValidationCard, which must not celebrate at all.
10. **Reanimated 4 on the UI thread.** The legacy `Animated` API is not used anywhere. No
    `runOnJS` inside a gesture or a frame callback. The validation card's counting number is a
    `useDerivedValue` formatted in `useAnimatedProps`, not a state update per frame.
11. **Reduced motion is not "no motion".** With `useReducedMotion()` true, transforms and loops
    stop, opacity cross-fades at `quick` remain, and every state change still happens. Pose
    swaps still fire, because the pose carries meaning. Users managing anxiety need this.
12. **RLS in the same migration that creates the table**, with an `auth.uid() = user_id` policy.
    Non-negotiable. Types are generated from the schema, never hand-written.
13. **Sentence case everywhere.** The only thing ever uppercased is the `eyebrow` style.
    Numbers are numerals. No emoji, no exclamation marks, no "journey".
14. **Never congratulate a low-severity day, and never frame a gap as failure.** A brutal week
    logged honestly is the product working. Blank calendar days are blank — never red, never
    crossed out, never counted against her.

## Non-negotiables

1. **No hardcoded style values.** Every colour, size, radius, space and type style comes from
   `src/constants/tokens.ts` or `src/constants/nuva.ts`. A literal hex in a component is a bug.
2. **TypeScript strict.** No `any`, no `@ts-ignore`. Types for Supabase come from generated
   schema types, never hand-written.
3. **Health data is private by default.** Every Supabase table holding user data ships with RLS
   enabled in the same migration that creates it. No exceptions, no "add it later".
4. **Copy is written for a woman who has been dismissed by her doctor.** Plain language, no
   clinical hedging, no exclamation marks, no emoji in the product.

## Voice

Plain language. Name the symptom. State the mechanism. Short sentences. Assume intelligence,
never assume knowledge. This is the register:

> Estrogen doesn't decline smoothly. It swings — sometimes higher than it ever was in your
> twenties, then crashes. That's why the anxiety comes out of nowhere.

Don't: clinical hedging, cheerfulness, brochure language, or softening bad news. There is no
bad news in this app — there is data.

## Stack

Expo SDK 57 · Expo Router (file-based, typed routes) · TypeScript strict, no `any` ·
React Native StyleSheet driven by `src/constants/tokens.ts` · Reanimated 4 · Gesture Handler ·
`react-native-svg` for the crest and the charts · `expo-image` for Vera · `expo-haptics` ·
`lucide-react-native` (outline only) · `@expo-google-fonts/fraunces` and
`@expo-google-fonts/dm-sans`.

Backend: Supabase (Postgres + Auth + Storage + Edge Functions), MMKV for onboarding state and
preferences, RevenueCat for entitlements, Superwall for paywall variants, PostHog for funnels,
Resend for email. Apple Health is phase 2 — do not start it during the MVP.

Gate the splash on `fontsLoaded`. Fraunces has very different metrics from the fallback and
headlines visibly reflow without it. Four cuts, and only four: `Fraunces_600SemiBold`,
`Fraunces_500Medium_Italic`, `DMSans_400Regular`, `DMSans_500Medium`.

## Build order

Each milestone ends with something runnable on a device.

1. **Foundation** — Expo + Router + TS strict, fonts loaded and splash gated, `src/constants/` in
   place, `CrestHeader`, `Button`, `OptionCard`, `SymptomChip`, the Vera and Logo SVG
   components, the paper grain overlay at `opacity.grain`.
2. **Onboarding 1–4** — welcome and Q1–Q3, answers to MMKV.
3. **Onboarding 5–8** — Q4–Q6, the magic moment, the paywall shell.
4. **Auth + Supabase** — Apple and Google, schema with RLS, sync MMKV answers up on first
   login. Seed `symptoms`, `validation_stats`, `word_templates`.
5. **Paywall live** — RevenueCat entitlements, Superwall template matching the tokens.
6. **Tracker + validation** — 34 symptoms, 6 categories, severity, the 60-second path, the
   validation stat shown immediately after save.
7. **Insights** — content pipeline, daily unlock, category weighting from the last 7 days.
8. **Find Your Words** — template query, sentence generation, clipboard copy.
9. **HRT / medication tracker** — CRUD, rotation notes, its own reminder hour.
10. **Patterns** — calendar and trend on `react-native-svg`.
11. **Health Report** — on-device PDF, Storage upload, export. Secondary priority.
12. **Notifications + email** — Edge Function cron, the three segments, the HRT reminder.
13. **Analytics + polish** — PostHog, a reduced-motion pass, a 375px pass, store screenshots.

`symptom_log_completed.duration_ms` is the product's health metric. If the median drifts above
60 seconds, the tracker needs work — not more features.

## Translating the artboards

The `.dc.html` files are web CSS. Four things need converting:

| In the artboard | In React Native |
|---|---|
| `clip-path: path(...)` on the header | `<Svg><Path d={crestPath(w, h, depth)} /></Svg>` |
| `box-shadow` | `shadow.light.*` / `shadow.dark.*` from `src/constants/tokens.ts` |
| `var(--token)` | `color[theme].token` |
| CSS `@keyframes` / `transition` | Reanimated 4, values from `MOTION` in `src/constants/nuva.ts` |

`display:flex` with `gap` ports as-is. `aspect-ratio` works. The grain overlay in the artboards
is a tiling PNG at `opacity.grain` (0.05), `pointerEvents="none"`, over the whole screen —
`assets/textures/grain.png`.

Screen frames are 393×852. Everything must hold at 375px — the wrapping chip rows are the
tightest layout in the app. Verify there before anything else.

## Structure

```
src/
  app/                  Expo Router routes
    (onboarding)/       welcome → 6 questions → magic moment → paywall
    (app)/              tabs: today, track, insights, you
  components/
    ui/                 primitives from the design system
    onboarding/         quiz-specific composites
  constants/
    tokens.ts           GENERATED from design/tokens.json — never hand-edited
    nuva.ts             crestPath, categories, severity, icon map, MOTION
  lib/
    storage/            MMKV — onboarding answers and preferences
    supabase/           client, generated types, queries
    analytics/          PostHog wrapper
    purchases/          RevenueCat + Superwall wrapper
assets/
  logo/                 the mark, wordmarks, lockups, app icons — SVG
  vera/                 the mascot's five poses plus the avatar — SVG
  textures/             the paper grain tile — bundled
  images/               app icon, splash and favicon PNGs
design/                 the design system: brand book, tokens, motion, components, 36 artboards
docs/
scripts/
  generate-tokens.mjs   regenerates src/constants/tokens.ts from design/tokens.json
```

Two path aliases, and they resolve to different roots: `@/*` → `src/*`, `@/assets/*` → `assets/*`
at the repo root. So `@/constants/tokens` and `@/assets/vera/vera-neutral.svg` are both correct.

Textures ship as three-file density sets — `name.png`, `name@2x.png`, `name@3x.png`. Always
`require` the base name; Metro reads `@2x`/`@3x` as density suffixes, so requiring `grain@3x.png`
never resolves. And `react-native-web` ignores `resizeMode="repeat"`, so textures only tile
correctly on the device.

## Tokens

`src/constants/tokens.ts` is generated. When a token changes, edit `design/tokens.json` and run:

```
node scripts/generate-tokens.mjs
```

That is what keeps the app and the design system from drifting apart. The React Native shadow
values are not in the JSON — CSS `box-shadow` has no RN equivalent — so they live in `SHADOWS`
inside the generator, copied from the mapping table in `design/README.md`. If that table changes,
change it there too.

## Working agreements

- One screen per PR. A screen is done when it matches its artboard at 393×852, works at 375px
  width, and every interactive element has a 44px minimum touch target.
- Never add a dependency without saying why in the PR description.
- Never generate placeholder/lorem copy. If real copy is missing, write it or ask.
- Before claiming a UI change works, run it and look at it. Type-checking is not verification.
- Do not run scaffolding, installs, git commands or the dev server unless asked to. Propose them
  and wait.
- This project has been rebuilt from scratch twice after a bad delete. Commit early, and never
  run a recursive delete on a folder that has uncommitted work in it.
