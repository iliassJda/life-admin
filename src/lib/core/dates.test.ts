import { describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  daysBetween,
  daysInMonth,
  isLeapYear,
  parseDate,
  todayIn,
  zonedTimeToUtc,
} from './dates';

describe('parseDate', () => {
  it('parses a valid date', () => {
    expect(parseDate('2026-10-05')).toEqual({ year: 2026, month: 10, day: 5 });
  });

  it.each(['2026-02-30', '2027-02-29', '2026-13-01', '2026-1-5', 'nope'])(
    'rejects %s',
    (value) => {
      expect(() => parseDate(value)).toThrow(RangeError);
    },
  );

  it('accepts 29 February in a leap year', () => {
    expect(parseDate('2028-02-29').day).toBe(29);
  });
});

describe('leap years', () => {
  it.each([
    [2024, true],
    [2026, false],
    [1900, false],
    [2000, true],
  ])('%i is leap: %s', (year, leap) => {
    expect(isLeapYear(year)).toBe(leap);
  });

  it('knows February length', () => {
    expect(daysInMonth(2027, 2)).toBe(28);
    expect(daysInMonth(2028, 2)).toBe(29);
  });
});

describe('addDays / daysBetween', () => {
  it('crosses month and year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2028-03-01', -1)).toBe('2028-02-29');
  });

  it('is unaffected by daylight saving changes', () => {
    expect(addDays('2026-03-28', 1)).toBe('2026-03-29');
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
  });

  it('counts days in both directions', () => {
    expect(daysBetween('2026-10-05', '2026-11-04')).toBe(30);
    expect(daysBetween('2026-11-04', '2026-10-05')).toBe(-30);
  });
});

describe('addMonths', () => {
  it('clamps the 31st to the end of shorter months', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonths('2028-01-31', 1)).toBe('2028-02-29');
    expect(addMonths('2026-03-31', 1)).toBe('2026-04-30');
  });

  it('crosses years in both directions', () => {
    expect(addMonths('2026-11-15', 3)).toBe('2027-02-15');
    expect(addMonths('2026-01-15', -2)).toBe('2025-11-15');
  });
});

describe('todayIn', () => {
  const lateEveningUtc = new Date('2026-10-05T22:30:00Z');

  it('uses the user’s own calendar day', () => {
    expect(todayIn('UTC', lateEveningUtc)).toBe('2026-10-05');
    expect(todayIn('Europe/Brussels', lateEveningUtc)).toBe('2026-10-06');
    expect(todayIn('America/New_York', lateEveningUtc)).toBe('2026-10-05');
  });
});

describe('zonedTimeToUtc', () => {
  it('converts summer and winter times in Brussels', () => {
    expect(
      zonedTimeToUtc('2026-07-01', '09:00', 'Europe/Brussels').toISOString(),
    ).toBe('2026-07-01T07:00:00.000Z');
    expect(
      zonedTimeToUtc('2026-12-01', '09:00', 'Europe/Brussels').toISOString(),
    ).toBe('2026-12-01T08:00:00.000Z');
  });

  it('handles the days the clocks change', () => {
    expect(
      zonedTimeToUtc('2026-03-29', '09:00', 'Europe/Brussels').toISOString(),
    ).toBe('2026-03-29T07:00:00.000Z');
    expect(
      zonedTimeToUtc('2026-10-25', '09:00', 'Europe/Brussels').toISOString(),
    ).toBe('2026-10-25T08:00:00.000Z');
  });

  it('moves a skipped wall time forward instead of failing', () => {
    expect(
      zonedTimeToUtc('2026-03-29', '02:30', 'Europe/Brussels').toISOString(),
    ).toBe('2026-03-29T01:30:00.000Z');
  });

  it('works far from UTC', () => {
    expect(
      zonedTimeToUtc('2026-10-05', '08:00', 'Asia/Tokyo').toISOString(),
    ).toBe('2026-10-04T23:00:00.000Z');
  });

  it('rejects invalid times', () => {
    expect(() => zonedTimeToUtc('2026-10-05', '24:00', 'UTC')).toThrow(
      RangeError,
    );
  });
});
