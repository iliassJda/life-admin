import 'server-only';
import { site } from '@/lib/core/site';
import type { EmailContent } from '@/lib/core/reminder-email';

export type OutgoingEmail = EmailContent & { to: string };

/**
 * Sends through Resend when RESEND_API_KEY is set. In local development,
 * MAILPIT_URL catches every email in the local inbox instead.
 */
export async function sendEmail(email: OutgoingEmail): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? `${site.name} <onboarding@resend.dev>`;

  if (resendKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
      }),
    });
    if (!res.ok) {
      throw new Error(
        `Resend ${res.status}: ${(await res.text()).slice(0, 300)}`,
      );
    }
    return;
  }

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
    if (!res.ok) {
      throw new Error(
        `Mailpit ${res.status}: ${(await res.text()).slice(0, 300)}`,
      );
    }
    return;
  }

  throw new Error(
    'No email transport: set RESEND_API_KEY (or MAILPIT_URL locally).',
  );
}
