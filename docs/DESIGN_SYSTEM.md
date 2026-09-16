# Nuva Design System

**v2.0 · September 2026.** Supersedes the visual section of the original product brief in full.

Extracted from the approved onboarding mockups — `CWelcome`, `CQ1`, `CQ2`, `CQ3` (direction **C, "Bold Bloom"**). Two earlier directions were built and rejected; do not reintroduce their vocabulary.

| Rejected | Why it's gone |
|---|---|
| A — Cut Paper | Cormorant Garamond, soft blurred shadows, terracotta/sand palette. Too timid. |
| B — Line & Flow | Instrument Serif, continuous line art, flat pill rows. Too quiet for the App Store. |

Machine-readable values live in `constants/tokens.ts` and `constants/typography.ts`. **That code is authoritative** — when this document and the tokens disagree, the tokens win and this document is out of date.

---

## 1 · The idea in one line

A well-designed independent magazine for intelligent women who have been dismissed by their doctors. Warm, loud, confident, printed — never clinical, never pastel wellness, never cute.

Three principles decide every call:

**Printed, not rendered.** Flat color, hard edges, offset shadows with no blur, visible grain and halftone. If it looks like a CSS gradient, it's wrong.

**One loud thing per screen.** A single arched block of saturated color carries the question and the artwork. Everything below it is quiet and functional.

**Color carries meaning, not decoration.** Mustard = progress and action. Brick = the brand and the emphasized word. Plum = depth and gravity. Sage = growth and the cool note. The user learns this without being told.

---

## 2 · Color

### Palette

| Token | Hex | Role |
|---|---|---|
| `ink` | `#241A16` | Warm near-black. Text, outlines, primary button, badges. |
| `cream` | `#FFF4E6` | App background. Never pure white. |
| `paper` | `#FFF9F0` | Cards and unselected chips on cream. |
| `brick` | `#B5462A` | Primary brand accent. Emphasized headline word, CTA offset shadow. |
| `plum` | `#63283E` | Deepest tone. Header blocks, emphasis on light headers. |
| `mustard` | `#E3A32F` | Highest energy. Progress fill, CTA icon well, first option. |
| `sage` | `#7E9B78` | The cool note. Growth, second option. |
| `blush` | `#E8927A` | Soft warm mid. Third option. |
| `tan` | `#EBCBA4` | Lightest fill. Fourth option, "not sure" states. |

Pure white `#FFFFFF` and pure black `#000000` appear nowhere.

### Art-matched header colors

Eight header blocks sit directly behind an illustration. Each uses the color **sampled from that image's own edge**, so the artwork bleeds into the block with no visible seam.

| Token | Hex | Behind |
|---|---|---|
| `artColor.heroPlum` | `#582538` | `hero-profile.jpg` — welcome |
| `artColor.headerBrick` | `#AF3D22` | `timeline-branch.jpg` — Q1 |
| `artColor.headerPlum` | `#5F2940` | `body-signals.jpg` — Q2 |
| `artColor.headerSage` | `#7B9572` | `cycle-moons.jpg` — Q3 |
| `artColor.headerBrickQ4` | `#AB3D24` | `doctor-gap.jpg` — Q4 |
| `artColor.headerPlumQ5` | `#5D283C` | `outcome-cards.jpg` — Q5 |
| `artColor.headerSageQ6` | `#7D9774` | `day-arc.jpg` — Q6 |
| `artColor.magicPlum` | `#58273A` | `bloom-full.jpg` — magic moment |

These are measurements, not decisions. They will not match `plum`/`brick`/`sage` and must not be "corrected" to. Q1 and Q4 are both "brick", Q2 and Q5 both "plum", Q3 and Q6 both "sage" — but each pair differs by a few points because each image was generated separately. Use the token that names the screen; sharing one value across a pair puts a visible seam on one of them.

If an illustration is regenerated, resample its edge and update the token:

```bash
ffmpeg -v error -i art.jpg -vf "crop=6:6:2:500,scale=1:1" -f rawvideo -pix_fmt rgb24 - | od -An -tx1
```

### Text on surfaces

