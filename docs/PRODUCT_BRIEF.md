# Nuva — Product Brief

**v2.0 · September 2026.** Supersedes brief v1.0. The visual section of v1.0 is retired in full — see `DESIGN_SYSTEM.md`, which is the visual source of truth. This document covers what we're building, for whom, and how it's put together.

---

## 1 · The customer

**Primary: women 35–45 who don't yet know they're in perimenopause.**

She has started experiencing symptoms she can't name — anxiety spikes out of nowhere, irregular cycles, brain fog, night sweats, mood swings. She has googled them. Her doctor told her she's "too young" or offered an SSRI without checking her hormones. She is intelligent, busy, and allergic to anything that feels generic or condescending.

**The entry moment:** a 40-year-old woman googling *"why am I so anxious all of a sudden"* at 11pm. Nuva has to be what she finds, and the first thing that makes her feel understood.

**Secondary:** women 45–52 who already know it's perimenopause and are frustrated with apps that are clinical, ugly, or built for late-stage menopause.

### Her pain

- The symptoms are real but unnamed. No framework to understand what's happening.
- Doctors dismiss her, or treat the anxiety without investigating the cause.
- Existing apps target menopause — too late in her journey — or are generic trackers with no perimenopause depth.
- Nobody around her is talking about this.
- She can't walk into an appointment with useful data. She forgets, minimises, or can't articulate it.

### What she leaves with

**Clarity** — "now I understand what's happening in my body."
**Agency** — "I have data I can bring to my doctor."

After 30 days she can see patterns. After 90 days she has a Health Report she can hand to any physician. She stops being dismissed, because she has evidence.

**The magic moment** is in onboarding, before she ever sees the app. After six questions:

> *"Based on what you've shared, you're likely in early perimenopause. Your symptoms are real. They have a name. And now they're trackable."*

For many users this is the first time anyone — human or software — has validated what they're experiencing. It is not a feature. It is the reason someone pays.

---

## 2 · The mechanism

A 60-second daily symptom log, one educational insight per day, and a monthly doctor-ready PDF.

- **Track** — log symptoms daily, fast, with severity.
- **Understand** — one evidence-based insight per day, in plain language.
- **Show** — export a Health Report with patterns and data.

No AI. No social feed. No community. Everything else is noise for v1.

---

## 3 · Pricing

| | |
|---|---|
| Trial | 3 days, full access |
| Monthly | $9.99 |
| Yearly | **$49.99** — the anchor, pushed hardest (58% saving) |

Hard paywall immediately after the magic moment, before the app. RevenueCat for entitlements, Superwall for paywall A/B testing without a redeploy.

Benchmarks: Balance ~$50/yr, Caria ~$50/yr, Flo Premium ~$40/yr. The Health Report alone justifies parity.

---

## 4 · Why this wins

- 50M+ women in the US are in perimenopause right now.
- Dedicated perimenopause apps are clinical, ugly, or aimed at late-stage menopause. **Nobody owns the 35–45 early-stage entry point.**
- The "doctor-ready report" is the single most-requested feature in App Store reviews of Balance, mySysters and Crest.
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

Screens 1–4 are designed and approved — pixel specs in `DESIGN_SYSTEM.md §7`. Screens 5–7 follow the same pattern with rotating header colors. The magic moment deliberately breaks the pattern: no progress, no back, no arch.

**Rules:** one question per screen, max 4 options (12 chips on Q2), no paragraph copy during the quiz — it's a conversation, not a form. Back is always available; never trap her. Progress visible from screen 2.

**Q6 does three jobs at once**, which is why it's last. It sets `profiles.reminder_hour`, which the notification cron reads — without it every reminder fires at a guessed time. It is the lowest-friction question in the set, so momentum into the magic moment is highest. And choosing a time is a micro-commitment, taken one screen before the paywall.

Its fourth option, *"I'd rather not be reminded"*, is real and is honoured — no reminder is ever sent to a user who picked it. Offering it costs some retention and buys the trust the whole product depends on. Track how often it's chosen; if it clears ~15% the question is being read as pressure and the copy needs work.

