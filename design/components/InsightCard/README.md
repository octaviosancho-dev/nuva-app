The daily insight — one 90-second educational read, unlocked on a schedule and weighted toward whatever she has been logging.

## Three states

**Today** — `sand` fill, `radius-xl`, an ember eyebrow reading "Today", the reading time and the category, then the title in `displaySM`. Tappable.

**Locked** — `surface` with a `line` border and no shadow. A lock glyph and "Unlocks tomorrow". Title in `text-tertiary`. Not tappable. The title stays legible on purpose: a teaser she can read is a reason to come back, a blurred rectangle is a paywall.

**Open** — `surface` card. Eyebrow with category and position ("Mood · 3 of 90"), title in `displaySM`, a `line` rule, then the body.

## The body is bodyLG and only bodyLG

16/26 is the one style in the system tuned for continuous reading. The first paragraph carries `text-primary`; subsequent paragraphs drop to `text-secondary`, which gives the opening line the weight it deserves without a second type size.

Keep to two or three short paragraphs. 90 seconds is the promise.

## Category weighting

Insights are not a generic rotation. The unlock logic reads her last 7 days of logs and weights the next insight toward her highest-frequency category — simple SQL aggregation, no AI. The connection between what she logs and what she learns is the product's core loop.

Surface the category on the card so the connection is visible. Seeing "Mood" the day after three anxiety logs is the loop doing its job in public.

## Motion

The card expands to the open state as a shared element over `base`. Body paragraphs stagger in at 44ms. Nothing loops while the body is on screen — Vera does not idle beside text.

## Consumer provides

- `insight` — `{ slug, title, body, category, orderIndex }`.
- `state` — `"today" | "locked" | "read"`.
- `readingSeconds` — integer, shown as "90 seconds".
- `onOpen` — function.

## Do

- Open with the mechanism, not with a preamble. "Estrogen doesn't decline smoothly" is a first line; "Let's talk about hormones" is not.
- Mark read state quietly — a `line` border and `text-secondary` title, no badge.

## Don't

- Don't blur or redact a locked title.
- Don't use `bodyLG` anywhere else in the app.
- Don't exceed three paragraphs. If it needs four, it is two insights.
