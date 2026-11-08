import { addDays, todayIn, zonedTimeToUtc, type LocalDate } from './dates';
import {
  nextOccurrence,
  occurrence,
  type Recurrence,
  type RecurrenceUnit,
} from './recurrence';

/** Reminders whose send time passed longer ago than this are skipped, not sent late. */
export const CATCH_UP_MS = 36 * 60 * 60 * 1000;

export type ReminderProfile = {
  timeZone: string;
  /** "HH:MM" or "HH:MM:SS" in the user's time zone. */
  reminderTime: string;
  emailReminders: boolean;
};

export type ReminderItem = {
  id: string;
  key_date: LocalDate;
  recurrence_unit: RecurrenceUnit | null;
  recurrence_interval: number | null;
};

export type ReminderRule = {
  item_id: string | null;
  days_before: number;
};

export type DueReminder = {
  itemId: string;
  occurrenceDate: LocalDate;
  daysBefore: number;
  /** When the reminder was meant to go out. */
  dueAt: Date;
};

function recurrenceOf(item: ReminderItem): Recurrence | null {
  return item.recurrence_unit && item.recurrence_interval
    ? { unit: item.recurrence_unit, interval: item.recurrence_interval }
    : null;
}

/** An item's own rules replace the user's defaults; otherwise the defaults apply. */
export function effectiveDaysBefore(
  itemId: string,
  rules: ReminderRule[],
): number[] {
  const own = rules.filter((r) => r.item_id === itemId);
  const source = own.length > 0 ? own : rules.filter((r) => r.item_id === null);
  return [...new Set(source.map((r) => r.days_before))].sort((a, b) => b - a);
}

function hhmm(time: string): string {
  return time.slice(0, 5);
}

/**
 * Every reminder that should have gone out by `now` and is not older than the
 * catch-up window. Duplicates are not this function's concern: the send log's
 * unique constraint makes sending each one at most once.
 */
export function dueReminders(
  items: ReminderItem[],
  rules: ReminderRule[],
  profile: ReminderProfile,
  now: Date,
): DueReminder[] {
  if (!profile.emailReminders) return [];
  const today = todayIn(profile.timeZone, now);
  const time = hhmm(profile.reminderTime);
  const due: DueReminder[] = [];

  for (const item of items) {
    const offsets = effectiveDaysBefore(item.id, rules);
    if (offsets.length === 0) continue;
    const furthest = offsets[0];
    const recurrence = recurrenceOf(item);

    // Past occurrences get no reminders; their moment is gone.
    const first = nextOccurrence(item.key_date, recurrence, today);
    if (!first) continue;

    // Later occurrences matter too when the item repeats more often than its
    // longest reminder (a weekly item with a 30-day reminder). They are
    // counted from the anchor so month-end dates don't drift.
    let n = 0;
    if (recurrence) {
      while (occurrence(item.key_date, recurrence, n) < first) n++;
    }
    let occ: LocalDate = first;

    for (let guard = 0; guard < 500; guard++) {
      if (addDays(occ, -furthest) > today) break;
      for (const daysBefore of offsets) {
        const sendDate = addDays(occ, -daysBefore);
        if (sendDate > today) continue;
        const dueAt = zonedTimeToUtc(sendDate, time, profile.timeZone);
        const age = now.getTime() - dueAt.getTime();
        if (age >= 0 && age <= CATCH_UP_MS) {
          due.push({ itemId: item.id, occurrenceDate: occ, daysBefore, dueAt });
        }
      }
      if (!recurrence) break;
      n++;
      occ = occurrence(item.key_date, recurrence, n);
    }
  }

  return due.sort((a, b) => a.dueAt.getTime() - b.dueAt.getTime());
}
