The HRT and medication row. Women on treatment open this every single day regardless of how they feel, which makes it the app's most reliable retention surface.

## Why it matters

The symptom log can be skipped on a good day. A medication reminder is tied to treatment, and missing it has real consequences — so this is the one feature that creates a non-optional daily open. Over time the pattern view can show how her symptoms moved since she started, with no extra input from her.

## Anatomy

```
row: surface, radius-md, padding 14px 16px, shadow-xs
icon tile: 42×42, radius-sm
name: labelLG        sub: bodySM in text-secondary
take control: 34×34, radius-pill
```

Rows stack `space-3` apart. The add row uses `surface-sunken` with no shadow.

## Rotation notes

Topical products need site rotation, and forgetting where yesterday's gel went is a real daily problem. When `rotation_notes` is set, show the next site inline beneath the dose in `ember-deep` with a rotate glyph: "Left thigh today". This is free text from her, rendered as given.

## The take control

A 34px circle: 2px `line-strong` border when pending, `luna` filled with an `on-luna` check when taken. Not a checkbox — the pill shape matches everything else tappable in the system.

Tapping is undoable for the rest of the day. Nothing about medication adherence is ever framed as a score.

## The streak

`statNumber` in `luna-deep` with "days tracked". A missed day never breaks it visibly, never turns red and never resets with a warning. The number exists to show her the data she has built, not to make her feel watched — the same principle as the calendar's blank days.

## Consumer provides

- `medication` — `{ name, type, dose, frequency, rotationNotes, reminderHour, active }`.
- `takenToday` — boolean.
- `onToggleTaken`, `onEdit` — functions.

## Do

- Show the time beside the dose. She is checking whether the 22:00 one is done.
- Fire the medication reminder independently of the daily log reminder — they serve different needs and different hours.

## Don't

- Don't render adherence as a percentage.
- Don't use `severity-*` colours here. Medication is not severity.
- Don't hide the add row once one medication exists — many women take two.
