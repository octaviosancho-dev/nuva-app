/**
 * The four emails. Copy follows CLAUDE.md: plain, sentence case, numerals,
 * no exclamation marks, and a gap is never a failure.
 *
 * Colours are the light palette from design/tokens.json. Email clients cannot
 * read the app's tokens, so the few values used are copied here by name.
 */
const C = {
  canvas: '#faf5ee',
  surface: '#fffcf7',
  night: '#2a2342',
  textOnNight: '#fdf8f1',
  textPrimary: '#1f1b2e',
  textSecondary: '#57506b',
  textTertiary: '#6e6684',
  line: '#e6daca',
  textLink: '#b0442b',
};

export type Template = 'welcome' | 'daily' | 'report' | 'reengage';

export interface EmailContext {
  month?: string;
  days_logged?: number;
}

export interface Rendered {
  subject: string;
  html: string;
  text: string;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

interface Copy {
  subject: string;
  preheader: string;
  heading: string;
  paragraphs: string[];
  /** Why she is getting it. Reminder emails carry the unsubscribe link. */
  footer: string;
  unsubscribable: boolean;
}

function copyFor(template: Template, ctx: EmailContext): Copy {
  switch (template) {
    case 'welcome':
      return {
        subject: 'Welcome to Nuva',
        preheader: 'Everything you logged before signing in came with you.',
        heading: 'Your account is set up.',
        paragraphs: [
          'Everything you logged before signing in came with you, and it is now tied to your account rather than to one phone.',
          'Nuva works best a little at a time. About 60 seconds in the evening is enough for a pattern to show within a few weeks.',
          'If you would like a daily reminder by email as well as on your phone, you can turn it on in Settings.',
        ],
        footer: 'This is a one-time email about your account.',
        unsubscribable: false,
      };
    case 'daily':
      return {
        subject: 'Your body has a pattern',
        preheader: 'Log today to start seeing it. It takes about 60 seconds.',
        heading: 'Your body has a pattern.',
        paragraphs: [
          'Log today to start seeing it. It takes about 60 seconds, in the app on your phone.',
          'Today’s insight is waiting there too, picked from what you have been logging.',
        ],
        footer: 'You get this because you turned on email reminders in Nuva.',
        unsubscribable: true,
      };
    case 'report': {
      const month = ctx.month ?? 'Last month';
      const days = ctx.days_logged ?? 0;
      return {
        subject: `Your ${month} report is ready`,
        preheader: `A summary of ${days} logged ${days === 1 ? 'day' : 'days'}, built on your phone.`,
        heading: `Your ${month} report is ready.`,
        paragraphs: [
          `You logged ${days} ${days === 1 ? 'day' : 'days'} in ${month}. The summary is ready in the app, under You › Health report.`,
          'It is built on your phone when you open it, as a PDF for a menopause specialist. For a GP appointment, the sentences in Find your words usually do more.',
        ],
        footer: 'You get this because you turned on email reminders in Nuva.',
        unsubscribable: true,
      };
    }
    case 'reengage':
      return {
        subject: 'Whenever you are ready',
        preheader: 'A gap is not a failure. One log picks the pattern back up.',
        heading: 'Whenever you are ready.',
        paragraphs: [
          'It has been 3 days since your last log. That is fine. A gap is not a failure, and nothing is counted against you.',
          'When you are ready, one log picks the pattern back up.',
        ],
        footer: 'You get this because you turned on email reminders in Nuva.',
        unsubscribable: true,
      };
  }
}

export function render(
  template: Template,
  ctx: EmailContext,
  links: { unsubscribe: string; privacy: string },
): Rendered {
  const c = copyFor(template, ctx);

  const paragraphs = c.paragraphs
    .map(
      (p, i) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:26px;color:${i === 0 ? C.textPrimary : C.textSecondary};">${esc(p)}</p>`,
    )
    .join('');

  const footerLinks = [
    c.unsubscribable
      ? `<a href="${esc(links.unsubscribe)}" style="color:${C.textLink};text-decoration:underline;">Stop these emails</a>`
      : '',
    `<a href="${esc(links.privacy)}" style="color:${C.textLink};text-decoration:underline;">Privacy</a>`,
  ]
    .filter(Boolean)
    .join(' &nbsp;·&nbsp; ');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(c.subject)}</title>
</head>
<body style="margin:0;padding:0;background:${C.canvas};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(c.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.canvas};">
  <tr><td align="center" style="padding:24px 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
      <tr><td style="background:${C.night};border-radius:22px 22px 0 0;padding:28px 28px 32px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:17px;color:${C.textOnNight};">Nuva</div>
        <h1 style="margin:18px 0 0;font-family:Georgia,'Times New Roman',serif;font-weight:600;font-size:26px;line-height:32px;color:${C.textOnNight};">${esc(c.heading)}</h1>
      </td></tr>
      <tr><td style="background:${C.surface};border-radius:0 0 22px 22px;padding:28px;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;">
        ${paragraphs}
      </td></tr>
      <tr><td style="padding:20px 8px 0;font-family:-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:${C.textTertiary};">
        ${esc(c.footer)}<br>${footerLinks}
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    c.heading,
    '',
    ...c.paragraphs.flatMap((p) => [p, '']),
    c.footer,
    c.unsubscribable ? `Stop these emails: ${links.unsubscribe}` : '',
    `Privacy: ${links.privacy}`,
  ]
    .filter((l, i, a) => !(l === '' && a[i - 1] === ''))
    .join('\n');

  return { subject: c.subject, html, text };
}
