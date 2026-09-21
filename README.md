# Nuva

An iOS app for women 35–45 who have started experiencing symptoms they can't name — anxiety out of
nowhere, irregular cycles, brain fog, night sweats — and who don't yet know they're in
perimenopause. The promise is not "bring data to your doctor". It is **finally understand what's
happening to you**.

Expo SDK 57 · Expo Router · TypeScript strict · Reanimated 4 · Supabase.

## Running it

```bash
npm install
npx expo start
```

Scan the QR with Expo Go, or `npx expo start --ios` for the simulator. Expo Go on SDK 57 requires
being signed in on both the CLI (`npx expo login`) and the app, with the same account; development
builds are exempt.

On Windows, if the phone can't reach Metro, the usual cause is the firewall scoping Node's inbound
rules to the Public profile while the adapter is Private — not the tunnel.

### Device builds

```bash
npx eas-cli build --profile development --platform ios
```

iOS compiles on Expo's servers; no Mac is needed. A paid Apple Developer Program membership is
required to sign for a real device. Profiles are in `eas.json`: `development`, `preview`,
`production`.

## Where things are

```
src/app/            Expo Router routes — (onboarding), then (app) tabs
src/components/ui/  the primitives from the design system
src/constants/      tokens.ts (generated) and nuva.ts (crest, categories, motion)
src/lib/            storage (MMKV), supabase, analytics, purchases
design/             the design system — brand book, tokens, motion, components, 36 artboards
docs/               the product brief and the design system index
assets/             logo and Vera as SVG, the paper grain tile, app icon PNGs
scripts/            generate-tokens.mjs
```

Two path aliases, resolving to different roots: `@/*` → `src/*` and `@/assets/*` → `assets/*` at
the repo root.

## The design system

`design/` is the visual source of truth. Start at `design/README.md` (the brand book), then
`docs/DESIGN_SYSTEM.md` for the index and what changed from the retired v1.0.

Build a screen from its artboard in `design/screens/`, not from memory — each file carries the real
padding, radius, font size and line height. Open any `.dc.html` in a browser to see it rendered;
the paper grain won't load outside the canvas, which is expected.

`SheetComponents.dc.html` shows every component state side by side and is the fastest way to check
a primitive once it's built. The four `Flow*.dc.html` files each hold a complete workflow with
shared state and real transitions — they are the reference for how a flow should *feel*, while the
per-screen files define what each state *is*.

### Tokens are generated

`src/constants/tokens.ts` is never hand-edited. Change `design/tokens.json`, then:

```bash
node scripts/generate-tokens.mjs
```

That is what keeps the app and the design system from drifting apart.

## Screens

| Flow | Artboards |
|---|---|
| Onboarding | `Splash` `Main` `Q1Timeline` `Q2Symptoms` `Q3Periods` `Q4Doctor` `Q5Goal` `Q6CheckIn` `MagicMoment` `Paywall` |
| Account | `Auth` `TrialStarted` |
| Daily loop | `Today` `TodayEmpty` `LogSelect` `LogSeverity` `LogValidation` `LogSaved` |
| Learn | `Insights` `InsightOpen` `Patterns` `PatternTrend` |
| Words, HRT, account | `Words` `Meds` `MedAdd` `You` `Settings` `Reminders` `Report` |
| Whole workflows | `FlowOnboarding` `FlowLog` `FlowWords` `FlowMeds` |
| Handoff sheets | `SheetLogo` `SheetComponents` `SheetMotion` |

## Working on this

`CLAUDE.md` holds the agent instructions, including the fourteen rules that break silently — each
looks fine in a screenshot and is wrong in the product. Read it before writing UI.

`docs/PRODUCT_BRIEF.md` is what we're building and why, including the data model, the analytics
events and the build order.
