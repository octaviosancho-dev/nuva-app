The screen header, ending in the crest — the soft convex curve that is the system's one structural signature. It carries the back control, the progress trail, the eyebrow and the headline.

## The crest

The curve is drawn with `react-native-svg`, not `borderRadius`, which cannot produce it. `Nuva.crestPath(width, height, depth)` returns the path:

```
M 0 0 H w V h Q w/2 (h + 2·bulge) 0 h Z
```

The sides sit at `h` and the centre dips `bulge` px lower. Three depths, and no others:

| Depth | Bulge | Where |
|---|---|---|
| `hero` | 30px | Welcome, the paywall — a header that is the screen |
| `standard` | 22px | Every onboarding question, every primary screen |
| `subtle` | 13px | Dense screens: the tracker, patterns, settings |

The SVG's height must be `h + bulge` or the curve clips at the bottom.

## Fills

`night` is the default. `night-deep` for the welcome screen and the paywall. `luna` for the later onboarding questions, which lifts the mood as she nears the magic moment. `clay`, `iris`, `tide` and `plum` are also legal fills.

Content colour follows the fill: `text-on-night` and `text-on-night-muted` on the dark fills, the fill's `on-*` token on `luna`. Never mix — a cream headline on `luna` fails contrast.

## Contents, top to bottom

`space-6` gutter, always. Then the nav row (back control at 36px, progress trail filling the rest), `space-4`, the eyebrow pill, `space-3`, the headline in `displayMD` or `displayLG`.

The headline sits clear of the crest's lowest point. Keep the last baseline at least 20px above `h`, or long titles collide with the curve.

## Q1 and the magic moment

Q1 has no back destination inside onboarding, so the back control is hidden but its 36px box stays — removing it shifts the progress trail and the header jumps between Q1 and Q2.

The magic moment has **no CrestHeader at all**. No crest, no progress, no back. Breaking the pattern is the point of that screen.

## Consumer provides

- `depth` — `"hero" | "standard" | "subtle"`.
- `fill` — a colour token name.
- `onDark` — boolean; picks the text and trail colours.
- `step`, `total` — for the progress trail; omit outside onboarding.
- `eyebrow`, `title` — strings.
- `onBack` — function, or `null` to hide the control while keeping its space.

## Do

- Animate the crest by interpolating the `bulge` argument, not by swapping path strings.
- Cross-fade the fill between screens while the header stays put — it is the element that makes the flow read as one surface.

## Don't

- Don't invent a fourth depth.
- Don't put a shadow under the crest. The curve is the edge.
- Don't stack two headers, or put a crest anywhere but the top of a screen.
