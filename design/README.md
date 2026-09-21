# Nuva

Nuva is an iOS app for women 35–45 who have started experiencing symptoms they can't name — anxiety out of nowhere, irregular cycles, brain fog, night sweats — and who don't yet know they're in perimenopause. She has googled it. Her doctor told her she's too young. The product's promise is not "bring data to your doctor". It is **finally understand what's happening to you**.

Everything in this system exists to serve two feelings: **clarity** ("now I understand what's happening in my body") and **agency** ("I know how to talk about this, and I have data to back it up").

She is intelligent, busy, and allergic to anything that feels generic or condescending. That sentence is the design brief. If a screen could appear in a generic wellness app, it is wrong.

---

## Content fundamentals

The voice is the opposite of the medical system that dismissed her.

**Do:** plain language. Name the symptom. State the mechanism. Short sentences. Assume intelligence, never assume knowledge.

**Don't:** clinical hedging, cheerfulness, exclamation marks, emoji, "journey" as a euphemism, anything that sounds like a brochure.

This is the register:

> Estrogen doesn't decline smoothly. It swings — sometimes higher than it ever was in your twenties, then crashes. That's why the anxiety comes out of nowhere.

**Sentence case, always.** Screen titles, buttons, labels, notifications. The only thing ever uppercased is the `eyebrow` type style, and only for section markers and question counters.

Numbers are numerals — "6 of 34", "71%", "3 days". Never "six of thirty-four".

Never describe a symptom as a failure and never congratulate a low-severity day. A brutal week logged honestly is the product working.

---

## Visual foundations

### One: warm paper, never white

The ground is `canvas` `#FAF5EE`, a warm off-white. Pure white is the colour of a clinic, a form and a lab result, and she has had enough of all three. `surface` sits a shade above it for cards. `surface-raised` (true white in light theme) is reserved for modals and the single card that must float above other cards.

### Two: colour means something

Nuva's palette is not decorative. Every hue is assigned:

- `ember` is the light she is moving toward — the primary action, the progress that is filling, the moth's eyespots. It appears roughly once per screen. A second ember element on the same screen means one of them is wrong.
- The six category colours are a fixed vocabulary. `cat-temperature` is always temperature. Once she learns that the clay dot means hot flashes, that mapping cannot move.
- The severity ramp runs cool to hot, `severity-1` through `severity-4`.
- `night` and `night-deep` are the colour of 11pm, which is when she is most likely to be reading. They carry the headers, the validation card, the magic moment and the paywall.

### Three: the crest

Every screen header ends in a soft convex curve — the **crest**. It echoes the moth's wing and it is the system's one structural signature. Three depths only: `hero` 30px, `standard` 22px, `subtle` 13px. `CrestHeader` owns the geometry; nothing else in the app draws a curve.

---

## Colour rules

The palette is role-based. Surfaces and text flip between themes; **brand fills do not**. `ember`, `clay`, `luna`, `blush`, `iris`, `tide` and `plum` hold the same value in light and dark, and each has a fixed `on-*` partner that is guaranteed legible on it. This is why a category chip looks identical in both themes and needs no per-theme logic.

| Put text on | Use | Ratio |
|---|---|---|
| `canvas` / `surface` | `text-primary`, `text-secondary`, `text-tertiary` | 15.4 / 7.0 / 4.97 |
| `night` / `night-deep` | `text-on-night`, `text-on-night-muted` | 14.0 / 7.5 |
| `ember` | `on-ember` | 7.1 |
| `clay` | `on-clay` | 5.4 |
| `luna` | `on-luna` | 6.7 |
| `blush` | `on-blush` | 7.3 |
| `iris` | `on-iris` | 5.3 |
| `tide` | `on-tide` | 5.4 |
| `plum` | `on-plum` | 6.4 |
| `sand` / `luna-soft` | `on-sand` / `on-luna-soft` | 12.1 / 11.5 |

Every pair above clears 4.5:1 in **both** themes. Nothing else is a text-on-background pair, and inventing one is how this system breaks.

**Two hues are fill-only on light grounds.** `ember` on `canvas` is 2.2:1 and `luna` on `canvas` is 2.3:1 — both fail even the 3:1 graphic threshold. When the hue has to carry text, a hairline or a small icon on a light ground, use `ember-deep` and `luna-deep` instead. This is the single most common mistake available in this palette.

`text-link` is the only link colour, and links are always underlined as well — colour alone never carries meaning here.

`line` is decorative and has no contrast requirement. `line-strong` is for borders that carry meaning, like an unselected option card, and clears 3:1 in both themes.

---

## Typography

Two families, and the split is by job, not by size.

**Fraunces** (`--font-display`) is the voice. Warm, editorial, slightly wonky — it reads as a considered magazine, not a medical device. It sets headlines, card titles, the validation number and the Find Your Words sentences. Weight 600 throughout; the `quote` style is 500 italic.

**DM Sans** (`--font-text`) is the interface. It sets everything the person reads for comprehension or taps: body copy, insight text, labels, buttons, captions.