Answers are persisted to MMKV as they're given, so a killed app resumes where she left off, and synced to Supabase after auth.

### 5.2 Daily symptom tracker

34 symptoms across 6 categories — temperature, mood, cognitive, sleep, physical, cycle. Severity 1–4, selected visually. A complete log takes under 60 seconds.

Q2's twelve chips are the most-reported entry symptoms, not the full set; her selections there prioritise the tracker's default view.

### 5.3 Daily insight

One educational read per day, 90 seconds maximum, plain language, evidence-based. **90 insights minimum at launch** — three months with no repeat. Unlocks on a schedule, Duolingo-style, which is what the push notifications hang off.

### 5.4 Pattern view

Monthly calendar colour-coded by severity. Per-symptom trend chart. Correlations surfaced without AI — simple co-occurrence over a rolling window.

### 5.5 Health Report PDF

Generated on-device, monthly, exportable and downloadable. Designed to be handed to a physician. **This is the differentiator** — it is why she stays subscribed after her curiosity is satisfied.

### 5.6 Push notifications

Push token registered in Supabase on install. A Supabase Edge Function on a cron fires by user segment.

**Free (pre-paywall)** — value delivered at the right moment, not spam:
- *"Did you know anxiety spikes are one of the first signs of perimenopause? Open to learn why."*
- *"Your body has a pattern. Log today to start seeing it."*
- *"One insight is waiting for you today."*

**Trial, 3 days** — make her feel the value before it expires:
- Day 1 — *"Welcome to Nuva. Log your first symptoms — it takes 60 seconds."*
- Day 2 — *"Your first insight is ready. This one surprised a lot of women."*
- Day 3 — *"Your trial ends tonight. You've logged X symptoms. Keep your data."*

**Subscribed** — habit and retention: log reminders, insight unlocks, monthly Health Report ready.

### 5.7 Email — Resend

Secondary channel: welcome after signup, daily log reminder, insight unlock, Health Report ready, re-engagement after 3 days idle.

### 5.8 Auth

**Apple Sign In** — mandatory once any social login is offered; Apple reviews it during approval.
**Google OAuth** — `expo-auth-session` + Supabase Auth.

Both configured from day one.

---

## 6 · Tech stack

### Core

| | |
|---|---|
| **Expo SDK 57** | Framework |
| **Expo Router** (SDK-matched) | File-based navigation, typed routes enabled |
| **TypeScript** | Strict mode, day one, no `any` |

### UI

| | |
|---|---|
| **React Native StyleSheet** | Styling, driven by `constants/tokens.ts` |
| **Reanimated 4** | All animation, UI thread. Never the legacy `Animated` API |
| **Gesture Handler** | Gestures, swipes, taps |
| **react-native-svg** | `ArchHeader` arch paths and pattern charts. Not optional — `borderRadius` can't draw the arch |
| **expo-image** | Illustrations, with caching |
| **lucide-react-native** | Icons, outline only |
| **@expo-google-fonts** | Bricolage Grotesque, DM Sans |

### Backend

| | |
|---|---|
| **Supabase Postgres** | Primary database |
| **Supabase Auth** | Apple + Google |
| **Supabase Storage** | Generated PDFs |
| **Supabase Edge Functions** | Server logic, notification cron |
| **Row Level Security** | Enabled in the same migration that creates each table. Non-negotiable |
| **MMKV** | Local: onboarding state, cache, preferences |

### Services

| | |
|---|---|
| **Expo Push Notifications** | Native iOS push |
| **Resend** | Transactional email |
| **RevenueCat** | Subscriptions, trial, entitlements |
| **Superwall** | Paywall A/B testing without redeploy |
| **react-native-html-to-pdf** | On-device Health Report |
| **PostHog** | Funnels, retention, session recordings |
| **react-native-health** | Apple Health — **phase 2, not MVP** |

### MCP servers

