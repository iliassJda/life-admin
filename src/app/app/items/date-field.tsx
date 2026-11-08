'use client';

import { useId, useState } from 'react';
import { daysInMonth } from '@/lib/core/dates';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function split(value: string | undefined) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '');
  return match
    ? {
        year: match[1],
        month: String(Number(match[2])),
        day: String(Number(match[3])),
      }
    : { year: '', month: '', day: '' };
}

/**
 * Day, month and year as three fields, so the order is the same on every
 * device (a native date picker follows the computer's region settings).
 * Submits one value as YYYY-MM-DD.
 */
export function DateField({
  name,
  label,
  defaultValue,
  invalid,
  describedBy,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  invalid?: boolean;
  describedBy?: string;
}) {
  const id = useId();
  const [parts, setParts] = useState(() => split(defaultValue));
  const thisYear = new Date().getFullYear();
  const chosenYear = Number(parts.year) || thisYear;
  const firstYear = Math.min(thisYear - 1, chosenYear);
  const lastYear = Math.max(thisYear + 15, chosenYear);
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, i) =>
    String(firstYear + i),
  );
  // Leap-year aware: February 2028 offers 29 days, February 2027 offers 28.
  const maxDay =
    parts.month !== '' ? daysInMonth(chosenYear, Number(parts.month)) : 31;

  function update(next: Partial<typeof parts>) {
    setParts((prev) => {
      const merged = { ...prev, ...next };
      const limit =
        merged.month !== ''
          ? daysInMonth(Number(merged.year) || thisYear, Number(merged.month))
          : 31;
      if (merged.day !== '' && Number(merged.day) > limit) {
        merged.day = String(limit);
      }
      return merged;
    });
  }

  const value =
    parts.year && parts.month && parts.day
      ? `${parts.year}-${parts.month.padStart(2, '0')}-${parts.day.padStart(2, '0')}`
      : '';
  const shared = {
    'aria-invalid': invalid,
    'aria-describedby': describedBy,
    required: true,
  };

  return (
    <fieldset>
      <legend id={`${id}-legend`} className="st-field-label">
        {label}
      </legend>
      <input type="hidden" name={name} value={value} />
      <div className="grid grid-cols-[5.5rem_1fr_6.5rem] gap-2">
        <select
          aria-label="Day"
          value={parts.day}
          onChange={(e) => update({ day: e.target.value })}
          className="st-input"
          {...shared}
        >
          <option value="">Day</option>
          {Array.from({ length: maxDay }, (_, i) => (
            <option key={i + 1} value={String(i + 1)}>
              {i + 1}
            </option>
          ))}
        </select>
        <select
          aria-label="Month"
          value={parts.month}
          onChange={(e) => update({ month: e.target.value })}
          className="st-input"
          {...shared}
        >
          <option value="">Month</option>
          {MONTHS.map((m, i) => (
            <option key={m} value={String(i + 1)}>
              {m}
            </option>
          ))}
        </select>
        <select
          aria-label="Year"
          value={parts.year}
          onChange={(e) => update({ year: e.target.value })}
          className="st-input"
          {...shared}
        >
          <option value="">Year</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  );
}
