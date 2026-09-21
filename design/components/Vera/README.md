Vera, the mascot — the moth from the logo, given a face. She is the app's one recurring character and its only illustration.

## What she is for

The person using Nuva has spent months being told her symptoms are stress, or age, or nothing. A companion who is calm, present and never surprised by what she reports is doing real emotional work. That is Vera's whole job.

She is not a coach, a cheerleader, a nurse or a guide. She does not teach, does not congratulate, and does not have opinions about the data.

## The three rules

**Calm by default.** She reacts to what the person *does*, never to what she *reports*. She does not look sad at a hard log and does not celebrate a mild day. Logging a brutal week honestly is the product working, and a mascot that flinches at it would undo the thing the app is for.

**Quiet.** At most once per screen, and on most screens not at all. The tracker, the pattern view and the Health Report have no Vera. She belongs to onboarding, empty states, the magic moment, saved confirmations and the daily insight.

**Never speaks.** No speech bubbles, no first person, no "Hi, I'm Vera!". The product's voice is the product's voice. She is a presence, not a narrator.

## Poses

Five poses plus an avatar, listed with their triggers in `assets/Mascot/README.md`. The short version: `neutral` for presence, `attentive` when a question is waiting, `celebrate` for a saved log or a finished flow, `resting` for night and empty states, `reading` beside text.

`celebrate` is never used where a severity value is the subject — see the ValidationCard guidance, which is the most common place to get this wrong.

## Sizing

96px to 220px for the full poses. Below 96px the face collapses, so use `vera-avatar.svg`. Above 220px she becomes the subject of the screen, which is only right on the welcome screen and the magic moment.

## Colour

Fixed in both themes. Wings `luna`, body `night`, eyes `night-deep`, cheeks `blush` at 50%, eyespots `ember` with a `cream` centre, antennae `clay` tipped `ember`. She does not recolour per screen, per category or per theme.

## Motion

Idle breathe, antenna twitch, the celebrate flutter and the resting motes are all specified in the motion section, with their reduced-motion answers. The one rule that matters: **nothing of hers loops while the person is reading**.

## Do

- Let her be absent. Most screens are better without her.
- Swap poses even under reduced motion — the pose carries meaning, the animation does not.

## Don't

- Don't give her props, accessories or a speech bubble.
- Don't animate her beside body text.
- Don't use her to soften bad news. There is no bad news in this app — there is data.