| MCP | For | Priority |
|---|---|---|
| **Supabase** | Tables, queries, RLS, generated TS types | ⭐ before starting |
| **GitHub** | Commits, branches, PRs | ⭐ before starting |
| **Resend** | Email templates | later |
| **PostHog** | Events and funnels during development | later |

### Cost at MVP

Supabase (50K users / 500MB), RevenueCat (to $2.5K MTR), Superwall (to $1K MRR), Resend (3K emails/mo), PostHog (1M events/mo) and Expo are all free tier.

**$0/month until there's real revenue.**

---

## 7 · Data model sketch

Every table below ships with RLS enabled and an `auth.uid() = user_id` policy in the same migration. Types are generated from the schema — never hand-written.

```
profiles            id (= auth.users.id), created_at, stage, timezone,
                    push_token, onboarding_completed_at,
                    reminder_hour smallint null   -- from Q6; null = no reminders

onboarding_answers  user_id, question_key, answer (jsonb), answered_at

symptoms            id, slug, label, category, icon      -- seed data, 34 rows
symptom_logs        user_id, logged_on (date), symptom_id, severity (1..4)
                    unique (user_id, logged_on, symptom_id)

insights            id, slug, title, body, category, order_index  -- seed, 90+
insight_reads       user_id, insight_id, read_at

health_reports      user_id, period_start, period_end,
                    storage_path, generated_at

notification_queue  user_id, segment, template_key, send_at, sent_at
```

`symptom_logs` is the hot table — index on `(user_id, logged_on desc)`. Pattern view and the Health Report both read from it; nothing else should.

---

## 8 · Analytics events

Keep the list short enough to actually read. The onboarding funnel is the one that matters.

```
onboarding_started
onboarding_question_answered   { question_key, answer }
onboarding_abandoned           { last_question_key }
magic_moment_viewed
paywall_viewed                 { variant }
trial_started                  { plan }
subscription_started           { plan }

symptom_log_completed          { symptom_count, duration_ms }
insight_opened                 { insight_slug }
insight_completed              { insight_slug, dwell_ms }
pattern_view_opened
health_report_generated        { period_days, symptom_count }
health_report_exported         { destination }
```

`symptom_log_completed.duration_ms` is the product's health metric. If the median drifts above 60 seconds, the tracker needs work.

---

## 9 · Build order

Each milestone ends with something runnable on a device.

1. **Foundation** — Expo + Router + TS strict, fonts loaded and splash gated, `constants/` in place, grain and halftone texture assets, `ArchHeader` and the UI primitives from `DESIGN_SYSTEM.md §5`.
2. **Onboarding 1–4** — the four approved screens, pixel-matched to the mockups, answers to MMKV.
3. **Onboarding 5–8** — Q4–Q6, magic moment, paywall shell.
4. **Auth + Supabase** — Apple and Google, schema with RLS, sync MMKV answers up on first login.
5. **Paywall live** — RevenueCat entitlements, Superwall template matching the tokens, trial flow end to end.
6. **Tracker** — 34 symptoms, 6 categories, severity, the 60-second path.
7. **Insights** — content pipeline, daily unlock, read state.
8. **Patterns** — calendar and trend charts on `react-native-svg`.
9. **Health Report** — on-device PDF, Storage upload, export.
10. **Notifications + email** — Edge Function cron, the three segments, Resend templates.
11. **Analytics + polish** — PostHog wired, reduced-motion pass, 375px pass, store screenshots.

Apple Health is phase 2. Do not start it during the MVP.

---

## 10 · Voice

She has been talked down to by a medical system that didn't take her seriously. The product's voice is the opposite of that.

**Do:** plain language. Name the symptom. State the mechanism. Short sentences. Assume intelligence, never assume knowledge.
**Don't:** clinical hedging, cheerfulness, exclamation marks, emoji, "journey" as a euphemism, anything that sounds like a brochure.

> *"Estrogen doesn't decline smoothly. It swings — sometimes higher than it ever was in your twenties, then crashes. That's why the anxiety comes out of nowhere."*

That's the register. Sentence case, always.
