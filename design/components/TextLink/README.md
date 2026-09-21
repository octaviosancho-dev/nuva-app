Inline and standalone text links. Always `text-link`, always underlined.

## Rules

Colour alone never carries meaning in this system, so the underline is not optional and is not a hover affordance — it is always on.

```
colour: text-link      underline-offset: 2px
weight: 500            pressed: opacity-pressed (0.72)
```

Two sizes: `body` (15/23) for inline and standalone use, `caption` (12/17) for legal footers.

## On dark grounds

`text-link` is tuned for `canvas` and `surface`. On `night` or `night-deep`, use `ember` instead — it clears 6.3:1 there, where `text-link` does not. Keep the underline.

## Touch target

Text links are shorter than 44px. Wrap in a `Pressable` with `hitSlop={{ top: 12, bottom: 12, left: 6, right: 6 }}`. No scale animation on press — a link is not a button, and making it behave like one invites the wrong expectation.

## Destructive actions

A link may open a destructive flow but must never complete one. "Delete my data" opens a confirmation sheet; it does not delete.

## Consumer provides

- `label` — string, sentence case, short.
- `size` — `"body" | "caption"`.
- `onPress` — function.
- `onDark` — boolean.

## Do

- Keep labels to a few words: Terms, Privacy, Skip for now, Why we ask this.
- Use a link for the genuinely optional path, and let it be genuinely optional.

## Don't

- Don't remove the underline.
- Don't use `text-link` on `night` — use `ember`.
- Don't style a link to look like a button, or the reverse.