| Surface | Primary | Supporting |
|---|---|---|
| cream / paper | `ink` | `#5C4A42`, then `#8A6E5E` |
| plum & brick headers | `cream` | `rgba(255,244,230,0.72)` |
| sage header | `ink` | `rgba(36,26,22,0.66)` |
| filled option card | `ink` | `rgba(36,26,22,0.62)` |

Ink on mustard, sage, blush and tan all clear 4.5:1 at the sizes used. Ink on `brick` or `plum` does **not** — those two are background-only.

---

## 3 · Typography

**Bricolage Grotesque** (display) + **DM Sans** (body). No third family.

| Style | Family / weight | Size | Line | Tracking | Used for |
|---|---|---|---|---|---|
| `displayXL` | Bricolage 800 | 43 | 41 | −1.5 | Welcome headline |
| `displayLG` | Bricolage 800 | 29 | 30 | −1.0 | Quiz question beside art |
| `displayMD` | Bricolage 800 | 26 | 27 | −0.9 | Quiz question, full width |
| `displaySM` | Bricolage 800 | 22 | 24 | −0.7 | In-app section headings |
| `buttonLG` | Bricolage 600 | 18 | 22 | −0.36 | Welcome CTA |
| `button` | Bricolage 600 | 17 | 21 | −0.34 | All other CTAs |
| `optionLabel` | Bricolage 600 | 16.5 | 21 | −0.33 | Option card, single line |
| `optionTitle` | Bricolage 600 | 16 | 19 | −0.32 | Option card with sub-label |
| `chipLabel` | Bricolage 600 | 12.5 | 15 | −0.19 | Symptom chip |
| `bodyLG` | DM Sans 400 | 15.5 | 24 | — | Lead paragraph |
| `body` | DM Sans 400 | 14 | 21 | — | Line under a question |
| `caption` | DM Sans 400 | 12 | 17 | — | Option sub-label |
| `link` | DM Sans 600 | 13.5 | 18 | — | Inline text action |
| `eyebrow` | DM Sans 600 | 10.5 | 14 | +0.63 | "Question 2 of 6", badges |
| `wordmark` | Bricolage 800 | 25 | 28 | −0.75 | `nuva` |

**Rules**

- Anything a finger touches is Bricolage 600. Anything read in a paragraph is DM Sans.
- Headline emphasis is a **color change at the same weight** — the tail of every question turns mustard or plum. Never italic, never a heavier weight.
- Only `eyebrow` is letter-spaced positively. Display styles carry *negative* tracking; that tightness is most of the direction's character.
- Sentence case everywhere. Never Title Case, never ALL CAPS.
- Body copy caps at ~36 characters per line on mobile.
- Gate the splash screen on `fontsLoaded` — fallback metrics reflow the headlines visibly.

---

## 4 · Space, radius, texture

**Base unit 2px.** Screen gutter is **26px** on every screen, no exceptions. Header top inset 62px. Bottom inset below the primary button 30px.

| Radius | Value | Applied to |
|---|---|---|
| `xs` | 9 | Icon square inside a chip |
| `sm` | 14 | Back button, CTA icon well |
| `md` | 16 | Symptom chip |
| `lg` | 20 | Buttons |
| `xl` | 22 | Option cards |
| `pill` | 100 | Eyebrow, progress segments, icon circles, badges |

### Shadows — hard offset only

`shadowRadius` is **always 0**. There is no blurred shadow anywhere in this app.

| Token | Offset | Color | On |
|---|---|---|---|
| `shadow.card` | 5, 5 | ink | Selected option card |
| `shadow.chip` | 3, 3 | ink | Selected symptom chip |
| `shadow.cta` | 5, 5 | **brick** | Enabled primary button |

The CTA's shadow is brick rather than ink so the button reads as brand rather than as a selected card.

iOS reproduces these exactly. Android `elevation` cannot — if Android is added, render a second absolutely-positioned View of the shadow color, offset identically, behind the element.

### Texture

Both textures are **tiling PNG assets** in React Native. CSS `feTurbulence` and `radial-gradient` do not exist here.

