import { parseDate, type LocalDate } from './dates';
import { CURRENCIES, ITEM_KINDS, REPEAT_OPTIONS, type ItemKind } from './items';

export const MAX_SCAN_BYTES = 10 * 1024 * 1024;
export const SCAN_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
] as const;

/** Below this, the form is still pre-filled but the person is told to check closely. */
export const CONFIDENT = 0.6;

export function scanFileProblem(file: { size: number; type: string }) {
  if (file.size === 0) return 'Choose a photo or PDF to scan.';
  if (file.size > MAX_SCAN_BYTES)
    return 'That file is over 10 MB. Try a smaller photo or PDF.';
  if (!(SCAN_MIME_TYPES as readonly string[]).includes(file.type)) {
    return 'Use a photo (JPEG, PNG, WebP, HEIC) or a PDF.';
  }
  return null;
}

const REPEAT_VALUES = REPEAT_OPTIONS.map((o) => o.value);

/** The shape Gemini must answer in (OpenAPI-style schema for responseSchema). */
export const SCAN_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    readable: {
      type: 'BOOLEAN',
      description:
        'False if this is not a subscription, document, contract or receipt, or it cannot be read.',
    },
    kind: { type: 'STRING', enum: [...ITEM_KINDS] },
    name: {
      type: 'STRING',
      description:
        'Short everyday name, e.g. "Netflix", "Passport", "Car insurance (AXA)". Max 60 characters.',
    },
    key_date: {
      type: 'STRING',
      nullable: true,
      description:
        'The next renewal, expiry or end date as YYYY-MM-DD, or null if none is shown.',
    },
    repeat: {
      type: 'STRING',
      enum: REPEAT_VALUES,
      description:
        'How often it renews. "none" for documents that simply expire.',
    },
    amount: {
      type: 'NUMBER',
      nullable: true,
      description: 'Amount charged per renewal, without currency.',
    },
    currency: {
      type: 'STRING',
      nullable: true,
      description: 'ISO 4217 code such as EUR.',
    },
    confidence: {
      type: 'NUMBER',
      description:
        'From 0 to 1: how sure you are of the name and date together.',
    },
  },
  required: [
    'readable',
    'kind',
    'name',
    'key_date',
    'repeat',
    'amount',
    'currency',
    'confidence',
  ],
} as const;

export function scanPrompt(today: LocalDate): string {
  return [
    'You read photos and PDFs of personal admin: subscription receipts, invoices, ID documents, passports, driving licences, insurance policies, phone and energy contracts, leases.',
    `Today is ${today}.`,
    'Extract the single most important item it describes, as the user would track it in a reminder app.',
    'kind: "subscription" for recurring services, "document" for IDs and permits that expire, "contract" for insurance, utilities, phone plans, leases and warranties.',
    'key_date: the NEXT date something renews, expires or ends, on or after today if the document allows working it out (for a monthly subscription paid on a past date, add months until it is in the future). Use null if no such date can be found. Never invent a date.',
    'amount: the recurring charge, not a one-off total, or null if none.',
    'Do not copy ID numbers, card numbers, addresses or personal details into any field.',
    'If the file is unreadable or unrelated, set readable to false and confidence to 0.',
  ].join('\n');
}

export type ScanFields = {
  kind: string;
  name: string;
  keyDate: string;
  repeat: string;
  amount: string;
  currency: string;
};

export type ScanOutcome =
  | { ok: true; fields: ScanFields; confidence: number; confident: boolean }
  | { ok: false; reason: 'unreadable' | 'invalid' };

function isKind(value: unknown): value is ItemKind {
  return (ITEM_KINDS as readonly unknown[]).includes(value);
}

/** Turns the model's JSON into item form values, trusting nothing. */
export function parseScanResult(raw: unknown): ScanOutcome {
  if (!raw || typeof raw !== 'object') return { ok: false, reason: 'invalid' };
  const r = raw as Record<string, unknown>;
  if (r.readable === false) return { ok: false, reason: 'unreadable' };

  const name = typeof r.name === 'string' ? r.name.trim().slice(0, 120) : '';
  let keyDate = '';
  if (typeof r.key_date === 'string') {
    try {
      parseDate(r.key_date);
      keyDate = r.key_date;
    } catch {
      keyDate = '';
    }
  }
  if (!name && !keyDate) return { ok: false, reason: 'unreadable' };

  const kind = isKind(r.kind) ? r.kind : 'subscription';
  const repeat =
    typeof r.repeat === 'string' && REPEAT_VALUES.includes(r.repeat as never)
      ? r.repeat
      : kind === 'document'
        ? 'none'
        : '1-month';
  const amount =
    typeof r.amount === 'number' &&
    Number.isFinite(r.amount) &&
    r.amount >= 0 &&
    r.amount < 1e9
      ? r.amount.toFixed(2)
      : '';
  const code =
    typeof r.currency === 'string' ? r.currency.trim().toUpperCase() : '';
  const currency = (CURRENCIES as readonly string[]).includes(code)
    ? code
    : 'EUR';
  const confidence =
    typeof r.confidence === 'number' && Number.isFinite(r.confidence)
      ? Math.min(1, Math.max(0, r.confidence))
      : 0;

  return {
    ok: true,
    fields: { kind, name, keyDate, repeat, amount, currency },
    confidence,
    confident: confidence >= CONFIDENT && Boolean(name) && Boolean(keyDate),
  };
}
