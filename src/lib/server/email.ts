import 'server-only';
import { site } from '@/lib/core/site';
import type { EmailContent } from '@/lib/core/reminder-email';

export type OutgoingEmail = EmailContent & { to: string };

async function check(res: Response, service: string) {
  if (!res.ok) {
    throw new Error(
      `${service} ${res.status}: ${(await res.text()).slice(0, 300)}`,
    );
  }
}

/**
 * In local development MAILPIT_URL is set, and every email lands in the local
 * test inbox, even when a Resend key is present. Everywhere else, Resend sends.
 */
export async function sendEmail(email: OutgoingEmail): Promise<void> {
  const mailpit = process.env.MAILPIT_URL;
  if (mailpit) {
    const res = await fetch(`${mailpit.replace(/\/+$/, '')}/api/v1/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        From: { Email: 'reminders@kalends.local', Name: site.name },
        To: [{ Email: email.to }],
        Subject: email.subject,
        HTML: email.html,
        Text: email.text,
      }),
    });
    await check(res, 'Mailpit');
    return;
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM ?? `${site.name} <onboarding@resend.dev>`,
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });
    await check(res, 'Resend');
    return;
  }

  throw new Error(
    'No email transport: set RESEND_API_KEY (or MAILPIT_URL locally).',
  );
}