| Asset | Tiles at | Opacity | Placed |
|---|---|---|---|
| `assets/textures/grain.png` | 100dp | `0.06` | Absolute fill over every screen |
| `assets/textures/halftone-cream.png` | 12dp | `0.14` | Inside plum and brick headers |
| `assets/textures/halftone-ink.png` | 12dp | `0.13` | Inside the sage header |

Each ships as a **three-file density set** — `name.png`, `name@2x.png`, `name@3x.png`. Always `require` the base name; Metro picks the density and treats `@2x`/`@3x` as suffixes, so requiring `grain@3x.png` directly fails to resolve. The base size is the dp pitch: 100×100 for grain, 12×12 for the halftones.

Halftone sits **below** the illustration in z-order, so the artwork stays clean and the texture only shows on the empty part of the block.

Tiling needs React Native's own `Image` — `expo-image` has no repeat mode. And `pointerEvents` is not accepted on `Image` or in `ImageStyle`, so the wrapper carries it:

```tsx
<View style={StyleSheet.absoluteFill} pointerEvents="none">
  <Image
    source={require('@/assets/textures/halftone-cream.png')}
    resizeMode="repeat"
    style={[StyleSheet.absoluteFill, { opacity: opacity.halftoneOnDark }]}
  />
</View>
```

Two platform notes. `react-native-web` ignores `resizeMode="repeat"` and paints a single tile — textures only look right on the device, which is fine for an iOS-first app but will confuse you in the web preview.

**Regenerating the textures.** They are procedural, so they can be rebuilt with ffmpeg if lost. Grain is noise in the alpha channel of an ink-colored tile; the halftones are a single centred dot.

```bash
# grain — base 100, plus @2x at 200 and @3x at 300
ffmpeg -y -f lavfi -i "color=c=0x241A16:s=100x100" \
  -f lavfi -i "nullsrc=s=100x100,geq=lum='random(1)*255':cr=128:cb=128,format=gray" \
  -filter_complex "[0][1]alphamerge" -pix_fmt ya8 -frames:v 1 grain.png

# halftone-cream — base 12 (dot r 1.6), @2x 24 (r 3.2), @3x 36 (r 4.8)
ffmpeg -y -f lavfi -i "color=c=0xFFF4E6:s=12x12" \
  -f lavfi -i "nullsrc=s=12x12,geq=lum='if(lte((X-6)*(X-6)+(Y-6)*(Y-6),2.56),255,0)':cr=128:cb=128,format=gray" \
  -filter_complex "[0][1]alphamerge" -frames:v 1 halftone-cream.png
```

`halftone-ink` is the same command with `color=c=0x241A16`.

---

## 5 · Components

### `ArchHeader`

The signature element. A full-bleed block of saturated color whose bottom edge curves.

`borderRadius` cannot express an elliptical arch — draw it with **`react-native-svg`**: a `Path` filling the block with a quadratic curve across the bottom.

```
M 0 0  H W  V (H − d)  Q (W/2) H  0 (H − d)  Z        where d = H × arch
```

| Depth | `arch` | Used by |
|---|---|---|
| `hero` | 0.15 | Welcome — tall block, centred art |
| `standard` | 0.11 | Q2, Q3, Q5 — art floats at the right |
| `shallow` | 0.06 | Q1, Q4, Q6 — the block's base *is* an illustration band; a deep curve would clip its detail |

Children are clipped to the path. Content order inside: halftone → illustration → text and controls.

### `ProgressSegments`

Six segments, `flex: 1`, height 9, gap 6, radius `pill`. Completed and current are **mustard** on dark headers, **ink** on the sage header. Remaining use `line.trackOnDark` / `line.trackOnLight`.

Animate only the segment that just completed: width or opacity via `withTiming(motion.duration.progress)`.

Never render a continuous bar. The segmentation is what makes progress feel short.

### `BackButton`

44×44, radius `sm`, `cream` fill, ink chevron at `icon.control`. Always top-left of the header, sharing a 14px-gap row with the progress segments.

### `EyebrowPill`

Height 26, horizontal padding 12, radius `pill`, `eyebrow` type.
Two variants: **outlined** (1.5px `line.onDark`, cream text) on plum and brick; **solid ink** with cream text on sage. Pick by header luminance, not by preference.

