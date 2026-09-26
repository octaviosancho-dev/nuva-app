/**
 * send-emails — runs every hour from the nuva-send-emails cron job.
 *
 * Asks public.email_due() who is due which email in their own timezone, then
 * sends each one through Resend from hello@nuvacare.app.
 *
 * Off until EMAIL_ENABLED=true is set as an Edge Function secret. Until then a
 * run is a dry run: it reports how many emails of each kind *would* go out, and
 * sends nothing. Turning it on is also the moment src/content/privacy.ts must
 * name Resend.
 *
 * Protection: a send run needs the x-nuva-cron header to match the token in
 * Vault (checked by public.email_cron_token_ok). `?preview=<template>` renders
 * an email with sample data and touches no user data, so it needs no token.
 *
 * Every email is claimed in email_log before it is sent. The table's unique
 * key (user, template, local date) means a doubled or retried run can never
 * send the same email twice.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

import { sign } from './sign.ts';
import { render, type EmailContext, type Template } from './templates.ts';

const FROM = 'Nuva <hello@nuvacare.app>';
/** The public site, on GitHub Pages under the nuvacare.app domain. */
const SITE_URL = (Deno.env.get('SITE_URL') ?? 'https://nuvacare.app').replace(/\/$/, '');
const PRIVACY_URL = `${SITE_URL}/privacy/`;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const TEMPLATES: Template[] = ['welcome', 'daily', 'report', 'reengage'];

/** Resend's default rate limit is 2 requests a second. */
const SEND_GAP_MS = 600;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

async function unsubscribeUrl(userId: string): Promise<string> {
  const sig = await sign(userId);
  return `${SUPABASE_URL}/functions/v1/email-unsubscribe?u=${encodeURIComponent(userId)}&t=${sig}`;
}

interface Due {
  user_id: string;
  email: string;
  template: Template;
  local_date: string;
  context: EmailContext;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // Preview: sample data only, never a real user.
  const preview = url.searchParams.get('preview') as Template | null;
  if (preview) {
    if (!TEMPLATES.includes(preview)) return json({ error: 'unknown template' }, 400);
    const rendered = render(preview, { month: 'September', days_logged: 19 }, {
      unsubscribe: `${SUPABASE_URL}/functions/v1/email-unsubscribe?u=preview&t=preview`,
      privacy: PRIVACY_URL,
    });
    const asText = url.searchParams.get('format') === 'text';
    return new Response(asText ? `Subject: ${rendered.subject}\n\n${rendered.text}` : rendered.html, {
      headers: { 'Content-Type': asText ? 'text/plain; charset=utf-8' : 'text/html; charset=utf-8' },
    });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  const { data: tokenOk, error: tokenError } = await admin.rpc('email_cron_token_ok', {
    token: req.headers.get('x-nuva-cron') ?? '',
  });
  if (tokenError) return json({ error: 'token check failed' }, 500);
  if (!tokenOk) return json({ error: 'unauthorized' }, 401);

  const { data, error } = await admin.rpc('email_due');
  if (error) return json({ error: `email_due failed: ${error.message}` }, 500);
  const due = (data ?? []) as Due[];

  const counts = Object.fromEntries(TEMPLATES.map((t) => [t, due.filter((d) => d.template === t).length]));

  if (Deno.env.get('EMAIL_ENABLED') !== 'true') {
    // Dry run: counts only, never addresses.
    return json({ enabled: false, due: counts });
  }

  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) return json({ error: 'RESEND_API_KEY is not set' }, 500);

  let sent = 0;
  let failed = 0;

  for (const d of due) {
    // Claim first; if the row already exists, another run sent it.
    const { data: claim } = await admin
      .from('email_log')
      .upsert(
        { user_id: d.user_id, template: d.template, sent_on: d.local_date },
        { onConflict: 'user_id,template,sent_on', ignoreDuplicates: true },
      )
      .select('id');
    const claimId = claim?.[0]?.id as string | undefined;
    if (!claimId) continue;

    const unsubscribe = await unsubscribeUrl(d.user_id);
    const email = render(d.template, d.context ?? {}, { unsubscribe, privacy: PRIVACY_URL });

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: FROM,
        to: [d.email],
        subject: email.subject,
        html: email.html,
        text: email.text,
        headers:
          d.template === 'welcome'
            ? undefined
            : {
                'List-Unsubscribe': `<${unsubscribe}>`,
                'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
              },
      }),
    });

    if (res.ok) {
      const body = (await res.json().catch(() => ({}))) as { id?: string };
      await admin.from('email_log').update({ resend_id: body.id ?? null }).eq('id', claimId);
      sent++;
    } else {
      // Release the claim so the next run can try again.
      await admin.from('email_log').delete().eq('id', claimId);
      failed++;
    }

    await new Promise((r) => setTimeout(r, SEND_GAP_MS));
  }

  return json({ enabled: true, due: counts, sent, failed });
});
