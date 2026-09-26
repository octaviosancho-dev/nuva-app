/**
 * email-unsubscribe — the "Stop these emails" link and the one-click
 * List-Unsubscribe endpoint.
 *
 * The link carries the user id and an HMAC of it (see sign.ts), so it works
 * without signing in and cannot be forged for someone else. It turns
 * profiles.email_reminders off; the one-time welcome email is not affected
 * because it is never repeated.
 *
 * GET redirects to a confirmation page on the public site. Supabase serves
 * function responses as text/plain, so an HTML page from here would show as
 * raw markup. POST (one-click, from the mail client) just returns 200.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

import { verify } from './sign.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
/** Where the static pages live. GitHub forwards this to nuvacare.app once the domain is set. */
const SITE_URL = (Deno.env.get('SITE_URL') ?? 'https://octaviosancho-dev.github.io/nuva-app').replace(/\/$/, '');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const redirect = (path: string) => new Response(null, { status: 303, headers: { Location: `${SITE_URL}${path}` } });

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const userId = url.searchParams.get('u') ?? '';
  const signature = url.searchParams.get('t') ?? '';
  const oneClick = req.method === 'POST';

  if (!UUID.test(userId) || !(await verify(userId, signature))) {
    return oneClick ? new Response('invalid link', { status: 400 }) : redirect('/email/link-invalid/');
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
  const { error } = await admin.rpc('email_unsubscribe', { target: userId });
  if (error) {
    return new Response('Your preference was not changed. Please try the link again in a moment.', {
      status: 500,
    });
  }

  return oneClick ? new Response('ok') : redirect('/email/unsubscribed/');
});
