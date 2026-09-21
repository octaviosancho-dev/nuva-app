# Vera

Vera is the moth from the logo, given a face. She is the app's one recurring character.

She exists because the person using Nuva has spent months being told her symptoms are stress, or age, or nothing. A companion who is calm, present and never surprised by what she reports is doing real emotional work. Vera is that. She is not a coach, a cheerleader or a nurse.

## How Vera behaves

She is **calm by default**. She reacts to the person's actions, never to the person's symptoms — she does not look sad when a hard day is logged, and she does not celebrate a low-severity day. Logging a brutal week is not a failure and Vera must never imply it is.

She is **quiet**. She appears at most once per screen, and on most screens not at all. The tracker, the pattern view and the Health Report have no Vera. She belongs to onboarding, empty states, the magic moment, saved confirmations and the daily insight.

She **never speaks in first person**. No speech bubbles, no "Hi, I'm Vera!". The product's voice is the product's voice; Vera is a presence, not a narrator.

## The poses

| File | When |
|---|---|
| `vera-neutral.svg` | Default. Onboarding welcome, the paywall, general presence. |
| `vera-attentive.svg` | Wings lifted, eyes a touch wider. A question is waiting for an answer, or a field has focus. |
| `vera-celebrate.svg` | Eyes closed and curved up, wings high, ember sparks. A log saved, a streak continued, onboarding finished. Never on a severity value. |
| `vera-resting.svg` | Eyes closed, wings lowered, pale drifting motes. Night reminders, the "no data yet" empty state, the reduced-motion fallback for anything idle. |
| `vera-reading.svg` | Eyes lowered. Beside the daily insight and inside Find Your Words while the sentences generate. |
| `vera-avatar.svg` | Head only on a `luna-soft` disc, 120×120. Profile row, notification icon, anywhere under 64px. |

## Sizing

Full poses render between 96px and 220px wide. Below 96px the face collapses — use `vera-avatar.svg`. Above 220px she becomes the subject of the screen, which is only correct on the welcome screen and the magic moment.

## Colour

Vera is fixed: wings `luna`, body `night`, eyes `night-deep`, cheeks `blush` at 50%, eyespots `ember` with a `cream` centre, antennae `clay` tipped `ember`. She does not recolour per screen, per category or per theme. On dark grounds she sits on `night` or `night-deep` unchanged — the wings carry the contrast.

## Don't

- Don't give her a speech bubble, a lab coat, a clipboard or an accessory of any kind.
- Don't animate her while the person is reading. Idle motion under text is noise.
- Don't use `vera-celebrate.svg` anywhere a symptom severity is the subject.
- Don't add tails. They read as legs at every size tested.
- Don't flip her horizontally — she is symmetric, so it does nothing but break the file hash.
