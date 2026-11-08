'use client';

import { useRef, useState } from 'react';
import { parseDate } from '@/lib/core/dates';

/** "20261203" or "2026-12-03" style input → "03/12/2026" for display. */
function toDisplay(iso: string | undefined): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? '');
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
}

/** Formats typed digits as dd/mm/yyyy, adding the slashes as you go. */
function mask(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

/** "03/12/2026" → "2026-12-03", or '' when incomplete or not a real date. */
function toIso(display: string): string {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display);
  if (!match) return '';
  const iso = `${match[3]}-${match[2]}-${match[1]}`;
  try {
    parseDate(iso);
    return iso;
  } catch {
    return '';
  }
}

/**
 * A date field that always reads day/month/year, whatever the computer's
 * region settings. Typing works as dd/mm/yyyy; the calendar button opens the
 * browser's own date picker. Submits one value as YYYY-MM-DD.
 */
export function DateField({
  id,
  name,
  defaultValue,
  invalid,
  describedBy,
}: {
  id: string;
  name: string;
  defaultValue?: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [text, setText] = useState(() => toDisplay(defaultValue));
  const picker = useRef<HTMLInputElement>(null);
  const iso = toIso(text);
  const notReal = text.length === 10 && !iso;

  return (
    <div className="relative">
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="dd/mm/yyyy"
        maxLength={10}
        required
        value={text}
        onChange={(e) => setText(mask(e.target.value))}
        aria-invalid={invalid || notReal}
        aria-describedby={describedBy}
        className="st-input st-num pr-14"
      />
      <input type="hidden" name={name} value={iso} />
      {/* The browser's own calendar, opened from the button below. */}
      <input
        ref={picker}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={iso}
        onChange={(e) => setText(toDisplay(e.target.value))}
        className="pointer-events-none absolute right-0 bottom-0 h-full w-12 opacity-0"
      />
      <button
        type="button"
        aria-label="Open calendar"
        onClick={() => {
          const el = picker.current;
          if (!el) return;
          try {
            el.showPicker();
          } catch {
            el.focus();
          }
        }}
        className="st-focus absolute inset-y-1.5 right-1.5 grid w-10 place-items-center rounded-[2px] text-(--st-dim) hover:text-(--st-white)"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          className="size-5"
          fill="none"
        >
          <rect
            x="2.5"
            y="4"
            width="15"
            height="13.5"
            rx="1"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path
            d="M2.5 8h15M6.5 2v4M13.5 2v4"
            stroke="currentColor"
            strokeWidth="1.6"
          />
        </svg>
      </button>
      {notReal && (
        <p className="st-error mt-1.5" role="alert">
          That date doesn’t exist. Check the day and month.
        </p>
      )}
    </div>
  );
}
