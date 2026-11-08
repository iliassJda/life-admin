import 'server-only';
import { buildReminderEmail } from '@/lib/core/reminder-email';
import type { LocalDate } from '@/lib/core/dates';
import type { ItemKind } from '@/lib/core/items';
import { sendEmail } from './email';

export type Channel = 'email';

export type ReminderUser = { id: string; email: string; today: LocalDate };
export type ReminderTarget = {
  id: string;
  kind: ItemKind;
  name: string;
  amount: number | null;
  currency: string;
  unused_since?: string | null;
};

/**
 * The single place a reminder leaves the app. New channels (web push, native
 * push) are added here; the scheduling logic never changes.
 */
export async function sendReminder(
  user: ReminderUser,
  item: ReminderTarget,
  occurrenceDate: LocalDate,
  channel: Channel,
): Promise<void> {
  switch (channel) {
    case 'email': {
      const content = buildReminderEmail({
        item: { ...item, unused: Boolean(item.unused_since) },
        occurrenceDate,
        today: user.today,
        appUrl: process.env.APP_URL ?? 'http://localhost:3000',
      });
      await sendEmail({ ...content, to: user.email });
      return;
    }
  }
}
