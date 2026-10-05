export type LocalDate = string;

const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DAY_MS = 86_400_000;

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function parseDate(value: string) {
  const match = DATE.exec(value);
  if (!match) throw new RangeError(`Invalid date: ${value}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    throw new RangeError(`Invalid date: ${value}`);
  }
  return { year, month, day };
}

export function formatDate(
  year: number,
  month: number,
  day: number,
): LocalDate {
  const pad = (n: number, width = 2) => String(n).padStart(width, '0');
  return `${pad(year, 4)}-${pad(month)}-${pad(day)}`;
}

function toEpochDay(date: LocalDate): number {
  const { year, month, day } = parseDate(date);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

function fromEpochDay(epochDay: number): LocalDate {
  const d = new Date(epochDay * DAY_MS);
  return formatDate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

export function addDays(date: LocalDate, days: number): LocalDate {
  return fromEpochDay(toEpochDay(date) + days);
}

export function daysBetween(from: LocalDate, to: LocalDate): number {
  return toEpochDay(to) - toEpochDay(from);
}

export function addMonths(date: LocalDate, months: number): LocalDate {
  const { year, month, day } = parseDate(date);
  const index = year * 12 + (month - 1) + months;
  const targetYear = Math.floor(index / 12);
  const targetMonth = (index % 12) + 1;
  return formatDate(
    targetYear,
    targetMonth,
    Math.min(day, daysInMonth(targetYear, targetMonth)),
  );
}

export function monthsBetween(from: LocalDate, to: LocalDate): number {
  const a = parseDate(from);
  const b = parseDate(to);
  return (b.year - a.year) * 12 + (b.month - a.month);
}

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  let formatter = formatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatters.set(timeZone, formatter);
  }
  return formatter;
}

function wallClock(instant: number, timeZone: string) {
  const parts = Object.fromEntries(
    formatterFor(timeZone)
      .formatToParts(new Date(instant))
      .map((p) => [p.type, Number(p.value)]),
  );
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second,
  };
}

function offsetMs(instant: number, timeZone: string): number {
  const w = wallClock(instant, timeZone);
  const asUtc = Date.UTC(
    w.year,
    w.month - 1,
    w.day,
    w.hour,
    w.minute,
    w.second,
  );
  return asUtc - Math.floor(instant / 1000) * 1000;
}

export function todayIn(timeZone: string, now: Date = new Date()): LocalDate {
  const w = wallClock(now.getTime(), timeZone);
  return formatDate(w.year, w.month, w.day);
}

// A wall time skipped by a DST change resolves to the moment just after the jump.
export function zonedTimeToUtc(
  date: LocalDate,
  time: string,
  timeZone: string,
): Date {
  const { year, month, day } = parseDate(date);
  const match = TIME.exec(time);
  if (!match) throw new RangeError(`Invalid time: ${time}`);
  const wall = Date.UTC(
    year,
    month - 1,
    day,
    Number(match[1]),
    Number(match[2]),
  );
  const firstGuess = wall - offsetMs(wall, timeZone);
  return new Date(wall - offsetMs(firstGuess, timeZone));
}
