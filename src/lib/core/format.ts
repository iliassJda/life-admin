import { parseDate, type LocalDate } from './dates';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatLocalDate(date: LocalDate): string {
  const { year, month, day } = parseDate(date);
  return dateFormat.format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency }).format(
    amount,
  );
}
