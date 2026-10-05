import {
  addDays,
  addMonths,
  daysBetween,
  monthsBetween,
  type LocalDate,
} from './dates';

export type RecurrenceUnit = 'day' | 'week' | 'month' | 'year';

export type Recurrence = {
  unit: RecurrenceUnit;
  interval: number;
};

function assertValid(recurrence: Recurrence) {
  if (!Number.isInteger(recurrence.interval) || recurrence.interval < 1) {
    throw new RangeError(`Invalid interval: ${recurrence.interval}`);
  }
}

// Always computed from the anchor, so a 31 Jan monthly item goes
// 28 Feb → 31 Mar instead of drifting to the 28th forever.
export function occurrence(
  anchor: LocalDate,
  recurrence: Recurrence,
  n: number,
): LocalDate {
  assertValid(recurrence);
  const steps = n * recurrence.interval;
  switch (recurrence.unit) {
    case 'day':
      return addDays(anchor, steps);
    case 'week':
      return addDays(anchor, steps * 7);
    case 'month':
      return addMonths(anchor, steps);
    case 'year':
      return addMonths(anchor, steps * 12);
  }
}

export function nextOccurrence(
  anchor: LocalDate,
  recurrence: Recurrence | null,
  onOrAfter: LocalDate,
): LocalDate | null {
  if (anchor >= onOrAfter) return anchor;
  if (!recurrence) return null;
  assertValid(recurrence);

  const stepSize =
    recurrence.unit === 'day'
      ? recurrence.interval
      : recurrence.unit === 'week'
        ? recurrence.interval * 7
        : recurrence.unit === 'month'
          ? recurrence.interval
          : recurrence.interval * 12;
  const distance =
    recurrence.unit === 'day' || recurrence.unit === 'week'
      ? daysBetween(anchor, onOrAfter)
      : monthsBetween(anchor, onOrAfter);

  let n = Math.max(1, Math.floor(distance / stepSize));
  while (occurrence(anchor, recurrence, n) < onOrAfter) n++;
  return occurrence(anchor, recurrence, n);
}

export function reminderDates(
  occurrenceDate: LocalDate,
  daysBefore: number[],
): LocalDate[] {
  return [...new Set(daysBefore)]
    .filter((d) => Number.isInteger(d) && d >= 0)
    .sort((a, b) => b - a)
    .map((d) => addDays(occurrenceDate, -d));
}
