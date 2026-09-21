Single-select answer card, used for every onboarding question that is not Q2. Selection shows as a border and a check, never as a colour change.

## Anatomy

```
min-height: 72px          radius: radius-lg (22px)
padding: space-4 space-5  gap: space-4
icon disc: 44×44, radius-pill
check slot: 26×26, always reserved
```

The trailing check slot occupies its 26px whether or not the card is selected. Reserving it is why selecting an option never reflows the list.

## Variants

**Plain** — a single `labelLG` line. Q1, Q4, Q5, Q6.

**With sub-label** — `labelLG` plus a `bodySM` line in `text-secondary`, 2px below. Q3 uses it to disambiguate answers that need a definition: "Shorter and closer together / Under 24 days apart".

## Colour

The icon disc takes a category or accent fill with its `on-*` token. The card itself stays `surface` in both states — **the fill never changes on selection**. Cycling disc colours down a list keeps four options distinguishable at a glance without making any of them look preferred.

## States

- **Unselected** — `surface`, 2px transparent border, `shadow-xs`.
- **Selected** — 2px `text-primary` border, `shadow-md`, check mark in the trailing slot.
- **Pressed** — `scale` 1 → 0.99 on the `press` spring; border and shadow cross-fade over 160ms.

## Consumer provides

- `icon` — Lucide name.
- `iconFill` — colour token for the disc; pair it with the matching `on-*`.
- `label`, `subLabel` — strings; `subLabel` switches the variant.
- `selected` — boolean.
- `onPress` — function.

## Do

- Keep to four options. The brief caps every question at four for a reason: this is a conversation, not a form.
- Write options as complete answers she'd say out loud, not as form values.

## Don't

- Don't change the card fill on selection.
- Don't collapse the check slot when unselected.
- Don't use this for multi-select — that is `SymptomChip`.