### `OptionCard` — single select

```
minHeight 74 · radius xl · padding 11 / 15 · gap 13
fill: optionFills cycled by index — mustard, sage, blush, tan
border: 2.5px transparent (unselected) → 2.5px ink (selected)
shadow: none → shadow.card
icon: 42px cream circle, Lucide at icon.option
label: optionLabel, ink
trailing: 26px slot, always reserved; badge renders only when selected
badge: 26px ink circle, cream check at icon.check
```

The fill **never changes on selection.** The border is reserved as transparent at the same width so selecting never reflows the card. Cards carrying a sub-label go to `minHeight 84`, `padding 12/16`, `gap 14`, 44px icon circle, and stack `optionTitle` + `caption` with a 3px gap.

### `SymptomChip` — multi select

```
2-column grid, gap 9 · minHeight 52 · radius md · padding 6 · gap 8
unselected: paper fill, 2px ink border, icon square in its tone
selected:   tone fill,  2px ink border, icon square in cream, shadow.chip
icon square: 30px, radius xs, Lucide at icon.chip
label: chipLabel, ink, wraps to two lines on the longest entries
```

Tones cycle `chipTones` in reading order. No check badge — the fill flip is the signal, and 12 badges would be noise.

### `PrimaryButton`

```
height 62 (64 on welcome) · radius lg · ink fill · shadow.cta
padding: left 26, right 7, vertical 7
label: button / buttonLG, cream, left-aligned
icon well: 48px mustard square, radius sm, ink arrow at icon.control
disabled: opacity 0.4, shadow.none
```

The asymmetric padding and the mustard well are the button's identity. Never centre the label, never drop the well.

### `TextLink`

`link` type, `text.tertiary`, 44px touch target. No underline.

### `Illustration`

`expo-image`, `contentFit` per screen (see §6). The parent block's background **must** be the matching `artColor`. Never place an illustration on a mismatched surface and never add a border, card or shadow around one.

---

## 6 · Illustration system

Eight flat vector illustrations, one per onboarding screen except the paywall. They are the direction — the typography and color carry it, but the art is what the user remembers.

**Style (fixed):** flat cut-paper vector, zero outlines, zero gradients, zero shading, no 3D. Shapes are defined by flat color alone. Mid-century silkscreen poster feel.

**The set has an arc.** It opens emotional and ends diagrammatic: a whole woman → time passing → a body emitting signals → a broken cycle → a conversation that stalled → a choice of outcomes → one day → bloom. The subject and the aspect ratio change on every screen deliberately. **Never reuse one illustration's composition for another screen.**

| Screen | Asset | Ratio | Background | Subject | Placement |
|---|---|---|---|---|---|
| Welcome | `hero-profile.jpg` | 1:1 | `#582538` | Woman in profile, mustard face, brick hair, sage leaves growing from her hair, brick sun disc, waves | Full-bleed, `width: 100%`, anchored to the header's bottom |
| Q1 | `timeline-branch.jpg` | 3:1 | `#AF3D22` | One branch in four stages — bare twig → bud → leaf → full bloom — on a measured line with ruler ticks | Full-bleed band forming the header's base. `height 100`, `contentFit: cover`, `contentPosition: '50% 78%'` |
| Q2 | `body-signals.jpg` | 1:1 | `#5F2940` | Faceless mustard torso with heat arcs, a sage fog cloud, a cream pulse line, a spiral, sparkles radiating from distinct points | Absolute, `right: 2, top: 110`, 162×162 |
| Q3 | `cycle-moons.jpg` | 1:1 | `#7B9572` | Ring of moon phases with **deliberately uneven** spacing and one gap, brick teardrop at the centre | Absolute, `right: 0, top: 108`, 168×168 |
| Q4 | `doctor-gap.jpg` | 3:1 | `#AB3D24` | A large cream speech bubble holding three sage dots, a small plum bubble far to the right, a dashed cream line broken by a gap, one mustard leaf in it | Full-bleed band at the header's base, `height 100`, `contentFit: cover` |
| Q5 | `outcome-cards.jpg` | 1:1 | `#5D283C` | Three cards fanned like a hand — sage with a dot grid, tan with document lines, mustard with a sparkle — on a brick disc | Absolute, `right: 2, top: 110`, 162×162 |
| Q6 | `day-arc.jpg` | 3:1 | `#7D9772` | One day as an arc — plum curve, mustard sun rising at left and high at centre, cream crescent at right, plum dots along the baseline | Full-bleed band at the header's base, `height 100`, `contentFit: cover` |
| Magic moment | `bloom-full.jpg` | 4:5 | `#592639` | The welcome profile again, now with a fully flowering branch arcing over her — five brick blossoms, abundant sage foliage | Full-bleed, anchored to the screen's lower half |

