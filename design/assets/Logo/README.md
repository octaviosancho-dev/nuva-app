# Logo

Nuva's mark is a luna moth seen from above. She is nocturnal, she is drawn to light, and she changes shape completely without anything having gone wrong. Those three facts are the brand argument, and they are the reason the mark is a moth and not a leaf, a flower, or a hormone curve.

The mark drops the moth's trailing hindwing tails on purpose. At 24px the tails read as legs, and a logo is read as a silhouette before it is read as a picture. Vera, the mascot, uses the same wing so the two are recognisably one creature.

## The files

| File | Use |
|---|---|
| `nuva-mark.svg` | The mark alone, full colour, transparent ground. In-app headers, loading states, the splash. |
| `nuva-mark-mono-ink.svg` | Single-ink silhouette in `text-primary` `#1F1B2E`. Print, the Health Report PDF footer, anywhere colour is unavailable. |
| `nuva-mark-mono-cream.svg` | Single-ink silhouette in `text-on-night` `#FDF8F1`. The same, on a dark ground. |
| `nuva-wordmark.svg` | "Nuva" alone, `text-primary`. Use when the mark already appears elsewhere on the screen. |
| `nuva-wordmark-cream.svg` | The wordmark on a dark ground. |
| `nuva-lockup-horizontal.svg` | Mark and wordmark side by side. The default lockup — App Store header, marketing, email. |
| `nuva-lockup-horizontal-cream.svg` | The horizontal lockup on night or night-deep. |
| `nuva-lockup-stacked.svg` | Mark above wordmark. Splash screen, square placements, the paywall header. |
| `nuva-appicon.svg` | iOS app icon, 1024×1024, full bleed. Export to PNG with no alpha and no rounded corners — iOS applies the mask. |
| `nuva-appicon-dark.svg` | The iOS 18+ dark-appearance icon variant. |
| `nuva-appicon-tinted.svg` | The iOS 18+ tinted variant. Greyscale only; iOS applies the user's tint. |

## Ink

Each single-ink file names its own colour, so no file relies on `currentColor`. The full-colour mark uses exactly five values: wings `luna` `#86AE7E`, body `night` `#2A2342`, eyespots `ember` `#E39A2E`, antennae `clay` `#B0442B`. On a night ground the body switches to `text-on-night` `#FDF8F1` and the antennae to `ember`, which is what `nuva-lockup-horizontal-cream.svg` and the app icons already do.

## The wordmark

Set in Fraunces 600 and converted to outlines, so it needs no font at render time. Do not re-set it in live text — the outlines are the wordmark.

## Clear space and minimum size

Clear space on all four sides is the height of the mark's body, roughly a quarter of the mark's height. Nothing enters it, including screen edges.

Minimum sizes: mark 24px, horizontal lockup 120px wide, stacked lockup 72px wide. Below 24px use the mark, never the lockup — the wordmark fills in and becomes a smudge.

## Don't

- Don't recolour the wings outside the luna family, and never make them pink.
- Don't rotate, skew, or add a shadow, outline or glow to the mark.
- Don't set the wordmark in another face, or letterspace it.
- Don't put the full-colour mark on clay, plum, iris or tide — the wings lose separation. Use the cream mono mark there.
- Don't add the tails back to the mark.
