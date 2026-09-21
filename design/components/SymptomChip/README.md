Multi-select symptom chip, coloured by its category. Used for Q2's twelve chips and throughout the tracker's 34 symptoms.

## Anatomy

```
min-height: 46px          radius: radius-pill
padding: space-2 space-4 space-2 space-2
icon disc: 30×30, radius-pill, Lucide 16px stroke 2
label: label (DM Sans 500, 13/17)
```

Chips wrap in a flowing row, `space-3` gap. Never force a fixed grid — symptom names vary from "Rage" to "Unrefreshing sleep" and a grid either clips or wastes half the row.

## Colour

The chip's colour is its **category**, not its selection state. `Nuva.category(slug)` returns the token and its `on-*` partner. The mapping is fixed and she learns it: clay is temperature, blush is mood, iris is cognitive, tide is sleep, luna is physical, plum is cycle.

- **Unselected** — `surface` fill, 1.5px `line-strong` border, the disc in the category colour.
- **Selected** — the category colour fills the whole chip, the label switches to its `on-*` token, the disc becomes a scrim of that text colour, and `shadow-sm` appears.

The disc scrim is `rgba(253,248,241,0.22)` on dark category fills and `rgba(31,27,46,0.13)` on the light ones (`blush`, `luna`), so the icon holds either way.

## States

- **Pressed** — `scale` 1 → 0.97 on the `press` spring; fill and border cross-fade over 160ms; on select the disc scales 1 → 1.12 → 1 on `bloom`.

## Icons

From `Nuva.SYMPTOM_ICONS`, which is the source of truth. These are fixed — she learns them in Q2 and then uses them every day in the tracker, so re-picking one later costs her that recognition.

## Q2 specifically

Twelve chips, the most-reported entry symptoms, not the full set of 34. Her picks here seed the tracker's default ordering, so the twelve are a product decision, not a layout one.

## Consumer provides

- `symptom` — `{ slug, label, category }`.
- `selected` — boolean.
- `onToggle` — function.

## Do

- Colour by category in both states, so the vocabulary is learnable from the first screen.
- Allow zero selections. "None of these" is a real answer and the Continue button stays enabled.

## Don't

- Don't add a check mark. The fill flip is the signal, and twelve check marks in a row is noise.
- Don't re-pick a symptom's icon.
- Don't use a chip for a single-select question.
