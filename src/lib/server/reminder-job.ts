import 'server-only';
import { todayIn } from '@/lib/core/dates';
import { dueReminders, type DueReminder } from '@/lib/core/reminders';
import { sendReminder, type Channel, type ReminderTarget } from './notify';
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

  const profiles = await fetchAll((from, to) =>
    db
      .from('profiles')
      .select('id, time_zone, reminder_time, email_reminders')
      .eq('email_reminders', true)
      .order('id')
      .range(from, to),
  );
  if (profiles.length === 0) return summary;
  const userIds = profiles.map((p) => p.id);

  const [items, rules] = await Promise.all([
    fetchAll((from, to) =>
      db
        .from('items')
        .select(
          'id, user_id, kind, name, key_date, recurrence_unit, recurrence_interval, amount, currency',
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

  for (const profile of profiles) {
    const own = items.filter((i) => i.user_id === profile.id);
    if (own.length === 0) continue;
    const due = dueReminders(
      own,
      rules.filter((r) => r.user_id === profile.id),
      {
        timeZone: profile.time_zone,
        reminderTime: profile.reminder_time,
        emailReminders: profile.email_reminders,
      },
      now,
    );
    if (due.length === 0) continue;
    summary.due += due.length;

    const { data: auth } = await db.auth.admin.getUserById(profile.id);
    const email = auth.user?.email;
    if (!email) {
      summary.skipped += due.length;
      continue;
    }
    const user = {
      id: profile.id,
      email,
      today: todayIn(profile.time_zone, now),
    };
    const byId = new Map<string, ReminderTarget>(own.map((i) => [i.id, i]));

    for (const reminder of due) {
      const id = await claim(profile.id, reminder, 'email', now);
      if (!id) {
        summary.skipped++;
        continue;
      }
      try {
        await sendReminder(
          user,
          byId.get(reminder.itemId)!,
          reminder.occurrenceDate,
          'email',
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
            last_error: String(err instanceof Error ? err.message : err).slice(
              0,
              500,
            ),
          })
          .eq('id', id);
        summary.failed++;
      }
    }
  }

  return summary;
}
