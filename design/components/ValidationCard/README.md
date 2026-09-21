The validation stat shown the moment a log saves. This is the product's emotional core — the thing that makes her feel less alone and less confused in the same breath.

## Why this card exists

She has been told her symptoms are stress, or age, or nothing. A number showing that most women in early perimenopause report exactly what she just logged is, for many users, the first time anything has confirmed what she is experiencing. It is trivial to build — the copy is static, keyed to the symptom slug — and it is the most emotionally powerful thing the app does.

## Anatomy — full card

```
background: night           radius: radius-xl (28px)
padding: space-6            shadow: shadow-lg
```

Category disc, then an eyebrow with the symptom and when it was logged. The percentage in `statNumber` in `ember`. The lede in `bodyLG` in `text-on-night`. The mechanism in `quote` (italic Fraunces) in `text-on-night-muted`.

The number is `ember` and is the only ember on the screen.

## Anatomy — compact

One row per logged symptom on a `surface` card: the percentage in `statNumber` at 26px in `ember-deep` — **not `ember`**, which fails contrast on a light ground — and the sentence in `bodySM`.

## Copy

Written by humans, never generated, and matching the product voice: plain, direct, not alarming.

> 71% of women in early perimenopause report anxiety spikes.
> It's not stress — it's progesterone.

The mechanism line is what separates this from a statistic. Name the symptom, state the cause.

## Motion

The card rises 20px and fades over `reveal` (560ms) while the number counts from 0. The sentence fades in at +280ms. **Nothing else on the screen moves.**

No confetti, no sparks, and no `vera-celebrate`. She has just reported feeling bad; the answer is recognition, not applause. This is the single most common way to get this card wrong.

## Consumer provides

- `symptom` — `{ slug, label, category }`.
- `percent` — integer.
- `lede`, `mechanism` — strings from `validation_stats`.
- `variant` — `"full" | "compact"`.

## Do

- Use tabular numerals so the card does not resize while counting.
- Show the full card for the first symptom in a session and compact rows for the rest — three full cards in a row is a lecture.

## Don't

- Don't celebrate. Don't animate Vera here.
- Don't use `ember` for the number on a light background; use `ember-deep`.
- Don't generate the copy, and don't round a real figure to something rounder.
