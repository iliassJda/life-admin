import 'server-only';
import { todayIn } from '@/lib/core/dates';
import { dueReminders, type DueReminder } from '@/lib/core/reminders';
import { sendReminder, type Channel, type ReminderTarget } from './notify';
import { pushConfigured } from './push';
import { supabaseAdmin as db } from './supabase';

const MAX_ATTEMPTS = 3;
const RETRY_AFTER_MS = 30 * 60 * 1000;
const PAGE = 1000;

export type RunSummary = {
  due: number;
  sent: number;
  failed: number;
  skipped: number;
};

// PostgREST caps each response; read everything page by page.
async function fetchAll<T>(
  page: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await page(from, from + PAGE - 1);
    if (error) throw error;
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) return rows;
  }
}

/**
 * Claims a reminder before sending it. The send log's unique constraint means
 * only one run can claim a given reminder, so overlapping runs never double-send.
 * A failed send can be reclaimed for a retry after a pause, up to MAX_ATTEMPTS.
 */
async function claim(
  userId: string,
  due: DueReminder,
  channel: Channel,
  now: Date,
): Promise<string | null> {
  const key = {
    item_id: due.itemId,
    occurrence_date: due.occurrenceDate,
    days_before: due.daysBefore,
    channel,
  };

  const { data: fresh, error } = await db
    .from('notifications_sent')
    .upsert(
      {
        ...key,
        user_id: userId,
        status: 'pending',
        attempts: 1,
        last_attempt_at: now.toISOString(),
      },
      {
        onConflict: 'item_id,occurrence_date,days_before,channel',
        ignoreDuplicates: true,
      },
    )
    .select('id');
  if (error) throw error;
  if (fresh && fresh.length > 0) return fresh[0].id;

  const { data: existing } = await db
    .from('notifications_sent')
    .select('id, status, attempts, last_attempt_at')
    .match(key)
    .maybeSingle();
  if (
    !existing ||
    existing.status !== 'failed' ||
    existing.attempts >= MAX_ATTEMPTS ||
    (existing.last_attempt_at &&
      now.getTime() - Date.parse(existing.last_attempt_at) < RETRY_AFTER_MS)
  ) {
    return null;
  }

  // Only one run wins: the update matches the attempt count it read.
  const { data: retried } = await db
    .from('notifications_sent')
    .update({
      status: 'pending',
      attempts: existing.attempts + 1,
      last_attempt_at: now.toISOString(),
    })
    .eq('id', existing.id)
    .eq('status', 'failed')
    .eq('attempts', existing.attempts)
    .select('id');
  return retried && retried.length > 0 ? retried[0].id : null;
}

export async function runReminders(now = new Date()): Promise<RunSummary> {
  const summary: RunSummary = { due: 0, sent: 0, failed: 0, skipped: 0 };

  // Everyone with at least one channel: email turned on, or a device for push.
  const [profiles, devices] = await Promise.all([
    fetchAll((from, to) =>
      db
        .from('profiles')
        .select('id, time_zone, reminder_time, email_reminders')
        .order('id')
        .range(from, to),
    ),
    pushConfigured()
      ? fetchAll((from, to) =>
          db
            .from('push_subscriptions')
            .select('user_id')
            .order('id')
            .range(from, to),
        )
      : Promise.resolve([] as { user_id: string }[]),
  ]);
  const withDevices = new Set(devices.map((d) => d.user_id));
  const reachable = profiles.filter(
    (p) => p.email_reminders || withDevices.has(p.id),
  );
  if (reachable.length === 0) return summary;
  const userIds = reachable.map((p) => p.id);

  const [items, rules] = await Promise.all([
    fetchAll((from, to) =>
      db
        .from('items')
        .select(
          'id, user_id, kind, name, key_date, recurrence_unit, recurrence_interval, amount, currency, unused_since',
        )
        .in('user_id', userIds)
        .order('id')
        .range(from, to),
    ),
    fetchAll((from, to) =>
      db
        .from('reminder_rules')
        .select('user_id, item_id, days_before')
        .in('user_id', userIds)
        .order('id')
        .range(from, to),
    ),
  ]);

  for (const profile of reachable) {
    const own = items.filter((i) => i.user_id === profile.id);
    if (own.length === 0) continue;
    const due = dueReminders(
      own,
      rules.filter((r) => r.user_id === profile.id),
      {
        timeZone: profile.time_zone,
        reminderTime: profile.reminder_time,
        emailReminders: true,
      },
      now,
    );
    if (due.length === 0) continue;

    const channels: Channel[] = [];
    if (profile.email_reminders) channels.push('email');
    if (withDevices.has(profile.id)) channels.push('push');
    summary.due += due.length * channels.length;

    let email: string | null = null;
    if (profile.email_reminders) {
      const { data: auth } = await db.auth.admin.getUserById(profile.id);
      email = auth.user?.email ?? null;
    }
    const user = {
      id: profile.id,
      email,
      today: todayIn(profile.time_zone, now),
    };
    const byId = new Map<string, ReminderTarget>(own.map((i) => [i.id, i]));

    for (const reminder of due) {
      for (const channel of channels) {
        const id = await claim(profile.id, reminder, channel, now);
        if (!id) {
          summary.skipped++;
          continue;
        }
        try {
          await sendReminder(
            user,
            byId.get(reminder.itemId)!,
            reminder.occurrenceDate,
            channel,
          );
          await db
            .from('notifications_sent')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              last_error: null,
            })
            .eq('id', id);
          summary.sent++;
        } catch (err) {
          await db
            .from('notifications_sent')
            .update({
              status: 'failed',
              last_error: String(
                err instanceof Error ? err.message : err,
              ).slice(0, 500),
            })
            .eq('id', id);
          summary.failed++;
        }
      }
    }
  }

  return summary;
}
