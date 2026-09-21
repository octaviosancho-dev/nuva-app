# Nuva — Product Brief

**v3.0 · September 2026.** Supersedes brief v2.0. The visual section of v2.0 is retired in full — see `design/`, which is the visual source of truth, indexed by `docs/DESIGN_SYSTEM.md`. This document covers what we're building, for whom, and how it's put together.

### What changed from v2.0

- Health Report PDF demoted from killer feature to secondary utility. Research confirmed the doctor-relationship problem is real but the PDF is not the solution women need most.
- Three features added: real-time symptom validation, HRT/medication tracker, and "Find Your Words" doctor prep tool.
- Central promise reframed: from "bring data to your doctor" → "finally understand what's happening to you."
- Section 2 (mechanism) and Section 5 (features) updated accordingly.
- Section 4 (why this wins) updated to reflect actual differentiator.

---

## 1 · The customer

**Primary: women 35–45 who don't yet know they're in perimenopause.**

She has started experiencing symptoms she can't name — anxiety spikes out of nowhere, irregular cycles, brain fog, night sweats, mood swings. She has googled them. Her doctor told her she's "too young" or offered an SSRI without checking her hormones. She is intelligent, busy, and allergic to anything that feels generic or condescending.

**The entry moment:** a 40-year-old woman googling _"why am I so anxious all of a sudden"_ at 11pm. Nuva has to be what she finds, and the first thing that makes her feel understood.

**Secondary:** women 45–52 who already know it's perimenopause and are frustrated with apps that are clinical, ugly, or built for late-stage menopause.

### Her pain

- The symptoms are real but unnamed. No framework to understand what's happening.
- Doctors dismiss her, or treat the anxiety without investigating the cause.
- Existing apps target menopause — too late in her journey — or are generic trackers with no perimenopause depth.
- Nobody around her is talking about this.
- She can't walk into an appointment with useful data. She forgets, minimises, or can't articulate it.
- When she does go to the doctor armed with information, the appointment runs out before she can explain herself properly.

### What she leaves with

**Clarity** — "now I understand what's happening in my body."
**Agency** — "I know how to talk about this, and I have data to back it up."

After 7 days she understands why her specific symptoms happen. After 30 days she can see patterns. After 90 days she has a symptom summary and the exact language to use with any physician.

**The magic moment** is in onboarding, before she ever sees the app. After six questions:

> _"Based on what you've shared, you're likely in early perimenopause. Your symptoms are real. They have a name. And now they're trackable."_

For many users this is the first time anyone — human or software — has validated what they're experiencing. It is not a feature. It is the reason someone pays.

---

## 2 · The mechanism

A 60-second daily symptom log, real-time validation of what she's feeling, one educational insight per day connected to her specific symptoms, a doctor prep tool, and an HRT tracker for women already on treatment.

- **Track** — log symptoms daily, fast, with severity. Each logged symptom surfaces a validation stat immediately.
- **Understand** — one evidence-based insight per day, in plain language, connected to what she's been logging.
- **Speak** — "Find Your Words" generates the exact language to use with her doctor, based on her data.
- **Manage** — HRT and medication tracker for women already on treatment. Daily use, high retention.
- **Show** — monthly symptom summary exportable for physician visits. Useful but not the star.

No AI. No social feed. No community. Everything else is noise for v1.

---

## 3 · Pricing

|         |                                                      |
| ------- | ---------------------------------------------------- |
| Trial   | 3 days, full access                                  |
| Monthly | $9.99                                                |
| Yearly  | **$49.99** — the anchor, pushed hardest (58% saving) |

Hard paywall immediately after the magic moment, before the app. RevenueCat for entitlements, Superwall for paywall A/B testing without a redeploy.

Benchmarks: Balance ~$50/yr, Caria ~$50/yr, Flo Premium ~$40/yr. The combination of daily validation + doctor prep language justifies parity.

---

## 4 · Why this wins

