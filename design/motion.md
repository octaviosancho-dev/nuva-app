# Motion

Every animation in Nuva is listed here with its trigger, its values and its reduced-motion answer. All of it runs on Reanimated 4 on the UI thread. The legacy `Animated` API is not used anywhere in this app.

The shared constants live in the bundle at `Nuva.MOTION` — durations, easing control points, spring configs and the list stagger. Port that object; don't retype the numbers.

## Principles

**Motion explains, it doesn't perform.** Every animation answers one of three questions: where did this come from, what did I just change, or what is the app doing right now. Anything that answers none of them is decoration and does not ship.

**Nothing moves under text she is reading.** The daily insight, the validation copy and the Find Your Words sentences are static once they have arrived. Vera does not idle beside them.

**Speed is respect.** `quick` (160ms) for feedback on a tap, `base` (240ms) for a state change, `slow` (380ms) for something entering the screen. Only three moments in the whole app are allowed to take longer, and they are listed under Set pieces.

**Reduced motion is not "no motion".** With `useReducedMotion()` true, transforms and loops stop, but opacity cross-fades at `quick` remain and every state change still happens. A person who turns off animation must never lose information.

---

## Constants

```
duration   instant 90 · quick 160 · base 240 · slow 380 · reveal 560 · ambient 3200
easing     standard [0.2, 0.8, 0.2, 1]   most transitions
           enter    [0, 0, 0.2, 1]       things arriving
           exit     [0.4, 0, 1, 1]       things leaving
           breathe  [0.45, 0, 0.55, 1]   looping ambient motion
spring     press  { damping 18, stiffness 320, mass 0.7 }
           settle { damping 22, stiffness 180, mass 1 }
           bloom  { damping 12, stiffness 140, mass 1.1 }
stagger    44ms between siblings
```

---

## The logo

### Splash — wings open

The one animation most people will see most often, so it is short and it never repeats within a session.

The mark starts with both wings scaled to `scaleX: 0.15` around the body's centre line and `opacity: 0`, the wordmark at `opacity: 0` and `translateY: 8`.

1. `0ms` — wings animate to `scaleX: 1` over `reveal` (560ms) with the `bloom` spring, each wing anchored at `transformOrigin` on the body centre. They open outward, like a moth settling.
2. `180ms` — antennae draw in: `strokeDashoffset` from full length to 0 over `base`, easing `enter`.
3. `320ms` — eyespots fade up, `opacity` 0 → 1 over `quick`, with a 60ms stagger between them.
4. `420ms` — the wordmark fades and rises: `opacity` 0 → 1, `translateY` 8 → 0, over `slow`, easing `enter`.

Total 800ms, then hold 400ms and hand off to the first screen. Splash is gated on fonts being loaded — if fonts resolve late, hold the last frame rather than restarting.

**Reduced motion:** the assembled lockup cross-fades in over `base`. No scaling, no drawing.

### Loading — wing pulse

Where a spinner would go, the mark's wings scale between `1` and `1.06` on the `breathe` easing over `ambient` (3200ms), looping. Opacity is untouched. This is slow on purpose: a fast pulse reads as anxiety, which is the wrong feeling in this app.

**Reduced motion:** a static mark at 60% opacity.

### Pull to refresh

Wing `rotateY` oscillates ±14° at 900ms per cycle while the refresh is in flight, damping to 0 on completion with the `settle` spring.

**Reduced motion:** the standard platform refresh indicator, no moth.

---

## Vera

Vera's motion is ambient and low-amplitude. She is a presence, not an event.

| State | Motion |
|---|---|
| **Idle breathe** | Body `scaleY` 1 → 1.015 → 1 and `translateY` 0 → −1.5 → 0 on `breathe` over `ambient`, looping. Runs only on screens where nothing is being read. |
| **Antenna twitch** | On screen focus: each antenna `rotate` ±3° over `base` with a 90ms stagger, once. |
| **Attentive** | Swap to `vera-attentive.svg` and lift `translateY` −4 over `quick` with the `settle` spring. Triggered when a question is on screen with no answer selected. |
| **Celebrate** | Swap to `vera-celebrate.svg`. Wings `rotate` ±8° outward over `quick` then settle. Four ember sparks scale 0 → 1 → 0 over `slow` with a 60ms stagger, radiating outward 12px. Fires on log saved, streak continued, onboarding complete. **Never on a severity value.** |
| **Resting** | Swap to `vera-resting.svg`. Motes drift `translateY` −6 and fade over `ambient`, looping with a 900ms offset between them. |
| **Reading** | Swap to `vera-reading.svg`. No idle loop — she is beside text. |

**Reduced motion:** pose swaps still happen (they carry meaning), all loops and transforms stop.

---

## Component interactions

