The pattern view — a month grid coloured by each day's worst severity, and a per-symptom trend line beside it.

## The grid

```
7 columns, space-2 gap
cell: 1:1 aspect, radius-xs
number: numeral with tabular-nums
```

Each cell takes `severity-1` through `severity-4` for that day's **worst** logged symptom. Not the average — an average of one severe and five mild symptoms reads as a fine day, and it was not a fine day.

**Not logged** is `surface-sunken` with a `text-tertiary` number. Blank means no data, and the key says so. A missing day is never red, never crossed out, and never counted against her.

Today carries a 2px `text-primary` outline with 1px offset — the same treatment as `focus-ring`, so the marker reads as "here" rather than as a selection.

## The trend

A 30-day line per symptom on `react-native-svg`. The line takes the symptom's category colour, the area fill takes its `-soft` tint. Dots every sixth point, `surface` filled with a 2.2px category stroke, so they read on the fill.

The y axis is severity 1–4 and never auto-scales. A chart that rescales makes a mild month look identical to a severe one.

## Correlations

Surfaced as plain sentences beneath the chart, not as a second visualisation: "On days you logged poor sleep, hot flashes were severe 68% of the time." Simple co-occurrence over a rolling window — no AI, no correlation coefficient shown to the user.

## Motion

Cells fade and scale 0.9 → 1 over `quick`, staggered 12ms by row then column, capped at 400ms total. The trend line draws by `strokeDashoffset` over `reveal`; the area fades in behind it; dots pop after the line completes.

## Consumer provides

- `month` — the date being shown.
- `days` — `[{ date, worstSeverity | null }]`.
- `series` — `[{ date, severity }]` for the trend, plus the symptom's category.
- `onSelectDay` — function.

## Do

- Use the worst severity per day, and say so in the key.
- Keep the y axis fixed at 1–4.

## Don't

- Don't colour an unlogged day.
- Don't put text inside a severity cell other than the date number.
- Don't show a streak break, a red day or any language that frames a gap as a failure.