Both are Google Fonts, loaded through `@expo-google-fonts` in the app. No font files ship with this system.

Rules that matter:

- **One `displayXL` or `displayLG` per screen.** Two competing headlines means the screen has two subjects and needs splitting.
- **`bodyLG` is for the daily insight and nothing else.** It is the only style tuned for 90 continuous seconds of reading, at 16/26.
- **Emphasis is a colour change, never a bolder weight.** DM Sans 500 is the heaviest text weight in the app.
- **Never letterspace Fraunces.** The negative tracking in the display styles is already set.
- `numeral` carries `font-variant-numeric: tabular-nums` so calendar columns and severity counts don't jitter.

---

## Space and layout

A 4px grid. `space-6` (24px) is the screen gutter on every screen, with no exceptions — it is what makes unrelated screens feel like one app.

Vertical rhythm: `space-7` between a headline and the content it introduces, `space-8` between sections, `space-10` above a primary button pinned to the bottom of a screen.

Touch targets are 44px minimum. `Button` is 56px, `OptionCard` 72px, `SymptomChip` 46px — all already clear it. Anything smaller (a text link, an icon button) needs `hitSlop`.

Radii are generous. `radius-lg` (22px) is the workhorse for cards; `radius-pill` for anything tappable that isn't a card. Nothing in Nuva has a sharp corner except the screen edge.

---

## Elevation

Shadows are soft, warm and low. A shadow means elevation, never decoration. There is exactly one glow in the system — `shadow-ember`, under an enabled primary button — and it is what makes the single most important tap on any screen unmistakable.

React Native can't take a CSS box-shadow string, so these are the mappings:

| Token | shadowColor | shadowOffset | shadowOpacity | shadowRadius | elevation |
|---|---|---|---|---|---|
| `shadow-xs` | `#1F1B2E` | `{0, 1}` | 0.06 | 2 | 1 |
| `shadow-sm` | `#1F1B2E` | `{0, 2}` | 0.08 | 8 | 2 |
| `shadow-md` | `#1F1B2E` | `{0, 6}` | 0.10 | 18 | 5 |
| `shadow-lg` | `#1F1B2E` | `{0, 16}` | 0.14 | 36 | 10 |
| `shadow-ember` | `#E39A2E` | `{0, 8}` | 0.34 | 20 | 6 |

In dark theme, swap `shadowColor` to `#000000` and raise opacity as `tokens.json` specifies. `shadow-inset-well` has no React Native equivalent — draw the well with `surface-sunken` and a 1px `line` top border instead.

---

## Iconography

**Lucide, outline only, never filled.** `lucide-react-native` in the app. Default 20px at stroke 2; 24px at stroke 2 in the tab bar; 16px at stroke 2 inside chips.

Icons take `text-primary`, `text-secondary`, or the `on-*` token of whatever they sit on. An icon is never the only label for a destructive or irreversible action.

**The symptom icon map is fixed.** `Nuva.SYMPTOM_ICONS` in the bundle is the source of truth. She learns these icons across onboarding Q2 and then uses them daily in the tracker — re-picking one later costs her the recognition she has built.

---

## Illustration and the mascot

The only illustration in Nuva is **Vera**, the luna moth from the logo. There is no second illustration style, no stock spot art, no abstract blobs.

Vera is calm by default. She reacts to what the person *does*, never to what she *reports* — she does not look sad at a hard log and does not celebrate a mild day. She appears at most once per screen and on most screens not at all: the tracker, the pattern view and the Health Report have no Vera. She never speaks in first person and never gets a speech bubble.

Full guidance and the pose table are in `assets/Mascot/README.md`. The logo lockups, app icons and clear-space rules are in `assets/Logo/README.md`.

---

## Accessibility

- Every text/background pair in this system clears **4.5:1 in both themes**. The table above is the complete list of legal pairs.
- **Colour is never the only signal.** Severity renders the colour, the filled-dot count *and* the word. Categories render the colour and the icon. Links are underlined.
- `focus-ring` is 2px with a 2px offset, `text-primary` on light and `text-on-night` on dark — it always clears 3:1 against whatever it surrounds.
- Every animation has a reduced-motion answer, and none of them is "remove the state change". See the motion section.
- Layouts are verified at 375px wide. Type scales with Dynamic Type; nothing in this system is positioned absolutely against a text bound.

---

## Consuming this in code

Expo SDK 57, Expo Router with typed routes, TypeScript strict. `constants/tokens.ts` is generated from `tokens.json` — never hand-edited.

React Native StyleSheet for styling. **Reanimated 4 on the UI thread for all animation**; the legacy `Animated` API is not used anywhere. `react-native-svg` for the crest paths and the pattern charts — `borderRadius` cannot draw the crest. `expo-image` for the Vera assets, with caching.

`Nuva.crestPath(w, h, depth)`, `Nuva.CATEGORIES`, `Nuva.SEVERITY`, `Nuva.SYMPTOM_ICONS` and `Nuva.MOTION` in the bundle are the shared source of truth between these previews and the app. Port them; don't re-derive them.
