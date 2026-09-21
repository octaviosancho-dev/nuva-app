Six segments showing onboarding progress, with the moth travelling the filled edge. Visible from question 1 onward.

## Anatomy

```
segments: 6, height 3px, radius-pill, space-1 gap (5px)
moth: 16px, centred on the leading edge, 9px above the track
label: caption, "3 of 6"
```

The trail fills the nav row's remaining width beside the back control.

## Colour

| Ground | Filled | Track |
|---|---|---|
| `night`, `night-deep` | `text-on-night` | `rgba(253,248,241,0.24)` |
| `luna` and other light fills | that fill's `on-*` | `rgba(31,27,46,0.22)` |
| `surface` | `text-primary` | `line` |

## The moth

The mark's two wings at 16px, in the filled colour, sitting on the boundary between filled and unfilled. It is the only place the mascot appears as a moving element rather than a character, and it is why this is a trail rather than a bar.

It is hidden at 0 and at 6 — before she starts there is nothing to travel, and when the set is complete the moth has arrived and leaves the screen with it.

## Motion

On answer, the new segment animates `scaleX` 0 → 1 from the left over `base` with the `standard` easing. Previously filled segments hold — they do not re-animate. The moth travels to the new boundary over `base` on the `settle` spring.

Reduced motion: the segment fills instantly and the moth jumps.

## Consumer provides

- `total` — 6 in onboarding.
- `current` — 0–6.
- `onDark` — boolean.
- `fill`, `track` — optional overrides for non-standard grounds.

`Nuva.trailDash(total, current, length)` returns the dash array and offset if you draw the trail as a single stroked path instead of six views.

## Do

- Fill cumulatively — every segment up to `current`, not just the active one.
- Show the count in text beside it. Six small bars is not a number.

## Don't

- Don't animate segments that were already filled.
- Don't show the trail outside onboarding. The tracker is not a progress bar.
- Don't let the moth overlap the back control at step 0.
