import 'server-only';
import type { LocalDate } from '@/lib/core/dates';
import {
  parseScanResult,
  SCAN_RESPONSE_SCHEMA,
  scanPrompt,
  type ScanOutcome,
} from '@/lib/core/scan';

const MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash';
// Used once when the main model is overloaded or slow.
const FALLBACK_MODEL =
  process.env.GEMINI_FALLBACK_MODEL ?? 'gemini-3.5-flash-lite';
// Two attempts must fit inside the page's 60-second limit.
const ATTEMPT_MS = 25_000;

export type ReadOutcome = ScanOutcome | { ok: false; reason: 'failed' };

type Attempt =
  { kind: 'answer'; text: string } | { kind: 'retry' } | { kind: 'fail' };

async function ask(model: string, key: string, body: string): Promise<Attempt> {
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
        body,
        signal: AbortSignal.timeout(ATTEMPT_MS),
      },
    );
    if (!res.ok) {
      // Log the status only: the body can echo document content.
      console.error('Gemini request failed', model, res.status);
      return res.status === 429 || res.status >= 500
        ? { kind: 'retry' }
        : { kind: 'fail' };
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return typeof text === 'string'
      ? { kind: 'answer', text }
      : { kind: 'fail' };
  } catch (err) {
    const name = err instanceof Error ? err.name : 'unknown';
    console.error('Gemini request error', model, name);
    return name === 'TimeoutError' ? { kind: 'retry' } : { kind: 'fail' };
  }
}

/** Sends one document to Gemini and returns validated form values. */
export async function readDocument(
  bytes: ArrayBuffer,
  mimeType: string,
  today: LocalDate,
): Promise<ReadOutcome> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { ok: false, reason: 'failed' };

  const body = JSON.stringify({
    contents: [
      {
        role: 'user',
        parts: [
          {
            inline_data: {
              mime_type: mimeType,
              data: Buffer.from(bytes).toString('base64'),
            },
          },
          { text: scanPrompt(today) },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
      responseSchema: SCAN_RESPONSE_SCHEMA,
    },
  });

  let attempt = await ask(MODEL, key, body);
  if (attempt.kind === 'retry') attempt = await ask(FALLBACK_MODEL, key, body);
  if (attempt.kind !== 'answer') return { ok: false, reason: 'failed' };

  try {
    return parseScanResult(JSON.parse(attempt.text));
  } catch {
    return { ok: false, reason: 'failed' };
  }
}
