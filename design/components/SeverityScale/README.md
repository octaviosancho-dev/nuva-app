The 1–4 severity control, one per logged symptom. Colour, filled dots and the word all carry the value, so none of them carries it alone.

## Anatomy

Four equal steps in a row, `space-2` gap. Each step: a 26px swatch at `radius-xs`, a row of four dots, and the label.

```
step padding: space-3 space-1    radius: radius-md
swatch: full width × 26px
dots: 5px, radius-pill
label: caption (12/16)
```

## The ramp

| Value | Token | Word |
|---|---|---|
| 1 | `severity-1` | Mild |
| 2 | `severity-2` | Moderate |
| 3 | `severity-3` | Strong |
| 4 | `severity-4` | Severe |

Cool to hot, which maps onto how the symptoms themselves feel. `Nuva.SEVERITY` is the source of truth for the values, tokens and words.

## Why three signals

Around 1 in 12 women has some colour vision deficiency, and this control is used daily under fatigue, often at night. The filled dot count and the word each communicate the value without the colour, so the ramp is reinforcement rather than the mechanism. **No text is ever placed on a severity swatch** — that is what lets the ramp be chosen for feel rather than for contrast.

## States

- **Unselected** — `surface-sunken` step, transparent border.
- **Selected** — `surface` step, 1.5px `text-primary` border, label in `text-primary` at weight 500.
- **Pressed** — the swatch `scaleY` 1 → 1.08 → 1 on `bloom`; unselected steps dim to 0.72.

Severity has no empty state inside a logged symptom — selecting the symptom selects a default of 2, which she can move. The 60-second target does not survive a control that requires two taps per symptom.

## Consumer provides

- `value` — 1–4, or `null`.
- `onChange` — function.
- `symptom` — for the accessibility label: "Hot flashes severity, Strong, 3 of 4".

## Do

- Render the word at every size. If the layout is too tight for four words, the layout is too tight.
- Default to 2 when a symptom is first selected.

## Don't

- Don't put a number or any text inside the swatch.
- Don't use the severity ramp for anything that is not severity — it is not a general-purpose scale.
- Don't colour a streak, a score or a summary with it.
