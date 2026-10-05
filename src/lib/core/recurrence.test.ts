import { describe, expect, it } from 'vitest';
import { nextOccurrence, occurrence, reminderDates } from './recurrence';

const monthly = { unit: 'month', interval: 1 } as const;
const yearly = { unit: 'year', interval: 1 } as const;

describe('occurrence', () => {
  it('does not drift after a short month', () => {
    expect(occurrence('2027-01-31', monthly, 1)).toBe('2027-02-28');
    expect(occurrence('2027-01-31', monthly, 2)).toBe('2027-03-31');
    expect(occurrence('2027-01-31', monthly, 3)).toBe('2027-04-30');
  });

  it('keeps 29 February in leap years only', () => {
    expect(occurrence('2028-02-29', yearly, 1)).toBe('2029-02-28');
    expect(occurrence('2028-02-29', yearly, 4)).toBe('2032-02-29');
  });

  it('supports days, weeks and custom intervals', () => {
    expect(occurrence('2026-10-05', { unit: 'day', interval: 10 }, 2)).toBe(
      '2026-10-25',
    );
    expect(occurrence('2026-10-05', { unit: 'week', interval: 2 }, 1)).toBe(
      '2026-10-19',
    );
    expect(occurrence('2026-01-15', { unit: 'month', interval: 3 }, 2)).toBe(
      '2026-07-15',
    );
  });

  it('rejects intervals that are not positive whole numbers', () => {
    for (const interval of [0, -1, 1.5]) {
      expect(() =>
        occurrence('2026-01-01', { unit: 'day', interval }, 1),
      ).toThrow(RangeError);
    }
  });
});

describe('nextOccurrence', () => {
  it('returns the anchor when it is still upcoming', () => {
    expect(nextOccurrence('2026-12-01', monthly, '2026-10-05')).toBe(
      '2026-12-01',
    );
  });

  it('includes an occurrence on the reference day itself', () => {
    expect(nextOccurrence('2026-01-05', monthly, '2026-10-05')).toBe(
      '2026-10-05',
    );
  });

  it('finds the next monthly date, clamped in short months', () => {
    expect(nextOccurrence('2026-01-31', monthly, '2026-02-10')).toBe(
      '2026-02-28',
    );
    expect(nextOccurrence('2026-01-31', monthly, '2026-03-01')).toBe(
      '2026-03-31',
    );
  });

  it('finds the next yearly renewal and passport-style expiry', () => {
    expect(nextOccurrence('2023-11-28', yearly, '2026-10-05')).toBe(
      '2026-11-28',
    );
    expect(nextOccurrence('2024-02-29', yearly, '2026-10-05')).toBe(
      '2027-02-28',
    );
    expect(
      nextOccurrence(
        '2016-03-10',
        { unit: 'year', interval: 10 },
        '2026-10-05',
      ),
    ).toBe('2036-03-10');
  });

  it('handles day and week steps over long spans', () => {
    expect(
      nextOccurrence('2020-01-01', { unit: 'week', interval: 1 }, '2026-10-05'),
    ).toBe('2026-10-07');
    expect(
      nextOccurrence('2026-10-01', { unit: 'day', interval: 3 }, '2026-10-05'),
    ).toBe('2026-10-07');
  });

  it('returns null for a one-off date that has passed', () => {
    expect(nextOccurrence('2026-09-01', null, '2026-10-05')).toBeNull();
    expect(nextOccurrence('2027-03-01', null, '2026-10-05')).toBe('2027-03-01');
  });
});

describe('reminderDates', () => {
  it('lists reminder days earliest first', () => {
    expect(reminderDates('2026-11-28', [1, 30, 7])).toEqual([
      '2026-10-29',
      '2026-11-21',
      '2026-11-27',
    ]);
  });

  it('ignores duplicates and invalid offsets', () => {
    expect(reminderDates('2026-03-01', [7, 7, -2, 1.5, 0])).toEqual([
      '2026-02-22',
      '2026-03-01',
    ]);
  });
});