- 50M+ women in the US are in perimenopause right now. Over 1 million suffer silently without seeking help.
- **Nobody owns the 35–45 early-stage entry point.** Existing apps are clinical, ugly, or built for late-stage menopause.
- Women go to doctors and feel dismissed — one woman's $3,000 journey across 5 doctors before diagnosis is not unusual. The problem isn't that she lacks data. It's that she lacks language and validation.
- **The real differentiator is understanding, not reporting.** Nuva is the first app that tells her _why_ her symptoms happen, in plain language, connected to what she logged yesterday.
- Real-time symptom validation ("78% of women in early perimenopause experience this") is technically trivial and emotionally powerful. No competitor does it well.
- HRT is growing fast — millions of women newly starting treatment have no good tool to track its effect on their symptoms over time.
- `#perimenopause` and `#perimenopause35` have hundreds of millions of TikTok views and are growing.
- Competitors at $40–50/yr have thousands of paying subscribers. The market pays.

---

## 5 · MVP features

### 5.1 Onboarding — 8 screens

```
1  Welcome
2  Q1  When did you first notice something was different?     single select, 4
3  Q2  Which symptoms hit you hardest?                        multi select, 12
4  Q3  How are your periods right now?                        single select, 4 + sub-labels
5  Q4  Have you talked to a doctor about this?                single select
6  Q5  What do you want Nuva to help you with?                single select
7  Q6  When do you want to check in?                          single select
8  Magic moment  →  Paywall
```

All eight screens are designed — one artboard each in `design/screens/`, at real values. Build from the artboard, not from memory. The question screens share a `CrestHeader` whose fill rotates and whose crest stays put between screens, so the flow reads as one surface. The magic moment deliberately breaks the pattern: no progress, no back, no crest.

**Rules:** one question per screen, max 4 options (12 chips on Q2), no paragraph copy during the quiz — it's a conversation, not a form. Back is always available; never trap her. Progress visible from screen 2.

**Q6 does three jobs at once**, which is why it's last. It sets `profiles.reminder_hour`, which the notification cron reads — without it every reminder fires at a guessed time. It is the lowest-friction question in the set, so momentum into the magic moment is highest. And choosing a time is a micro-commitment, taken one screen before the paywall.

Its fourth option, _"I'd rather not be reminded"_, is real and is honoured — no reminder is ever sent to a user who picked it. Offering it costs some retention and buys the trust the whole product depends on. Track how often it's chosen; if it clears ~15% the question is being read as pressure and the copy needs work.

Answers are persisted to MMKV as they're given, so a killed app resumes where she left off, and synced to Supabase after auth.

### 5.2 Daily symptom tracker + real-time validation

34 symptoms across 6 categories — temperature, mood, cognitive, sleep, physical, cycle. Severity 1–4, selected visually. A complete log takes under 60 seconds.

**After she saves a log, each symptom surfaces a validation stat immediately:**

> _"Anxiety spikes affect 71% of women in early perimenopause. It's not stress — it's progesterone."_

This is the micro-moment that keeps her coming back. It costs nothing to build — the stats are static copy keyed to symptom slug — and it delivers the most emotionally powerful thing the app can do: make her feel less alone and less confused in the same breath.

Stats are written by humans, not generated. Tone matches the product voice: plain, direct, not alarming.

Q2's twelve chips are the most-reported entry symptoms, not the full set. Her selections there prioritise the tracker's default view.

### 5.3 Daily insight — connected to her logs

One educational read per day, 90 seconds maximum, plain language, evidence-based. **90 insights minimum at launch** — three months with no repeat. Unlocks on a schedule, Duolingo-style, which is what the push notifications hang off.

**Key improvement over v2.0:** insights are not generic rotation. If she logged anxiety 3 days in a row, the next unlocked insight in the anxiety category surfaces ahead of others. The connection between what she logs and what she learns is the product's core loop — not just a tracker, not just a content feed, but both responding to each other.