The magic moment art is a **callback, not a new subject**: it is the welcome's woman with Q1's bare twig grown into full bloom. That rhyme is the emotional payoff of the whole flow — never replace it with an unrelated illustration.

**Rules**

- Ship at ≤2× display size, JPEG quality 4. The set runs 8–45 KB each.
- Question text `maxWidth` must clear a floating illustration by ≥4px. Values that work: Q2 198px, Q3 194px, Q5 198px.
- No woman's face on Q1, Q3, Q4 or Q6 — those screens are about time, rhythm, conversation and the day, not about her.

**Generating a new one.** Reuse the style block verbatim so the set stays coherent; change only the subject and the ratio:

```
Flat vector editorial illustration, thick cut-paper style with zero outlines —
shapes defined by flat color only. No gradients, no shading, no texture, no 3D,
no line art. Bold mid-century silkscreen poster look.

Subject: [ … ]

Palette strictly: deep plum #63283E, brick red #B5462A, mustard #E3A32F,
sage green #7E9B78, tan #EBCBA4, cream #FFF4E6.

[ratio]. No text, no logos, no borders. Solid [colour] background.
Absolutely no outlines, no strokes, no drop shadows. Pure flat color shapes only.
```

Then resample the edge (§2) and add the hex to `artColor`.

---

## 7 · Screen specs

All measured at 393×852. Must also hold at 375px width — the 2-column chip grid is the tightest case.

### Welcome

```
ArchHeader  h 452 · artColor.heroPlum · arch.hero
  halftone-cream 0.14
  hero-profile.jpg  absolute left 0 bottom 0 width 100%
  wordmark          absolute top 54 left 26, cream
  audience badge    absolute top 56 right 26 — mustard pill, ink eyebrow,
                    "35–45 · perimenopause"
34
displayXL   "Your body is / changing."   "changing." in brick
14
bodyLG      "Anxiety, brain fog, broken sleep. For the first time,
             you'll understand why."     maxWidth 292
flex (min 18)
PrimaryButton  "Let's begin"  h 64
18
TextLink       "I already have an account"
30
```

The badge is doing real work: it names the audience in the first second, which is the whole positioning.

### Q1 · Timeline

```
ArchHeader  artColor.headerBrick · arch.shallow · padding 62/26/0
  BackButton + ProgressSegments(1 of 6)
  18 · EyebrowPill "Question 1 of 6" (outlined)
  12 · displayMD "When did you first notice something was different?"
       maxWidth 312, "different?" in mustard
  8  · body "There's no wrong answer."
  18 · timeline-branch.jpg — full-bleed band, h 100
26
OptionCard × 4, gap 10, minHeight 74
  sunrise · moon · clock · hourglass
flex
PrimaryButton "Continue"
30
```

The question runs full width here because the art is below it rather than beside it. That is why it uses `displayMD` and `arch.shallow`.

### Q2 · Symptoms

```
ArchHeader  artColor.headerPlum · arch.standard · padding 62/26/30
  body-signals.jpg  absolute right 2 top 110, 162
  BackButton + ProgressSegments(2 of 6)
  22 · EyebrowPill "Question 2 of 6" (outlined)
  14 · displayLG "Which symptoms hit you hardest?"
       maxWidth 198, "hardest?" in mustard
  10 · body "Select all that apply. We'll track these from day one."
       maxWidth 200
34
SymptomChip grid — 2 columns, gap 9, 12 chips
  hot flashes · night sweats · brain fog · anxiety · mood swings ·
  sleep problems · irregular periods · fatigue · joint pain ·
  low libido · heart palpitations · headaches
flex
PrimaryButton "Continue (n)"   — count appended only when n > 0
30
```

