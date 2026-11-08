import type { ItemKind } from './items';
import type { RecurrenceUnit } from './recurrence';

export type SpendItem = {
  id: string;
  name: string;
  kind: ItemKind;
  amount: number | null;
  currency: string;
  recurrence_unit: RecurrenceUnit | null;
  recurrence_interval: number | null;
  unused_since: string | null;
};

const PER_YEAR: Record<RecurrenceUnit, number> = {
  day: 365,
  week: 52,
  month: 12,
  year: 1,
};

/** What a repeating charge costs over a year, or null if it doesn't repeat or has no amount. */
export function yearlyCost(item: SpendItem): number | null {
  if (
    item.amount === null ||
    !item.recurrence_unit ||
    !item.recurrence_interval
  ) {
    return null;
  }
  return (
    (Number(item.amount) * PER_YEAR[item.recurrence_unit]) /
    item.recurrence_interval
  );
}

const round = (n: number) => Math.round(n * 100) / 100;

export type SpendRow = {
  item: SpendItem;
  monthly: number;
  yearly: number;
  unused: boolean;
};

export type CurrencySpend = {
  currency: string;
  monthly: number;
  yearly: number;
  /** Subscriptions only, the roadmap's headline figure. */
  subscriptionsMonthly: number;
  subscriptionsYearly: number;
  /** What the items marked as no longer used cost per year. */
  unusedYearly: number;
  rows: SpendRow[];
};

/**
 * Repeating costs per currency, most expensive first. Amounts in different
 * currencies are never added together.
 */
export function summarizeSpend(items: SpendItem[]): CurrencySpend[] {
  const byCurrency = new Map<string, CurrencySpend>();
  for (const item of items) {
    const yearly = yearlyCost(item);
    if (yearly === null) continue;
    let group = byCurrency.get(item.currency);
    if (!group) {
      group = {
        currency: item.currency,
        monthly: 0,
        yearly: 0,
        subscriptionsMonthly: 0,
        subscriptionsYearly: 0,
        unusedYearly: 0,
        rows: [],
      };
      byCurrency.set(item.currency, group);
    }
    const unused = item.unused_since !== null;
    group.yearly += yearly;
    if (item.kind === 'subscription') group.subscriptionsYearly += yearly;
    if (unused) group.unusedYearly += yearly;
    group.rows.push({
      item,
      yearly: round(yearly),
      monthly: round(yearly / 12),
      unused,
    });
  }

  return [...byCurrency.values()]
    .map((g) => ({
      ...g,
      yearly: round(g.yearly),
      monthly: round(g.yearly / 12),
      subscriptionsYearly: round(g.subscriptionsYearly),
      subscriptionsMonthly: round(g.subscriptionsYearly / 12),
      unusedYearly: round(g.unusedYearly),
      rows: g.rows.sort((a, b) => b.yearly - a.yearly),
    }))
    .sort((a, b) => b.yearly - a.yearly);
}

export function describeRepeat(
  unit: RecurrenceUnit | null,
  interval: number | null,
): string {
  if (!unit || !interval) return 'Once';
  if (interval === 1) {
    return { day: 'Daily', week: 'Weekly', month: 'Monthly', year: 'Yearly' }[
      unit
    ];
  }
  return `Every ${interval} ${unit}s`;
}