| Component | Motion |
|---|---|
| **Button** press | `scale` 1 → 0.98 with the `press` spring. On release, back to 1. The ember glow does not animate. |
| **Button** disabled → enabled | `opacity` 0.4 → 1 over `base`, and `shadow-ember` fades in over `slow` so the glow arrives after the colour. |
| **OptionCard** select | `scale` 1 → 0.99 → 1 with `press`; border colour and shadow cross-fade over `quick`; the check mark draws its `strokeDashoffset` to 0 over `base` easing `enter`. The previously selected card releases over `quick`. The trailing slot is always reserved, so nothing reflows. |
| **SymptomChip** toggle | `scale` 1 → 0.97 → 1 with `press`; background and border cross-fade over `quick`. On select, the icon disc scales 1 → 1.12 → 1 with `bloom`. |
| **SeverityScale** select | The chosen swatch `scaleY` 1 → 1.08 → 1 with `bloom`; the border cross-fades over `quick`. Unselected steps dim to 0.72 opacity over `quick`. |
| **TabBar** switch | The active icon `scale` 1 → 1.12 → 1 with `press`; the label `opacity` 0.6 → 1 over `quick`; the ember indicator dot slides between tabs over `base` easing `standard`. |
| **TextLink** press | `opacity` to 0.72 over `instant`. No scale — a text link is not a button. |

---

## Screens

### Between onboarding questions

Forward: the outgoing content translates `x` 0 → −24 and fades over `base` easing `exit`; the incoming content enters from `x` 24 with `opacity` 0 → 1 over `base` easing `enter`, starting 80ms in. Back reverses the sign.

The **crest header does not slide**. Its colour cross-fades over `base` and its curve depth animates to the new screen's depth over `base` — the header is the one thing that stays put, so the flow reads as one continuous surface.

### ProgressTrail

When a question is answered, the newly filled segment animates `width` 0 → full over `base` easing `standard`. Previously filled segments hold. Vera's silhouette, at 14px, travels along the trail to the new position over `base` with the `settle` spring — this is the one place the mascot appears as a moving element rather than a character.

**Reduced motion:** the segment fills instantly, Vera jumps to position.

### Lists and grids

Cards and chips enter with a `stagger` of 44ms, each `opacity` 0 → 1 and `translateY` 12 → 0 over `base` easing `enter`. Cap the stagger at 8 items — past that, reveal the rest together, or a long list takes a visibly silly amount of time to appear.

---

## Set pieces

Three moments are allowed to be slower than `slow`. They are the emotional core of the product and they are the reason someone pays.

### The validation reveal

After she saves a log, each symptom surfaces its validation stat. This is the micro-moment that brings her back.

1. The card rises: `translateY` 20 → 0, `opacity` 0 → 1, over `reveal` easing `enter`, and `shadow-sm` → `shadow-lg` across the same window.
2. The percentage counts from 0 to its value over `reveal`, easing `standard`, on the UI thread. Tabular numerals, so the card does not resize while it counts.
3. The sentence beneath fades in at `+280ms` over `base`.

Nothing else on screen moves. Do not add sparks, confetti, or a Vera celebration here — she has just reported feeling bad, and the app's answer is recognition, not applause.

**Reduced motion:** the card cross-fades over `base`, the number appears at its final value.

### The magic moment

The screen that breaks the pattern: no progress, no back, no crest.

1. Ground `night-deep`, already in place from the transition.
2. Vera fades up at `vera-neutral.svg`, `opacity` 0 → 1 and `scale` 0.94 → 1 over `reveal` with the `bloom` spring.
3. The headline arrives line by line — three lines, `opacity` 0 → 1 and `translateY` 14 → 0, `base` each, staggered 140ms. Line by line, because she should read it at the speed it is written.
4. At `+1200ms` a slow ember bloom: a radial `opacity` 0 → 0.13 → 0.08 behind Vera over 1600ms on `breathe`. This is the only element in the app that takes longer than a second, and it is the light the moth has been moving toward.
5. The continue button fades in last, at `+1800ms`, over `slow`.

**Reduced motion:** all three lines and Vera cross-fade together over `slow`. The bloom renders at its resting 0.08 with no animation.

### Find Your Words — copy

On tap: the sentence block flashes `background` to `ember-soft` over `instant` and back over `base`; a "Copied" pill slides up from `translateY` 8 with `opacity` 0 → 1 over `quick`, holds 1400ms, and fades over `base`. Haptic `notificationAsync(Success)` fires with the flash.

---

## Data views

**CalendarHeat** — on month load, cells fade and scale `0.9 → 1` over `quick`, staggered 12ms by row then column. Capped: if the stagger would exceed 400ms total, drop to a single fade.

**Trend chart** — the line draws via `strokeDashoffset` over `reveal` easing `standard`; the area fill fades in behind it over `base`, starting at 60%. Dots pop in with `bloom`, staggered 30ms, after the line completes.

**Reduced motion:** both render complete, with a `base` cross-fade.

---

## Implementation notes

Read `useReducedMotion()` from `react-native-reanimated` once at the top of each animated component and branch there, rather than wrapping every value.

Keep every animated value on the UI thread — no `runOnJS` inside a gesture or a frame callback. The counting number in the validation reveal is a `useDerivedValue` formatted in a `useAnimatedProps`, not a React state update per frame.

The crest curve animates by interpolating the `bulge` argument to `Nuva.crestPath()` inside `useAnimatedProps` on an `react-native-svg` `Path`, not by swapping whole path strings.

Haptics are limited to three events: option select (`selectionAsync`), log saved (`notificationAsync Success`), Find Your Words copy (`notificationAsync Success`). Nothing else vibrates.
