# Schema

The live schema is the source of truth. `src/lib/supabase/database.types.ts` is
generated from it and is **never hand-edited** — when the schema changes,
regenerate:

```bash
npx supabase gen types typescript --project-id <project-ref> > src/lib/supabase/database.types.ts
```

or ask Claude to regenerate through the Supabase MCP, which is how the current
file was produced.

## Tables

Ten tables from `docs/PRODUCT_BRIEF.md` §7, plus `insight_reads`.

| Table | Holds | Written by |
|---|---|---|
| `profiles` | stage, timezone, push token, `reminder_hour` | the app |
| `onboarding_answers` | one row per question, `answer` as jsonb | the app, synced up from MMKV on first login |
| `symptoms` | the 34 symptoms — slug, label, category, icon | seed |
| `symptom_logs` | her daily log, severity 1–4 | the app |
| `validation_stats` | one line of human-written copy per symptom | seed |
| `insights` | 90+ educational reads, categorised | seed |
| `insight_reads` | which she has read | the app |
| `word_templates` | ~30 Find Your Words sentence templates | seed |
| `medications` | HRT and other treatment, with its own reminder hour | the app |
| `health_reports` | pointers to generated PDFs in Storage | the app |
| `notification_queue` | what the cron will send | the Edge Function |

## Row level security

**Every table has RLS enabled, in the same migration that created it.** No
exceptions — this is a health-data product and the policy is not something to
add later.

Two shapes:

- **Her data** — `profiles`, `onboarding_answers`, `symptom_logs`,
  `insight_reads`, `medications`, `health_reports`, `notification_queue` — get
  `(select auth.uid()) = user_id`, or `= id` on `profiles`, which *is* the auth
  user. `notification_queue` is read-only to her: the Edge Function writes it
  under the service role, which bypasses RLS.
- **Reference data** — `symptoms`, `validation_stats`, `insights`,
  `word_templates` — get RLS enabled with a single read policy for signed-in
  users. Leaving RLS off would make them world-readable through PostgREST;
  enabling it with no policy would make them unreadable to anyone. Writes have
  no policy at all, so they only happen through the service role.

The `(select ...)` wrapper is not cosmetic. Bare `auth.uid()` in a policy is
re-evaluated once per row; wrapped in a scalar subquery Postgres hoists it to an
InitPlan and evaluates it once per statement. On `symptom_logs` — the hot table,
read by the pattern view, Find Your Words and the Health Report — that is the
difference between a constant and a per-row function call.

## Seeds

`symptoms`, `validation_stats`, `insights` and `word_templates` are empty. They
hold written copy — 34 symptoms, one validation line each, 90+ insights, ~30
templates — and that copy does not exist yet. It is written by humans, not
generated, so the tables wait rather than getting filled with placeholders.