Implementation: `insights` table has a `category` column matching symptom categories. The unlock logic checks her last 7 days of logs and weights the next insight toward her highest-frequency category. No AI — simple SQL aggregation.

### 5.4 Pattern view

Monthly calendar colour-coded by severity. Per-symptom trend chart. Correlations surfaced without AI — simple co-occurrence over a rolling window.

### 5.5 Find Your Words — doctor prep tool

**This replaces the Health Report PDF as the primary doctor-visit feature.**

Based on her symptom logs, Nuva generates 2–3 pre-written sentences she can say (or read aloud, or screenshot) at her next appointment. No raw data, no charts — just the exact clinical language that makes a doctor take her seriously.

Example output, generated from her logs:

> _"For the past 6 weeks I've been experiencing vasomotor symptoms — hot flashes and night sweats — alongside mood changes and cognitive difficulties. These symptoms are worse in the second half of my cycle. I'd like to discuss whether this could be perimenopause and what my hormone levels look like."_

Implementation: sentence templates keyed to symptom combinations, populated with her frequency and severity data. No AI required. A small set of ~30 templates covers the most common symptom clusters. Edge cases get a fallback template. Generated fresh each time she opens the screen, saved to clipboard on tap.

This is what a woman actually brings to an appointment — not a PDF, but words she can say when she's nervous, time-pressed, and historically dismissed.

### 5.6 HRT and medication tracker

For women already on HRT (gel, patch, pill, spray) or other hormonal treatment. Daily reminder to apply/take, with rotation tracking for topical products (e.g. alternate leg for gel application).

**Why this matters for retention:** women on HRT use this feature every single day regardless of how they feel. It creates a non-optional daily open. Unlike the symptom log (which she might skip on good days), the medication reminder is tied to her treatment — missing it has real consequences.

Fields: medication name, type (gel / patch / pill / spray / other), dose, frequency, rotation notes (free text), reminder time. Synced to `medications` table. Reminder fires via the existing push cron.

Over time, the pattern view can surface how her symptoms changed since she started treatment — showing HRT's effect without requiring any extra input from her.

### 5.7 Health Report — symptom summary

**Demoted from killer feature to useful utility.**

Generated on-device monthly. A clean, readable summary of her most frequent and severe symptoms over the past 30 days. Exportable as PDF via `react-native-html-to-pdf`, shareable via standard iOS share sheet.

Useful for women who see a menopause specialist or a well-informed GP. Not the product's central promise. Not referenced in the paywall headline. Present, functional, not celebrated.

The PDF is not the answer to being dismissed. "Find Your Words" is.

### 5.8 Push notifications

Push token registered in Supabase on install. A Supabase Edge Function on a cron fires by user segment.

**Free (pre-paywall)** — value delivered at the right moment, not spam:

- _"Did you know anxiety spikes are one of the first signs of perimenopause? Open to learn why."_
- _"Your body has a pattern. Log today to start seeing it."_
- _"One insight is waiting for you today."_

**Trial, 3 days** — make her feel the value before it expires:

- Day 1 — _"Welcome to Nuva. Log your first symptoms — it takes 60 seconds."_
- Day 2 — _"Your first insight is ready. This one surprised a lot of women."_
- Day 3 — _"Your trial ends tonight. You've logged X symptoms. Keep your data."_

**Subscribed** — habit and retention:

- Daily log reminder at `profiles.reminder_hour`.
- Insight unlock notification.
- HRT reminder (if medication configured) — fires independently of the main reminder.
- Monthly Health Report ready.

### 5.9 Email — Resend

Secondary channel: welcome after signup, daily log reminder, insight unlock, Health Report ready, re-engagement after 3 days idle.

### 5.10 Auth

**Apple Sign In** — mandatory once any social login is offered; Apple reviews it during approval.
**Google OAuth** — `expo-auth-session` + Supabase Auth.

Both configured from day one.

---

## 6 · Tech stack

### Core

