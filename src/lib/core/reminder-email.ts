import { daysBetween, type LocalDate } from './dates';
import { formatAmount, formatLocalDate } from './format';
import type { ItemKind } from './items';
import { site } from './site';

export type ReminderEmailInput = {
  item: {
    id: string;
    kind: ItemKind;
    name: string;
    amount: number | null;
    currency: string;
    /** Marked as no longer used: the email nudges to cancel. */
    unused?: boolean;
  };
  occurrenceDate: LocalDate;
  /** The user's local date when the email is built. */
  today: LocalDate;
  appUrl: string;
  /** Official cancellation help, shown when the item is marked unused. */
  cancelUrl?: string | null;
};

export type EmailContent = { subject: string; text: string; html: string };

const VERB: Record<ItemKind, string> = {
  subscription: 'renews',
  document: 'expires',
  contract: 'renews or ends',
};

function when(days: number): string {
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** The reminder email, worded calmly: what, when, and a link to decide. */
export function buildReminderEmail(input: ReminderEmailInput): EmailContent {
  const { item, occurrenceDate, today, appUrl } = input;
  const cancelUrl = item.unused ? (input.cancelUrl ?? null) : null;
  const days = daysBetween(today, occurrenceDate);
  const verb = VERB[item.kind];
  const subject = item.unused
    ? `Cancel ${item.name}? It ${verb} ${when(days)}`
    : `${item.name} ${verb} ${when(days)}`;
  const date = formatLocalDate(occurrenceDate);
  const amount =
    item.amount !== null ? formatAmount(item.amount, item.currency) : null;
  const base = appUrl.replace(/\/+$/, '');
  const itemUrl = `${base}/app/items/${item.id}`;
  const settingsUrl = `${base}/app/settings`;

  const detail = amount
    ? `${item.name} ${verb} on ${date}, for ${amount}.`
    : `${item.name} ${verb} on ${date}.`;
  const nudge = item.unused
    ? `You marked this as no longer used. Cancel before ${date} to avoid paying again.`
    : item.kind === 'document'
      ? 'If you need it, now is a good time to start the renewal.'
      : 'If you still want it, there is nothing to do. If not, now is the time to decide.';

  const text = [
    detail,
    '',
    nudge,
    ...(cancelUrl ? ['', `How to cancel: ${cancelUrl}`] : []),
    '',
    `Open it in ${site.name}: ${itemUrl}`,
    '',
    '—',
    `${site.name}. ${site.tagline}`,
    `Change when you get reminders: ${settingsUrl}`,
  ].join('\n');

  const html = `<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#f4f4f2;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:6px;">
        <tr><td style="background:#0a0b0c;padding:18px 28px;border-radius:6px 6px 0 0;font:700 20px Arial,Helvetica,sans-serif;color:#f2efe7;">
          ${escapeHtml(site.name)}<span style="color:#ffc20e;">.</span>
        </td></tr>
        <tr><td style="padding:28px 28px 8px;font:700 22px/1.3 Arial,Helvetica,sans-serif;color:#0a0b0c;">
          ${escapeHtml(subject)}
        </td></tr>
        <tr><td style="padding:0 28px;font:16px/1.6 Arial,Helvetica,sans-serif;color:#3b3e42;">
          <p style="margin:0 0 12px;">${escapeHtml(detail)}</p>
          <p style="margin:0 0 ${cancelUrl ? '12' : '24'}px;">${escapeHtml(nudge)}</p>${
            cancelUrl
              ? `
          <p style="margin:0 0 24px;"><a href="${escapeHtml(cancelUrl)}" style="color:#0a0b0c;font-weight:700;">How to cancel</a></p>`
              : ''
          }
        </td></tr>
        <tr><td style="padding:0 28px 32px;">
          <a href="${escapeHtml(itemUrl)}" style="display:inline-block;background:#ffc20e;color:#0a0b0c;font:700 15px Arial,Helvetica,sans-serif;text-decoration:none;padding:13px 20px;border-radius:3px;">Open in ${escapeHtml(site.name)}</a>
        </td></tr>
      </table>
      <p style="max-width:520px;margin:16px auto 0;font:13px/1.5 Arial,Helvetica,sans-serif;color:#6b6e72;">
        ${escapeHtml(site.tagline)} <a href="${escapeHtml(settingsUrl)}" style="color:#6b6e72;">Change when you get reminders</a>.
      </p>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}