Twelve chips here, not the tracker's full 34. These are the most-reported entry symptoms; the tracker's six categories come later. Selection seeds home-screen prioritisation.

### Q3 · Periods

```
ArchHeader  artColor.headerSage · arch.standard · padding 62/26/30
  halftone-ink 0.13          ← light header; ink text, ink progress
  cycle-moons.jpg  absolute right 0 top 108, 168
  BackButton + ProgressSegments(3 of 6, ink)
  22 · EyebrowPill "Question 3 of 6" (solid ink)
  14 · displayLG "How are your periods right now?"
       maxWidth 194, "right now?" in plum
  10 · body "This tells us where you are in the journey."
       maxWidth 194
30
OptionCard × 4 with sub-labels, gap 12, minHeight 84
  droplet · irregular line · calendar-pause · question
flex
PrimaryButton "Continue"
30
```

The sage header is the palette's breath — three saturated dark screens in a row would be exhausting. Its inversion (ink on light) is deliberate, not an inconsistency.

### Q6 · Check-in time

Specified, not yet built. A copy of Q1's layout — band illustration at the header's base, full-width question — on the sage header, which means Q3's ink-on-light inversion.

```
ArchHeader  artColor.headerSageQ6 · arch.shallow · padding 62/26/0
  halftone-ink 0.13
  BackButton + ProgressSegments(6 of 6, ink)
  18 · EyebrowPill "Question 6 of 6" (solid ink)
  12 · displayMD "When do you want to check in?"
       maxWidth 312, "check in?" in plum
  8  · body "We'll send one quiet reminder. You can change it any time."
  18 · day-arc.jpg — full-bleed band, h 100
26
OptionCard × 4, gap 10, minHeight 74
  "In the morning"              sun         → stores 08
  "Around midday"               sun-medium  → stores 13
  "In the evening"              sunset      → stores 20
  "I'd rather not be reminded"  bell-off    → stores null
flex
PrimaryButton "Continue"
30
```

Ending the quiz on a single tap is deliberate — she arrives at the magic moment with momentum, not fatigue. Do not add sub-labels here; the taller card makes the screen feel like work.

The fourth option is honoured literally. A `null` `reminder_hour` means the notification cron skips her, permanently, until she changes it in settings. Never treat it as "ask again later".

### Not yet designed — build to these rules

**Q4 and Q5** follow Q1/Q3 exactly. Header colors rotate so no two consecutive screens repeat — brick, plum, sage, brick, plum, sage — putting Q4 on brick (`artColor.headerBrickQ4`, band layout, `arch.shallow`) and Q5 on plum (`artColor.headerPlumQ5`, floating square, `arch.standard`).

**Magic moment.** *Breaks the pattern completely.* No arch, no progress, no back button, no eyebrow. Full-bleed `artColor.magicPlum` screen with `bloom-full.jpg`, `displayXL` in cream, arriving as a staggered fade line by line (`motion.stagger`, max 3 groups). This is the screen the user pays for — give it more air than feels comfortable.

**Paywall.** Returns to cream. No illustration. `displaySM` heading, yearly plan pre-selected as a filled `OptionCard` in mustard with `shadow.card`, monthly as `tan`. Trial terms in `caption`. `PrimaryButton` "Start 3-day free trial". Restore and terms as `TextLink`. Superwall renders this — the remote template must match these tokens exactly.

### App shell — bottom navigation

```
height 83 (includes safe area) · cream · 1px ink top border at 12% opacity
4 tabs: Home · Track · Insights · Report
active:   Lucide 22px ink + eyebrow label ink
inactive: same at text.tertiary
```

Active state is **ink, not mustard** — mustard is reserved for progress and the primary action, and a permanently mustard tab would dilute it.

---

## 8 · Motion

Reanimated, UI thread only. Never the legacy `Animated` API.

