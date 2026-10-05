import { describe, expect, it } from 'vitest';
import { buildUpcoming, describeDaysUntil } from './upcoming';

const item = (
  name: string,
  key_date: string,
  recurrence_unit: 'month' | 'year' | null = null,
  recurrence_interval: number | null = null,
) => ({ name, key_date, recurrence_unit, recurrence_interval });

describe('buildUpcoming', () => {
  const today = '2026-10-05';

  it('groups by how soon the next date is', () => {
    const groups = buildUpcoming(
      [
        item('Later doc', '2027-03-01'),
        item('Netflix', '2026-01-08', 'month', 1),
        item('Insurance', '2025-10-30', 'year', 1),
        item('Expired ID', '2026-09-20'),
        item('Today', '2026-10-05'),
      ],
      today,
    );

    expect(groups.week.map((e) => [e.item.name, e.date, e.daysUntil])).toEqual([
      ['Today', '2026-10-05', 0],
      ['Netflix', '2026-10-08', 3],
    ]);
    expect(groups.month.map((e) => e.item.name)).toEqual(['Insurance']);
    expect(groups.month[0].date).toBe('2026-10-30');
    expect(groups.later.map((e) => e.item.name)).toEqual(['Later doc']);
    expect(groups.past.map((e) => [e.item.name, e.daysUntil])).toEqual([
      ['Expired ID', -15],
    ]);
  });

  it('puts the 7-day and 31-day boundaries in the nearer group', () => {
    const groups = buildUpcoming(
      [
        item('Day 7', '2026-10-12'),
        item('Day 31', '2026-11-05'),
        item('Day 32', '2026-11-06'),
      ],
      today,
    );
    expect(groups.week.map((e) => e.item.name)).toEqual(['Day 7']);
    expect(groups.month.map((e) => e.item.name)).toEqual(['Day 31']);
    expect(groups.later.map((e) => e.item.name)).toEqual(['Day 32']);
  });
});

describe('describeDaysUntil', () => {
  it.each([
    [0, 'Today'],
    [1, 'Tomorrow'],
    [12, 'In 12 days'],
    [-1, 'Yesterday'],
    [-4, '4 days ago'],
  ])('%i → %s', (days, text) => {
    expect(describeDaysUntil(days)).toBe(text);
  });
});
