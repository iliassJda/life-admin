'use client';

import { useActionState } from 'react';
import {
  REMINDER_DAY_OPTIONS,
  reminderDayLabel,
  type SettingsField,
} from '@/lib/core/settings';
import { saveSettings, type SettingsState } from './actions';

const inputClass =
  'border-line bg-paper text-ink focus:border-accent aria-[invalid=true]:border-alert w-full rounded-xl border px-4 py-3 text-[15px] outline-none';

type Props = {
  timeZones: string[];
  initial: {
    timeZone: string;
    reminderTime: string;
    emailReminders: boolean;
    defaultDays: number[];
  };
};

const QUARTER_HOURS = Array.from({ length: 96 }, (_, i) => {
  const h = String(Math.floor(i / 4)).padStart(2, '0');
  const m = String((i % 4) * 15).padStart(2, '0');
  return `${h}:${m}`;
});

export function SettingsForm({ timeZones, initial }: Props) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    saveSettings,
    { errors: {} },
  );

  const error = (field: SettingsField) =>
    state.errors[field] ? (
      <p id={`${field}-error`} className="text-alert mt-1.5 text-[13px]">
        {state.errors[field]}
      </p>
    ) : null;
  const invalid = (field: SettingsField) => ({
    'aria-invalid': Boolean(state.errors[field]),
    'aria-describedby': state.errors[field] ? `${field}-error` : undefined,
  });

  return (
    <form action={formAction} className="space-y-8">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          name="emailReminders"
          defaultChecked={initial.emailReminders}
          className="mt-1 size-4 accent-(--accent)"
        />
        <span>
          <span className="block text-[15px] font-medium">Email reminders</span>
          <span className="text-ink-soft block text-[14px]">
            Turn this off to stop all reminder emails. Your items stay as they
            are.
          </span>
        </span>
      </label>

      <fieldset>
        <legend className="text-ink-soft mb-1 text-[13px]">
          Remind me, by default
        </legend>
        <p className="text-ink-faint mb-3 text-[13px]">
          Any item can have its own reminder days instead.
        </p>
        <div className="flex flex-wrap gap-2" {...invalid('defaultDays')}>
          {REMINDER_DAY_OPTIONS.map((d) => (
            <label key={d} className="cursor-pointer">
              <input
                type="checkbox"
                name="defaultDays"
                value={d}
                defaultChecked={initial.defaultDays.includes(d)}
                className="peer sr-only"
              />
              <span className="border-line text-ink-soft peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-ink peer-focus-visible:outline-accent inline-block rounded-full border px-3.5 py-1.5 text-[13px] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2">
                {reminderDayLabel(d)}
              </span>
            </label>
          ))}
        </div>
        {error('defaultDays')}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="reminderTime"
            className="text-ink-soft mb-2 block text-[13px]"
          >
            Send reminders at
          </label>
          <select
            id="reminderTime"
            name="reminderTime"
            defaultValue={initial.reminderTime}
            className={inputClass}
            {...invalid('reminderTime')}
          >
            {QUARTER_HOURS.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          {error('reminderTime')}
        </div>
        <div>
          <label
            htmlFor="timeZone"
            className="text-ink-soft mb-2 block text-[13px]"
          >
            Time zone
          </label>
          <select
            id="timeZone"
            name="timeZone"
            defaultValue={initial.timeZone}
            className={inputClass}
            {...invalid('timeZone')}
          >
            {timeZones.map((tz) => (
              <option key={tz} value={tz}>
                {tz.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
          {error('timeZone')}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-accent-ink focus-visible:outline-accent rounded-full px-6 py-3 text-[15px] font-medium transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
        >
          {pending ? 'Saving…' : 'Save settings'}
        </button>
        <p aria-live="polite" className="text-[14px]">
          {state.saved && !pending ? (
            <span className="text-accent">Saved.</span>
          ) : state.message ? (
            <span className="text-alert">{state.message}</span>
          ) : null}
        </p>
      </div>
    </form>
  );
}
