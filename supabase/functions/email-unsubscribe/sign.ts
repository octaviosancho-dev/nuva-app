/**
 * Signs and checks unsubscribe links: HMAC-SHA256 of the user id. Shared, by
 * copy, with email-unsubscribe — Edge Functions deploy one folder each.
 *
 * The key is EMAIL_SIGNING_SECRET when set, otherwise the service role key,
 * which only the server has. Rotating it invalidates old unsubscribe links,
 * which is acceptable: every new email carries a fresh one.
 */
function signingKey(): string {
  const key = Deno.env.get('EMAIL_SIGNING_SECRET') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!key) throw new Error('No signing key');
  return key;
}

const hex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

export async function sign(userId: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(signingKey()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`unsubscribe:${userId}`)));
}

/** Constant-time comparison, so the signature cannot be guessed byte by byte. */
export async function verify(userId: string, signature: string): Promise<boolean> {
  const expected = await sign(userId);
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}
