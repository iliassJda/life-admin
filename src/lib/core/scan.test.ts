import { describe, expect, it } from 'vitest';
import { parseScanResult, scanFileProblem } from './scan';

const good = {
  readable: true,
  kind: 'subscription',
  name: 'Netflix',
  key_date: '2026-12-05',
  repeat: '1-month',
  amount: 15.99,
  currency: 'EUR',
  confidence: 0.92,
};

describe('parseScanResult', () => {
  it('turns a clean answer into form values', () => {
    expect(parseScanResult(good)).toEqual({
      ok: true,
      fields: {
        kind: 'subscription',
        name: 'Netflix',
        keyDate: '2026-12-05',
        repeat: '1-month',
        amount: '15.99',
        currency: 'EUR',
      },
      confidence: 0.92,
      confident: true,
    });
  });

  it('reports an unreadable file', () => {
    expect(parseScanResult({ ...good, readable: false })).toEqual({
      ok: false,
      reason: 'unreadable',
    });
    expect(parseScanResult({ ...good, name: '', key_date: null })).toEqual({
      ok: false,
      reason: 'unreadable',
    });
    expect(parseScanResult('nonsense')).toEqual({
      ok: false,
      reason: 'invalid',
    });
  });

  it('drops an impossible date instead of trusting it', () => {
    const result = parseScanResult({ ...good, key_date: '2026-02-30' });
    expect(result.ok && result.fields.keyDate).toBe('');
    expect(result.ok && result.confident).toBe(false);
  });

  it('is not confident below the threshold', () => {
    const result = parseScanResult({ ...good, confidence: 0.4 });
    expect(result.ok && result.confident).toBe(false);
  });

  it('falls back safely on unknown values', () => {
    const result = parseScanResult({
      ...good,
      kind: 'banana',
      repeat: 'fortnightly',
      currency: 'JPY',
      amount: -5,
      confidence: 7,
    });
    expect(result).toMatchObject({
      ok: true,
      fields: {
        kind: 'subscription',
        repeat: '1-month',
        currency: 'EUR',
        amount: '',
      },
      confidence: 1,
    });
  });

  it('defaults documents to not repeating', () => {
    const result = parseScanResult({
      ...good,
      kind: 'document',
      repeat: 'weekly-ish',
    });
    expect(result.ok && result.fields.repeat).toBe('none');
  });
});

describe('scanFileProblem', () => {
  it('accepts photos and PDFs up to 10 MB', () => {
    expect(scanFileProblem({ size: 2_000_000, type: 'image/jpeg' })).toBeNull();
    expect(
      scanFileProblem({ size: 2_000_000, type: 'application/pdf' }),
    ).toBeNull();
  });

  it('rejects empty, huge and unsupported files', () => {
    expect(scanFileProblem({ size: 0, type: 'image/png' })).toMatch(/Choose/);
    expect(
      scanFileProblem({ size: 11 * 1024 * 1024, type: 'image/png' }),
    ).toMatch(/10 MB/);
    expect(scanFileProblem({ size: 1000, type: 'text/plain' })).toMatch(
      /photo/,
    );
  });
});
