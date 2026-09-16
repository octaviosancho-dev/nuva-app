# Nuva — agent instructions

Perimenopause tracker for women 35–45. iOS-first, Expo SDK 57 + TypeScript.
Read `docs/PRODUCT_BRIEF.md` for what we're building and why.
Read `docs/DESIGN_SYSTEM.md` before writing any UI. It is the visual source of truth.

Expo changes fast and your training data is behind it. Check the versioned docs at
https://docs.expo.dev/versions/v57.0.0/ before using an API you haven't verified in this repo.

## Non-negotiables

1. **No hardcoded style values.** Every color, size, radius, space and type style comes from `constants/tokens.ts` or `constants/typography.ts`. A literal hex in a component is a bug.
2. **TypeScript strict.** No `any`, no `@ts-ignore`. Types for Supabase come from generated schema types, never hand-written.
3. **Reanimated only** for animation — this project is on Reanimated 4 with `react-native-worklets`. Never the legacy `Animated` API. Respect `useReducedMotion()` — when true, transforms collapse to opacity-only.
4. **Health data is private by default.** Every Supabase table holding user data ships with RLS enabled in the same migration that creates it. No exceptions, no "add it later".
5. **Sentence case in all UI copy.** Never Title Case, never ALL CAPS. The only letter-spaced text is the 10.5px eyebrow label.
6. **Copy is written for a woman who has been dismissed by her doctor.** Plain language, no clinical hedging, no exclamation marks, no emoji in the product.

## Design rules you will get wrong if you skim

- Display font is **Bricolage Grotesque at 800** for headlines and **600** for buttons, option labels and chips. Body font is **DM Sans**. There is no third font.
- Shadows are **hard offsets, never blur**. `shadowRadius` is always `0`. A soft drop shadow anywhere in this app is wrong.
- Option cards are **always filled with a color**, even unselected. Selection is signalled by an ink border plus a hard offset shadow, not by changing the fill.
- Header blocks use an **arch** (curved bottom edge) drawn with `react-native-svg`. `borderRadius` cannot express it. See `ArchHeader` in the design system.
- Each illustration's own background color **must equal** the header color behind it, so the art bleeds with no visible seam. Those exact hexes live in `artColor` in the tokens and are not interchangeable with the palette colors.

## Reference mockups

`design/*.dc.html` are the approved mockups for the four designed onboarding screens (direction C; two earlier directions were built and rejected). They are HTML reference, **not** app source. Never import from them, never port their CSS directly. Read them to check spacing and hierarchy; build from the tokens.

`design/source/*.jfif` are the full-size illustration originals, kept for re-cropping. Not bundled.

`assets/illustrations/` holds the eight production illustrations — one per onboarding screen except the paywall. Together with `assets/textures/` they are the only images that ship.

## Structure

```
src/
  app/                  Expo Router routes
    (onboarding)/       welcome → 6 questions → magic moment → paywall
    (app)/              tabs: home, track, insights, report
  components/
    ui/                 primitives from the design system
    onboarding/         quiz-specific composites
  constants/
    tokens.ts           color, space, radius, shadow, motion
    typography.ts       type styles as StyleSheet objects
  lib/
    supabase/           client, generated types, queries
    analytics/          PostHog wrapper
    purchases/          RevenueCat + Superwall wrapper
assets/
  illustrations/        the eight production illustrations — bundled
  textures/             grain + halftone tiles — bundled
design/                 approved HTML mockups and art originals, not compiled
docs/
```

Two path aliases, and they resolve to different roots: `@/*` → `src/*`, `@/assets/*` → `assets/*` at the repo root. So `@/constants/tokens` and `@/assets/illustrations/hero-profile.jpg` are both correct.

`constants/` sits at the repo root until the Expo scaffold lands; move it to `src/constants/` then, so the `@/` alias reaches it.

## Scaffold notes

The default SDK 57 template already ships Expo Router, Reanimated, Gesture Handler, Safe Area, Screens, Linking, Constants and Status Bar. Only these need installing on top:

```
npx expo install react-native-svg expo-image @expo-google-fonts/bricolage-grotesque @expo-google-fonts/dm-sans lucide-react-native react-native-mmkv
```

`create-expo-app` refuses to run in a folder that already has files. Scaffold into a **new** folder and move these files into it afterwards — never the other way round. The template writes its own `CLAUDE.md`, `assets/` and `.gitignore`, so merging a scaffold on top of this folder overwrites them.

Textures ship as three-file density sets — `name.png`, `name@2x.png`, `name@3x.png`. Always `require` the base name; Metro reads `@2x`/`@3x` as density suffixes, so requiring `grain@3x.png` never resolves. And `react-native-web` ignores `resizeMode="repeat"`, so textures only tile correctly on the device.

## Working agreements

- One screen per PR. A screen is done when it matches the mockup at 393×852, works at 375px width, and every interactive element has a 44px minimum touch target.
- Never add a dependency without saying why in the PR description.
- Never generate placeholder/lorem copy. If real copy is missing, write it or ask.
- Before claiming a UI change works, run it and look at it. Type-checking is not verification.
- Do not run scaffolding, installs, git commands or the dev server unless asked to. Propose them and wait.
- This project has been rebuilt from scratch twice after a bad delete. Commit early, and never run a recursive delete on a folder that has uncommitted work in it.
