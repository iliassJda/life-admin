'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import {
  CURRENCIES,
  DATE_LABELS,
  ITEM_KINDS,
  KIND_LABELS,
  REPEAT_OPTIONS,
  type ItemField,
  type ItemKind,
} from '@/lib/core/items';
import { REMINDER_DAY_OPTIONS, reminderDayLabel } from '@/lib/core/settings';
import type { ItemFormState } from './actions';
import { DateField } from './date-field';

type Props = {
  action: (state: ItemFormState, formData: FormData) => Promise<ItemFormState>;
  initial: Record<string, string>;
  submitLabel: string;
  /** The user's default reminder days, described in words. */
  defaultsLabel: string;
};

const inputClass = 'st-input';

export function ItemForm({
  action,
  initial,
  submitLabel,
  defaultsLabel,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {
    errors: {},
  });
  const values = state.values ?? initial;
  const [kind, setKind] = useState<ItemKind>(
    (values.kind as ItemKind) || 'subscription',
  );
  const [reminderMode, setReminderMode] = useState(
    values.reminderMode === 'custom' ? 'custom' : 'default',
  );
  const chosenDays = (values.reminderDays ?? '').split(',').filter(Boolean);

  const repeatOptions = REPEAT_OPTIONS.some((o) => o.value === values.repeat)
    ? REPEAT_OPTIONS
    : [...REPEAT_OPTIONS, { value: values.repeat, label: values.repeat }];

  const error = (field: ItemField) =>
    state.errors[field] ? (
      <p id={`${field}-error`} className="st-error mt-1.5">
        {state.errors[field]}
      </p>
    ) : null;
  const invalid = (field: ItemField) => ({
    'aria-invalid': Boolean(state.errors[field]),
    'aria-describedby': state.errors[field] ? `${field}-error` : undefined,
  });

  return (
    <form action={formAction} className="space-y-6">
      <fieldset>
        <legend className="st-field-label">Kind</legend>
        <div className="flex flex-wrap gap-2">
          {ITEM_KINDS.map((k) => (
            <label key={k} className="cursor-pointer">
              <input
                type="radio"
                name="kind"
                value={k}
                defaultChecked={(values.kind || 'subscription') === k}
                onChange={() => setKind(k)}
                className="peer sr-only"
              />
              <span className="st-toggle">{KIND_LABELS[k]}</span>
            </label>
          ))}
        </div>
        {error('kind')}
      </fieldset>

      <div>
        <label htmlFor="name" className="st-field-label">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          maxLength={120}
          defaultValue={values.name}
          placeholder="e.g. Netflix, Passport, Car insurance"
          className={inputClass}
          {...invalid('name')}
        />
        {error('name')}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="keyDate" className="st-field-label">
            {DATE_LABELS[kind]}
          </label>
          <DateField
            id="keyDate"
            name="keyDate"
            defaultValue={values.keyDate}
            invalid={Boolean(state.errors.keyDate)}
            describedBy={state.errors.keyDate ? 'keyDate-error' : undefined}
          />
          {error('keyDate')}
        </div>
        <div>
          <label htmlFor="repeat" className="st-field-label">
            Repeats
          </label>
          <select
            id="repeat"
            name="repeat"
            defaultValue={values.repeat || 'none'}
            className={inputClass}
            {...invalid('repeat')}
          >
            {repeatOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {error('repeat')}
        </div>
      </div>

      <div>
        <label htmlFor="amount" className="st-field-label">
          Amount <span className="font-normal text-(--st-dim)">(optional)</span>
        </label>
        <div className="flex gap-2">
          <input
            id="amount"
            name="amount"
            inputMode="decimal"
            defaultValue={values.amount}
            placeholder="12.99"
            className={inputClass}
            {...invalid('amount')}
          />
          <select
            name="currency"
            aria-label="Currency"
            defaultValue={values.currency || 'EUR'}
            className={`${inputClass} w-28`}
            {...invalid('currency')}
          >
            {CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        {error('amount')}
        {error('currency')}
      </div>

      <div>
        <label htmlFor="notes" className="st-field-label">
          Notes <span className="font-normal text-(--st-dim)">(optional)</span>
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={2000}
          defaultValue={values.notes}
          placeholder="Policy number, how to cancel, who to call…"
          className={inputClass}
          {...invalid('notes')}
        />
        {error('notes')}
      </div>

      <fieldset>
        <legend className="st-field-label">Reminders</legend>
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-3 text-[15px]">
            <input
              type="radio"
              name="reminderMode"
              value="default"
              defaultChecked={values.reminderMode !== 'custom'}
              onChange={() => setReminderMode('default')}
              className="size-4 accent-(--st-yellow)"
            />
            <span>
              My defaults{' '}
              <span className="text-(--st-dim)">({defaultsLabel})</span>
            </span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 text-[15px]">
            <input
              type="radio"
              name="reminderMode"
              value="custom"
              defaultChecked={values.reminderMode === 'custom'}
              onChange={() => setReminderMode('custom')}
              className="size-4 accent-(--st-yellow)"
            />
            Choose for this item
          </label>
        </div>
        {reminderMode === 'custom' && (
          <div
            className="mt-3 flex flex-wrap gap-2"
            role="group"
            aria-label="Reminder days for this item"
            {...invalid('reminders')}
          >
            {REMINDER_DAY_OPTIONS.map((d) => (
              <label key={d} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="reminderDays"
                  value={d}
                  defaultChecked={chosenDays.includes(String(d))}
                  className="peer sr-only"
                />
                <span className="st-toggle">{reminderDayLabel(d)}</span>
              </label>
            ))}
          </div>
        )}
        {error('reminders')}
      </fieldset>

      {kind !== 'document' && (
        <div className="rounded-[3px] border border-(--st-rule) p-4">
          <input
            type="hidden"
            name="unusedSince"
            value={values.unusedSince ?? ''}
          />
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="unused"
              defaultChecked={values.unused === 'on'}
              className="mt-1 size-4 accent-(--st-yellow)"
            />
            <span>
              <span className="block text-[15px] font-semibold">
                I don’t use this anymore
              </span>
              <span className="mt-1 block text-[14px] leading-relaxed text-(--st-dim)">
                Your reminders will tell you to cancel before the next charge,
                and Spending shows what cancelling saves.
              </span>
            </span>
          </label>
        </div>
      )}

      {values.filePath && (
        <div className="rounded-[3px] border border-(--st-rule) p-4">
          <input type="hidden" name="filePath" value={values.filePath} />
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="keepFile"
              defaultChecked={values.keepFile === 'on'}
              className="mt-1 size-4 accent-(--st-yellow)"
            />
            <span>
              <span className="block text-[15px] font-semibold">
                Keep a copy of the document with this item
              </span>
              <span className="mt-1 block text-[14px] leading-relaxed text-(--st-dim)">
                Stored privately; only you can open it. Leave this unticked and
                the file is deleted as soon as you save.
              </span>
            </span>
          </label>
        </div>
      )}

      {state.message && (
        <p role="alert" className="st-error">
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="st-btn">
          {pending ? 'Saving…' : submitLabel}
        </button>
        <Link
          href="/app"
          className="st-focus px-3 py-3 text-[15px] font-semibold text-(--st-dim) hover:text-(--st-white)"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
