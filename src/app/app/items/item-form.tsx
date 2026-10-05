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
import type { ItemFormState } from './actions';

type Props = {
  action: (state: ItemFormState, formData: FormData) => Promise<ItemFormState>;
  initial: Record<string, string>;
  submitLabel: string;
};

const inputClass =
  'border-line bg-paper text-ink placeholder:text-ink-faint focus:border-accent aria-[invalid=true]:border-alert w-full rounded-xl border px-4 py-3 text-[15px] outline-none';

export function ItemForm({ action, initial, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {
    errors: {},
  });
  const values = state.values ?? initial;
  const [kind, setKind] = useState<ItemKind>(
    (values.kind as ItemKind) || 'subscription',
  );

  const repeatOptions = REPEAT_OPTIONS.some((o) => o.value === values.repeat)
    ? REPEAT_OPTIONS
    : [...REPEAT_OPTIONS, { value: values.repeat, label: values.repeat }];

  const error = (field: ItemField) =>
    state.errors[field] ? (
      <p id={`${field}-error`} className="text-alert mt-1.5 text-[13px]">
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
        <legend className="text-ink-soft mb-2 text-[13px]">Kind</legend>
        <div className="flex flex-wrap gap-2">
          {ITEM_KINDS.map((k) => (
            <label key={k} className="cursor-pointer">
              <input
                type="radio"
                name="kind"
                value={k}
                checked={kind === k}
                onChange={() => setKind(k)}
                className="peer sr-only"
              />
              <span className="border-line text-ink-soft peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-ink peer-focus-visible:outline-accent inline-block rounded-full border px-4 py-2 text-[14px] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
                {KIND_LABELS[k]}
              </span>
            </label>
          ))}
        </div>
        {error('kind')}
      </fieldset>

      <div>
        <label htmlFor="name" className="text-ink-soft mb-2 block text-[13px]">
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
          <label
            htmlFor="keyDate"
            className="text-ink-soft mb-2 block text-[13px]"
          >
            {DATE_LABELS[kind]}
          </label>
          <input
            id="keyDate"
            name="keyDate"
            type="date"
            required
            defaultValue={values.keyDate}
            className={inputClass}
            {...invalid('keyDate')}
          />
          {error('keyDate')}
        </div>
        <div>
          <label
            htmlFor="repeat"
            className="text-ink-soft mb-2 block text-[13px]"
          >
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
        <label
          htmlFor="amount"
          className="text-ink-soft mb-2 block text-[13px]"
        >
          Amount <span className="text-ink-faint">(optional)</span>
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
        <label htmlFor="notes" className="text-ink-soft mb-2 block text-[13px]">
          Notes <span className="text-ink-faint">(optional)</span>
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

      {state.message && (
        <p role="alert" className="text-alert text-[14px]">
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-accent-ink focus-visible:outline-accent rounded-full px-6 py-3 text-[15px] font-medium transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
        >
          {pending ? 'Saving…' : submitLabel}
        </button>
        <Link
          href="/app"
          className="text-ink-soft hover:text-ink px-3 py-3 text-[15px]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