|                               |                                             |
| ----------------------------- | ------------------------------------------- |
| **Expo SDK 57**               | Framework                                   |
| **Expo Router** (SDK-matched) | File-based navigation, typed routes enabled |
| **TypeScript**                | Strict mode, day one, no `any`              |

### UI

|                             |                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------- |
| **React Native StyleSheet** | Styling, driven by `src/constants/tokens.ts`, generated from `design/tokens.json`             |
| **Reanimated 4**            | All animation, UI thread. Never the legacy `Animated` API                                     |
| **Gesture Handler**         | Gestures, swipes, taps                                                                        |
| **react-native-svg**        | `CrestHeader` crest paths, the logo, Vera and the pattern charts. Not optional — `borderRadius` can't draw the crest |
| **expo-image**              | Vera's poses and the logo lockups, with caching                                               |
| **lucide-react-native**     | Icons, outline only                                                                           |
| **@expo-google-fonts**      | Fraunces (display), DM Sans (text)                                                            |
| **expo-haptics**            | Three events only: option select, log saved, Find Your Words copy                             |

### Backend

|                             |                                                                       |
| --------------------------- | --------------------------------------------------------------------- |
| **Supabase Postgres**       | Primary database                                                      |
| **Supabase Auth**           | Apple + Google                                                        |
| **Supabase Storage**        | Generated PDFs                                                        |
| **Supabase Edge Functions** | Server logic, notification cron                                       |
| **Row Level Security**      | Enabled in the same migration that creates each table. Non-negotiable |
| **MMKV**                    | Local: onboarding state, cache, preferences                           |

### Services

|                              |                                        |
| ---------------------------- | -------------------------------------- |
| **Expo Push Notifications**  | Native iOS push                        |
| **Resend**                   | Transactional email                    |
| **RevenueCat**               | Subscriptions, trial, entitlements     |
| **Superwall**                | Paywall A/B testing without redeploy   |
| **react-native-html-to-pdf** | On-device Health Report                |
| **PostHog**                  | Funnels, retention, session recordings |
| **react-native-health**      | Apple Health — **phase 2, not MVP**    |

### MCP servers

| MCP          | For                                      | Priority           |
| ------------ | ---------------------------------------- | ------------------ |
| **Supabase** | Tables, queries, RLS, generated TS types | ⭐ before starting |
| **GitHub**   | Commits, branches, PRs                   | ⭐ before starting |
| **Resend**   | Email templates                          | later              |
| **PostHog**  | Events and funnels during development    | later              |

### Cost at MVP

Supabase (50K users / 500MB), RevenueCat (to $2.5K MTR), Superwall (to $1K MRR), Resend (3K emails/mo), PostHog (1M events/mo) and Expo are all free tier.

**$0/month until there's real revenue.**

---

## 7 · Data model

Every table ships with RLS enabled and an `auth.uid() = user_id` policy in the same migration. Types are generated from the schema — never hand-written.

```
profiles            id (= auth.users.id), created_at, stage, timezone,
                    push_token, onboarding_completed_at,
                    reminder_hour smallint null   -- from Q6; null = no reminders

onboarding_answers  user_id, question_key, answer (jsonb), answered_at

symptoms            id, slug, label, category, icon      -- seed data, 34 rows
symptom_logs        user_id, logged_on (date), symptom_id, severity (1..4)
                    unique (user_id, logged_on, symptom_id)

validation_stats    symptom_id, stat_copy               -- static seed, one row per symptom
                    -- e.g. "Anxiety spikes affect 71% of women in early perimenopause."

insights            id, slug, title, body, category, order_index  -- seed, 90+
insight_reads       user_id, insight_id, read_at

word_templates      id, symptom_slugs (text[]), sentence_template, order_index
                    -- ~30 templates covering common symptom clusters

medications         user_id, name, type, dose, frequency,
                    rotation_notes, reminder_hour, created_at, active boolean

health_reports      user_id, period_start, period_end,
                    storage_path, generated_at

notification_queue  user_id, segment, template_key, send_at, sent_at
```

