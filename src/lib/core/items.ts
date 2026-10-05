import { parseDate, type LocalDate } from './dates';
import type { Recurrence, RecurrenceUnit } from './recurrence';

export const ITEM_KINDS = ['subscription', 'document', 'contract'] as const;
export type ItemKind = (typeof ITEM_KINDS)[number];

export const KIND_LABELS: Record<ItemKind, string> = {
  subscription: 'Subscription',
  document: 'Document',
  contract: 'Contract',
};

export const DATE_LABELS: Record<ItemKind, string> = {
  subscription: 'Next renewal',
  document: 'Expires on',
  contract: 'Renews or ends on',
};

export const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF'] as const;

export const REPEAT_OPTIONS = [
  { value: 'none', label: 'Doesn’t repeat' },
  { value: '1-week', label: 'Every week' },
  { value: '1-month', label: 'Every month' },
  { value: '3-month', label: 'Every 3 months' },
  { value: '6-month', label: 'Every 6 months' },
  { value: '1-year', label: 'Every year' },
  { value: '2-year', label: 'Every 2 years' },
  { value: '5-year', label: 'Every 5 years' },
  { value: '10-year', label: 'Every 10 years' },
] as const;

const UNITS: RecurrenceUnit[] = ['day', 'week', 'month', 'year'];

export function parseRepeat(value: string): Recurrence | null | undefined {
  if (value === 'none') return null;
  const match = /^(\d{1,3})-(day|week|month|year)$/.exec(value);
  if (!match) return undefined;
  const interval = Number(match[1]);
  if (interval < 1 || interval > 100) return undefined;
  return { interval, unit: match[2] as RecurrenceUnit };
}

export function repeatValue(
  unit: RecurrenceUnit | null,
  interval: number | null,
): string {
  return unit && interval && UNITS.includes(unit)
    ? `${interval}-${unit}`
    : 'none';
}

export type ItemInput = {
  kind: ItemKind;
  name: string;
  keyDate: LocalDate;
  recurrence: Recurrence | null;
  amount: number | null;
  currency: string;
  notes: string | null;
};

export type ItemField =
  'kind' | 'name' | 'keyDate' | 'repeat' | 'amount' | 'currency' | 'notes';
export type ItemErrors = Partial<Record<ItemField, string>>;

function isKind(value: string): value is ItemKind {
  return (ITEM_KINDS as readonly string[]).includes(value);
}

function parseAmount(raw: string): number | null | undefined {
  const cleaned = raw.trim().replace(/\s/g, '');
  if (!cleaned) return null;
  const normalized = /^\d+(,\d{1,2})$/.test(cleaned)
    ? cleaned.replace(',', '.')
    : cleaned;
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(normalized)) return undefined;
  return Number(normalized);
}

export function parseItemForm(
  fields: Record<string, string | undefined>,
): { ok: true; value: ItemInput } | { ok: false; errors: ItemErrors } {
  const errors: ItemErrors = {};
  const kind = fields.kind ?? '';
  const name = (fields.name ?? '').trim();
  const keyDate = (fields.keyDate ?? '').trim();
  const recurrence = parseRepeat(fields.repeat ?? 'none');
  const amount = parseAmount(fields.amount ?? '');
  const currency = fields.currency ?? 'EUR';
  const notes = (fields.notes ?? '').trim();

  if (!isKind(kind)) errors.kind = 'Choose what kind of item this is.';
  if (!name) errors.name = 'Give it a name.';
  else if (name.length > 120)
    errors.name = 'Keep the name under 120 characters.';
  try {
    parseDate(keyDate);
  } catch {
    errors.keyDate = 'Enter a valid date.';
  }
  if (recurrence === undefined) errors.repeat = 'Choose how often it repeats.';
  if (amount === undefined) errors.amount = 'Enter an amount like 12.99.';
  if (!(CURRENCIES as readonly string[]).includes(currency)) {
    errors.currency = 'Choose a currency.';
  }
  if (notes.length > 2000) errors.notes = 'Keep notes under 2000 characters.';

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      kind: kind as ItemKind,
      name,
      keyDate,
      recurrence: recurrence ?? null,
      amount: amount ?? null,
      currency,
      notes: notes || null,
    },
  };
}
