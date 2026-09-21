Find Your Words — two or three pre-written sentences she can say at her appointment, generated from her logs. This replaced the PDF as the primary doctor-visit feature.

## Why sentences and not a report

The problem was never that she lacks data. It is that she lacks language, and that the appointment runs out before she can explain herself. What a woman actually brings to a ten-minute appointment, nervous and historically dismissed, is not a chart — it is words she can say.

## Anatomy

```
card: surface, radius-xl, padding space-5, shadow-sm
sentence block: ember-soft, radius-lg, 16px 18px
blocks stacked space-3 apart
```

The eyebrow reads "Say this". The sentences are `quote` — italic Fraunces, 19/29 — because italic reads as a voice rather than a label, and because she may literally read it aloud.

## The sentences

Generated from `word_templates` keyed to symptom clusters, populated with her frequency and severity data. About 30 templates cover the common clusters, with a fallback for anything unmatched. No AI.

They must sound like her, not like a chart read aloud:

> For the past 6 weeks I've had vasomotor symptoms — hot flashes and night sweats — alongside mood changes and cognitive difficulties. They're worse in the second half of my cycle. I'd like to discuss whether this could be perimenopause and what my hormone levels look like.

Clinical vocabulary is deliberate here and only here. "Vasomotor symptoms" is the phrase that makes a physician listen, and handing it to her is the entire feature.

## Copy state

On tap: the block flashes to `luna-soft` and a "Copied" pill appears beside the button. Success haptic. `find_your_words_copied` is the conversion proxy for the whole feature — if opens are high and copies are low, the sentences aren't landing.

## Consumer provides

- `sentences` — array of strings, 2–3.
- `onCopy` — function; copies all sentences joined by a space.
- `generatedAt` — regenerated each time the screen opens, never cached.

## Do

- Regenerate on every open, and say so. Her data moved since last time.
- Keep the copy action a single tap for all sentences — she is not going to copy them one at a time in a waiting room.

## Don't

- Don't show charts, raw counts or severity numbers on this screen.
- Don't soften the clinical terms. They are the point.
- Don't generate more than three sentences. She has to remember them.
