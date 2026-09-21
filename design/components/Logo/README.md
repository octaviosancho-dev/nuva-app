The Nuva mark, wordmark, lockups and iOS app icons. The mark is a luna moth seen from above.

## Why a moth

She is nocturnal — the symptoms are loudest at night and the entry moment is a woman googling at 11pm. She is drawn to light, which is what the product promises: understanding, not management. And she changes shape completely without anything having gone wrong, which is the argument the whole brand is making about perimenopause.

A butterfly would say transformation too, and says it so often in this category that it says nothing. A moth says it at night.

## The reduction

The mark drops the luna moth's trailing hindwing tails. At 24px the tails read as legs, and a logo is read as a silhouette before it is read as a picture. Vera, the mascot, wears the same wing — mark and mascot are one creature, and the wing path is literally shared.

## Files and usage

See `assets/Logo/README.md` for the full file table, the ink values, clear space and minimum sizes. In short: `nuva-lockup-horizontal.svg` is the default, `nuva-mark.svg` is the in-app form, the mono files exist for print and the Health Report, and the three app icons cover iOS light, dark and tinted.

## In the app

The mark appears on the splash, in the empty header of the welcome screen, and at 16px inside `ProgressTrail`. It does not appear on every screen — a logo on a screen someone is already inside is a waste of the gutter.

The wordmark is outlines, not live text. Do not re-set it.

## Motion

The splash animation — wings opening from `scaleX: 0.15`, antennae drawing, eyespots fading, wordmark rising — is specified in the motion section, along with the wing pulse that replaces a spinner and the pull-to-refresh flap.

## Do

- Use the cream mono mark on `clay`, `plum`, `iris` and `tide`, where the full-colour wings lose separation.
- Export app icons as PNG with no alpha and no rounded corners. iOS applies the mask.

## Don't

- Don't recolour the wings outside the luna family.
- Don't add the tails back.
- Don't use the lockup below 120px wide — use the mark.
