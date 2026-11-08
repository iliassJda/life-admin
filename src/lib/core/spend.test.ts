import { describe, expect, it } from 'vitest';
import {
  describeRepeat,
  summarizeSpend,
  yearlyCost,
  type SpendItem,
} from './spend';

const item = (over: Partial<SpendItem>): SpendItem => ({
  id: over.name ?? 'x',
  name: 'x',
  kind: 'subscription',
  amount: 10,
  currency: 'EUR',
  recurrence_unit: 'month',
  recurrence_interval: 1,
  unused_since: null,
  ...over,
});

describe('yearlyCost', () => {
  it('scales each schedule to a year', () => {
    expect(yearlyCost(item({ amount: 15.99 }))).toBeCloseTo(191.88);
    expect(yearlyCost(item({ amount: 120, recurrence_unit: 'year' }))).toBe(
      120,
    );
    expect(yearlyCost(item({ amount: 30, recurrence_interval: 3 }))).toBe(120);
    expect(yearlyCost(item({ amount: 5, recurrence_unit: 'week' }))).toBe(260);
    expect(
      yearlyCost(
        item({ amount: 400, recurrence_unit: 'year', recurrence_interval: 2 }),
      ),
    ).toBe(200);
  });

  it('ignores one-off items and items without an amount', () => {
    expect(
      yearlyCost(item({ recurrence_unit: null, recurrence_interval: null })),
    ).toBeNull();
    expect(yearlyCost(item({ amount: null }))).toBeNull();
  });
});

describe('summarizeSpend', () => {
  const items = [
    item({ name: 'Netflix', amount: 15.99 }),
    item({
      name: 'Spotify',
      amount: 11.99,
      unused_since: '2026-11-01T00:00:00Z',
    }),
    item({
      name: 'Car insurance',
      kind: 'contract',
      amount: 487,
      recurrence_unit: 'year',
    }),
    item({
      name: 'Passport',
      kind: 'document',
      amount: null,
      recurrence_unit: null,
      recurrence_interval: null,
    }),
    item({ name: 'US app', amount: 4.99, currency: 'USD' }),
  ];

  it('totals per currency, most expensive first', () => {
    const [eur, usd] = summarizeSpend(items);
    expect(eur.currency).toBe('EUR');
    expect(eur.yearly).toBe(822.76); // 191.88 + 143.88 + 487
    expect(eur.monthly).toBe(68.56);
    expect(eur.subscriptionsYearly).toBe(335.76);
    expect(eur.subscriptionsMonthly).toBe(27.98);
    expect(eur.unusedYearly).toBe(143.88);
    expect(eur.rows.map((r) => r.item.name)).toEqual([
      'Car insurance',
      'Netflix',
      'Spotify',
    ]);
    expect(usd).toMatchObject({ currency: 'USD', yearly: 59.88 });
  });

  it('never mixes currencies and skips items with no repeating cost', () => {
    const all = summarizeSpend(items).flatMap((g) =>
      g.rows.map((r) => r.item.name),
    );
    expect(all).not.toContain('Passport');
    expect(summarizeSpend([])).toEqual([]);
  });

  it('marks unused rows', () => {
    const spotify = summarizeSpend(items)[0].rows.find(
      (r) => r.item.name === 'Spotify',
    );
    expect(spotify?.unused).toBe(true);
  });
});

describe('describeRepeat', () => {
  it('reads naturally', () => {
    expect(describeRepeat('month', 1)).toBe('Monthly');
    expect(describeRepeat('month', 3)).toBe('Every 3 months');
    expect(describeRepeat(null, null)).toBe('Once');
  });
});