`symptom_logs` is the hot table — index on `(user_id, logged_on desc)`. Pattern view, Find Your Words, and the Health Report all read from it.

`validation_stats` is seed data — one row per symptom slug, copy written by humans. Joined on log save, never computed at runtime.

`word_templates` uses a `symptom_slugs` array. Query: find templates where `symptom_slugs && her_top_symptoms_array`, order by `order_index`, take the top 2–3. Fallback template if no match.

---

## 8 · Analytics events

Keep the list short enough to actually read. The onboarding funnel is the one that matters most.

```
onboarding_started
onboarding_question_answered      { question_key, answer }
onboarding_abandoned              { last_question_key }
magic_moment_viewed
paywall_viewed                    { variant }
trial_started                     { plan }
subscription_started              { plan }

symptom_log_completed             { symptom_count, duration_ms }
symptom_validation_viewed         { symptom_slug }
insight_opened                    { insight_slug }
insight_completed                 { insight_slug, dwell_ms }
find_your_words_opened
find_your_words_copied
medication_configured
medication_reminder_tapped
pattern_view_opened
health_report_generated           { period_days, symptom_count }
health_report_exported            { destination }
```

`symptom_log_completed.duration_ms` is the product's health metric. If the median drifts above 60 seconds, the tracker needs work.

`find_your_words_copied` is the conversion proxy for the doctor-prep feature. If she copies it, she's using it. If open rate is high but copy rate is low, the generated sentences aren't landing.

---

## 9 · Build order

Each milestone ends with something runnable on a device.

1. **Foundation** — Expo + Router + TS strict, fonts loaded and splash gated, `src/constants/` in place, the paper grain overlay at `opacity.grain`, `CrestHeader`, `Button`, `OptionCard`, `SymptomChip` and the Vera and Logo SVG components, all against `design/components/*/README.md`.
2. **Onboarding 1–4** — welcome and Q1–Q3, built from their artboards, answers to MMKV.
3. **Onboarding 5–8** — Q4–Q6, magic moment, paywall shell.
4. **Auth + Supabase** — Apple and Google, schema with RLS, sync MMKV answers up on first login. Seed `symptoms`, `validation_stats`, `word_templates`.
5. **Paywall live** — RevenueCat entitlements, Superwall template matching the tokens, trial flow end to end.
6. **Tracker + validation** — 34 symptoms, 6 categories, severity, the 60-second path. Validation stat shown immediately after save.
7. **Insights** — content pipeline, daily unlock, category-weighted delivery based on recent logs, read state.
8. **Find Your Words** — template query, sentence generation, clipboard copy.
9. **HRT / medication tracker** — CRUD, rotation notes, reminder hour, push integration.
10. **Patterns** — calendar and trend charts on `react-native-svg`.
11. **Health Report** — on-device PDF, Storage upload, export. Secondary priority.
12. **Notifications + email** — Edge Function cron, the three segments, HRT reminder, Resend templates.
13. **Analytics + polish** — PostHog wired, reduced-motion pass, 375px pass, store screenshots.

Apple Health is phase 2. Do not start it during the MVP.

---

## 10 · Voice

She has been talked down to by a medical system that didn't take her seriously. The product's voice is the opposite of that.

**Do:** plain language. Name the symptom. State the mechanism. Short sentences. Assume intelligence, never assume knowledge.
**Don't:** clinical hedging, cheerfulness, exclamation marks, emoji, "journey" as a euphemism, anything that sounds like a brochure.

> _"Estrogen doesn't decline smoothly. It swings — sometimes higher than it ever was in your twenties, then crashes. That's why the anxiety comes out of nowhere."_

That's the register. Sentence case, always.

---

## 11 · What's not in v1

- Apple Health integration (phase 2)
- Community or social features (not planned)
- AI-generated content or personalization (not planned for MVP)
- Telehealth or doctor matching (out of scope)
- Android (iOS first, Android after first revenue milestone)
