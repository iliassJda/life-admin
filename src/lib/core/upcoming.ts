import { daysBetween, type LocalDate } from './dates';
import { nextOccurrence, type RecurrenceUnit } from './recurrence';

export type UpcomingGroup = 'past' | 'week' | 'month' | 'later';

export const GROUP_LABELS: Record<UpcomingGroup, string> = {
  past: 'Past due',
  week: 'This week',
  month: 'This month',
  later: 'Later',
};

type Schedulable = {
  key_date: string;
  recurrence_unit: RecurrenceUnit | null;
  recurrence_interval: number | null;
};

export type UpcomingEntry<T> = {
  item: T;
  date: LocalDate;
  daysUntil: number;
};

export function buildUpcoming<T extends Schedulable>(
  items: T[],
  today: LocalDate,
): Record<UpcomingGroup, UpcomingEntry<T>[]> {
  const groups: Record<UpcomingGroup, UpcomingEntry<T>[]> = {
    past: [],
    week: [],
    month: [],
    later: [],
  };

  for (const item of items) {
    const recurrence =
      item.recurrence_unit && item.recurrence_interval
        ? { unit: item.recurrence_unit, interval: item.recurrence_interval }
        : null;
    const date =
      nextOccurrence(item.key_date, recurrence, today) ?? item.key_date;
    const daysUntil = daysBetween(today, date);
    const group: UpcomingGroup =
      daysUntil < 0
        ? 'past'
        : daysUntil <= 7
          ? 'week'
          : daysUntil <= 31
            ? 'month'
            : 'later';
    groups[group].push({ item, date, daysUntil });
  }

  for (const entries of Object.values(groups)) {
    entries.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  }
  return groups;
}

export function describeDaysUntil(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days === -1) return 'Yesterday';
  return days > 0 ? `In ${days} days` : `${-days} days ago`;
}