| Moment | Spec |
|---|---|
| Screen transition | translateX 20 → 0 + opacity, `motion.screenSpring` |
| Progress fill | the newly completed segment only, `withTiming(320, easeOut)` |
| Option select | `scale 1 → 0.98 → 1` spring + border/shadow `withTiming(160)` |
| Chip select | background + icon-square color `withTiming(160)` |
| Element entrance | translateY 14 → 0 + opacity, 360ms, stagger 90ms, **max 3 elements** |
| Magic moment | the same entrance, line by line, as the screen's only animation |
| Pattern charts | line draws in on viewport entry |

One entrance per screen. If two things animate in at once and neither is the point, delete one.

**Reduced motion is not optional.** When `useReducedMotion()` is true every transform collapses to an opacity-only fade of the same duration. Users arriving here are often managing anxiety symptoms — this is a product requirement, not an accessibility checkbox.

---

## 9 · Icons

**Lucide, outline only.** Never filled, never a solid variant. `lucide-react-native`.

| Context | Size | Stroke |
|---|---|---|
| Symptom chip | 16 | 2 |
| Option card | 20 | 2 |
| Back chevron, CTA arrow | 20 | 2.3 |
| Check in a badge | 15 | 3.2 |
| Tab bar | 22 | 2 |

Icons inherit ink. An icon never takes an accent color — its container does.

**Symptom mapping (fixed).** Do not re-pick these; users learn them.

| Symptom | Icon | | Symptom | Icon |
|---|---|---|---|---|
| Hot flashes | `thermometer` | | Fatigue | `battery-low` |
| Night sweats | `moon` | | Joint pain | `zap` |
| Brain fog | `cloud` | | Low libido | `heart-off` |
| Anxiety | `activity` | | Heart palpitations | `heart-pulse` |
| Mood swings | `repeat` | | Headaches | `alert-circle` |
| Sleep problems | `moon-star` | | Irregular periods | `calendar` |

Timeline answers (Q1): `sunrise` · `moon` · `clock` · `hourglass`.
Period status (Q3): `droplet` · irregular line · `calendar-pause` · `help-circle`.
Check-in time (Q6): `sun` · `sun-medium` · `sunset` · `bell-off`.

Q6 uses `sun`, never `sunrise` — `sunrise` already means "in the last few months" on Q1, and two time-themed screens in one flow cannot share a glyph.

---

## 10 · App icon & store

**Icon.** An ink `nuva` monogram is unreadable at 60px — use a mark instead: a brick disc on plum with a single mustard leaf-sprout rising from it, flat, no outlines, no text. Reads at 60×60 and carries the illustration system's DNA.

**Store listing.**
Name `Nuva: Perimenopause Tracker` · Subtitle `Symptoms, Insights & Doctor Reports`

Six screenshots, in order: magic moment → daily symptom log → daily insight → pattern view → Health Report → paywall with social proof. Frame each on `cream` with the headline set in `displaySM`.

---

## 11 · Migration notes

If you find any of these in code or docs, they are from the retired brief — replace them.

| Retired | Now |
|---|---|
| Cormorant Garamond | Bricolage Grotesque 800 / 600 |
| "Never bold display" | Display is 800; emphasis is a color change |
| terracotta-50/100/300/500/700, sand-*, sage-50/300/600 | `cream`, `paper`, `ink`, `brick`, `plum`, `mustard`, `sage`, `blush`, `tan` |
| `--shadow-card`, `--shadow-cta`, `--shadow-sheet` (blurred) | `shadow.card`, `shadow.chip`, `shadow.cta` — hard offset, zero blur |
| Pill CTA, centred label, terracotta-500 | Ink button, radius 20, left label + mustard icon well, brick offset |
| Radius scale 8/14/20/28/pill | 9/14/16/20/22/pill |
| Screen padding 24 | 26 |
| Lucide stroke 1.5 | 2 (2.3 on controls) |
| Sand-50 cards with 1px borders | Filled color cards, 2.5px ink border on selection |
| Progress as a continuous bar | Six segments |
| "SOS floating button" | Dropped from v1 — not in the MVP feature set |
| Bottom nav active = terracotta-500 | Active = ink |
