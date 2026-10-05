import { describe, expect, it } from 'vitest';
import { parseItemForm, parseRepeat, repeatValue } from './items';

const valid = {
  kind: 'subscription',
  name: '  Netflix ',
  keyDate: '2026-11-01',
  repeat: '1-month',
  amount: '15.99',
  currency: 'EUR',
  notes: '',
};

describe('parseItemForm', () => {
  it('accepts a complete subscription', () => {
    expect(parseItemForm(valid)).toEqual({
      ok: true,
      value: {
        kind: 'subscription',
        name: 'Netflix',
        keyDate: '2026-11-01',
        recurrence: { unit: 'month', interval: 1 },
        amount: 15.99,
        currency: 'EUR',
        notes: null,
      },
    });
  });

  it('accepts a one-off document without an amount', () => {
    const result = parseItemForm({
      ...valid,
      kind: 'document',
      name: 'Passport',
      repeat: 'none',
      amount: '',
    });
    expect(result.ok && result.value.recurrence).toBeNull();
    expect(result.ok && result.value.amount).toBeNull();
  });

  it.each([
    ['12,99', 12.99],
    ['486', 486],
    [' 1 250.50 ', 1250.5],
  ])('reads the amount %s', (amount, expected) => {
    const result = parseItemForm({ ...valid, amount });
    expect(result.ok && result.value.amount).toBe(expected);
  });

  it('reports every invalid field at once', () => {
    const result = parseItemForm({
      kind: 'pet',
      name: ' ',
      keyDate: '2026-02-30',
      repeat: '0-month',
      amount: '-5',
      currency: 'XYZ',
      notes: 'x'.repeat(2001),
    });
    expect(result.ok).toBe(false);
    expect(!result.ok && Object.keys(result.errors).sort()).toEqual(
      [
        'amount',
        'currency',
        'keyDate',
        'kind',
        'name',
        'notes',
        'repeat',
      ].sort(),
    );
  });

  it('rejects amounts with too many decimals', () => {
    expect(parseItemForm({ ...valid, amount: '9.999' }).ok).toBe(false);
  });
});

describe('repeat values', () => {
  it('round-trips between the form and the database', () => {
    expect(parseRepeat('3-month')).toEqual({ unit: 'month', interval: 3 });
    expect(repeatValue('month', 3)).toBe('3-month');
    expect(parseRepeat('none')).toBeNull();
    expect(repeatValue(null, null)).toBe('none');
  });

  it('rejects malformed values', () => {
    expect(parseRepeat('every-month')).toBeUndefined();
    expect(parseRepeat('101-day')).toBeUndefined();
  });
});
