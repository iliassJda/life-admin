import 'server-only';
import { findCancelGuide } from '@/lib/core/cancel-guides';
import { buildReminderEmail } from '@/lib/core/reminder-email';
import type { LocalDate } from '@/lib/core/dates';
import type { ItemKind } from '@/lib/core/items';
import { sendEmail } from './email';
import { sendPushToUser } from './push';

export type Channel = 'email' | 'push';

export type ReminderUser = {
  id: string;
  email: string | null;
  today: LocalDate;
};
export type ReminderTarget = {
  id: string;
  kind: ItemKind;
  name: string;
  amount: number | null;
  currency: string;
  unused_since?: string | null;
};

/**
 * The single place a reminder leaves the app. Each channel words the same
 * reminder; the scheduling logic never changes when a channel is added.
 */
export async function sendReminder(
  user: ReminderUser,
  item: ReminderTarget,
  occurrenceDate: LocalDate,
  channel: Channel,
): Promise<void> {
  const content = buildReminderEmail({
    item: { ...item, unused: Boolean(item.unused_since) },
    occurrenceDate,
    today: user.today,
    appUrl: process.env.APP_URL ?? 'http://localhost:3000',
    cancelUrl: findCancelGuide(item.name)?.url ?? null,
  });

  switch (channel) {
    case 'email': {
      if (!user.email) throw new Error('No email address on the account');
      await sendEmail({ ...content, to: user.email });
      return;
    }
    case 'push': {
      const { devices, delivered } = await sendPushToUser(user.id, {
        title: content.subject,
        body: content.text.split('\n')[0],
        url: `/app/items/${item.id}`,
        tag: `${item.id}-${occurrenceDate}`,
      });
      if (delivered === 0) {
        throw new Error(
          devices === 0
            ? 'No devices with notifications on'
            : 'No device accepted the notification',
        );
      }
      return;
    }
  }
}
