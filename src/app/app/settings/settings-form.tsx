'use client';

import { useActionState } from 'react';
import {
  REMINDER_DAY_OPTIONS,
  reminderDayLabel,
  type SettingsField,
} from '@/lib/core/settings';
import { saveSettings, type SettingsState } from './actions';

const inputClass = 'st-input';

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
      <p id={`${field}-error`} className="st-error mt-1.5">
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
          className="mt-1 size-4 accent-(--st-yellow)"
        />
        <span>
          <span className="block text-[16px] font-semibold">
            Email reminders
          </span>
          <span className="block text-[14px] text-(--st-dim)">
            Turn this off to stop all reminder emails. Your items stay as they
            are.
          </span>
        </span>
      </label>

      <fieldset>
        <legend className="st-field-label mb-1!">Remind me, by default</legend>
        <p className="mb-3 text-[14px] text-(--st-dim)">
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
              <span className="st-toggle">{reminderDayLabel(d)}</span>
            </label>
          ))}
        </div>
        {error('defaultDays')}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="reminderTime" className="st-field-label">
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
          <label htmlFor="timeZone" className="st-field-label">
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
        <button type="submit" disabled={pending} className="st-btn">
          {pending ? 'Saving…' : 'Save settings'}
        </button>
        <p aria-live="polite" className="text-[14px]">
          {state.saved && !pending ? (
            <span className="font-semibold text-(--st-amber)">Saved.</span>
          ) : state.message ? (
            <span className="text-(--st-red)">{state.message}</span>
          ) : null}
        </p>
      </div>
    </form>
  );
}
