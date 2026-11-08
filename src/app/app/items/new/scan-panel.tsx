'use client';

import { useId, useState } from 'react';
import { browserSupabase } from '@/lib/browser/supabase';
import { documentExtension } from '@/lib/core/documents';
import { scanFileProblem, type ScanFields } from '@/lib/core/scan';
import { readScan } from '../scan-actions';

export type ScanState =
  | { status: 'read'; fields: ScanFields; confident: boolean; filePath: string }
  | { status: 'unreadable'; filePath: string };

type Busy = 'idle' | 'uploading' | 'reading';

export function ScanPanel({
  userId,
  onResult,
}: {
  userId: string;
  onResult: (result: ScanState) => void;
}) {
  const [busy, setBusy] = useState<Busy>('idle');
  const [error, setError] = useState('');
  const id = useId();

  async function handle(file: File) {
    setError('');
    const problem = scanFileProblem(file);
    const ext = documentExtension(file.type);
    if (problem || !ext) {
      setError(problem ?? 'Use a photo (JPEG, PNG, WebP, HEIC) or a PDF.');
      return;
    }

    setBusy('uploading');
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await browserSupabase()
      .storage.from('documents')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      setBusy('idle');
      setError('The upload didn’t work. Check your connection and try again.');
      return;
    }

    setBusy('reading');
    try {
      const result = await readScan(path);
      if (result.status === 'error') {
        setError(result.message);
        onResult({ status: 'unreadable', filePath: path });
      } else if (result.status === 'unreadable') {
        onResult({ status: 'unreadable', filePath: path });
      } else {
        onResult({ ...result, filePath: path });
      }
    } catch {
      setError('Reading the document didn’t work. Fill in the details below.');
      onResult({ status: 'unreadable', filePath: path });
    } finally {
      setBusy('idle');
    }
  }

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="rounded-[3px] border border-(--st-rule) bg-(--st-housing) p-5 sm:p-6"
    >
      <div className="flex items-start gap-4">
        <span
          className="size-11 flex-none bg-(--st-yellow) p-2.5 text-(--st-ink)"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="size-full" fill="none">
            <path
              d="M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3M4 12h16"
              stroke="currentColor"
              strokeWidth="2.4"
            />
          </svg>
        </span>
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="st-heading text-[26px]">
            Scan a document or receipt
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-(--st-dim)">
            Take a photo or pick a PDF. We read the name, date and amount, and
            you check everything before it’s saved. To read it, the file is sent
            to Google’s Gemini AI.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <label
          className={`st-btn-outline focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-(--st-yellow) ${
            busy !== 'idle'
              ? 'pointer-events-none opacity-60'
              : 'cursor-pointer'
          }`}
        >
          <input
            type="file"
            accept="image/*,application/pdf"
            className="sr-only"
            disabled={busy !== 'idle'}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) void handle(file);
            }}
          />
          {busy === 'idle' ? 'Choose a photo or PDF' : 'Working…'}
        </label>
        <p aria-live="polite" className="text-[14px] text-(--st-amber)">
          {busy === 'uploading'
            ? 'Uploading…'
            : busy === 'reading'
              ? 'Reading your document…'
              : ''}
        </p>
      </div>
      {error && (
        <p role="alert" className="st-error mt-3">
          {error}
        </p>
      )}
    </section>
  );
}
