'use client';

import { useActionState, useId } from 'react';
import { TRACK_OPTIONS } from '@/lib/core/waitlist';
import {
  joinWaitlist,
  saveAnswer,
  type AnswerState,
  type WaitlistState,
} from './actions';

const initialState: WaitlistState = { status: 'idle', message: '' };
const initialAnswer: AnswerState = { status: 'idle', message: '' };

function FollowUp({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(
    saveAnswer,
    initialAnswer,
  );
  const id = useId();

  if (state.status === 'success') {
    return (
      <p role="status" className="mt-4 text-[15px] text-(--st-dim)">
        {state.message}
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className="mt-6 rounded-[3px] border border-(--st-rule) bg-(--st-housing) p-5 text-left"
    >
      <input type="hidden" name="email" value={email} />
      <fieldset>
        <legend className="text-[15px] text-(--st-white)">
          One optional question: what would you want us to watch first?
        </legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {TRACK_OPTIONS.map((option) => (
            <label key={option}>
              <input
                type="checkbox"
                name="track"
                value={option}
                className="peer sr-only"
              />
              <span className="st-toggle">{option}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label htmlFor={`${id}-other`} className="sr-only">
        Something else
      </label>
      <input
        id={`${id}-other`}
        name="other"
        maxLength={200}
        placeholder="Something else? Tell us…"
        className="st-input mt-4"
      />
      <div className="mt-4 flex items-center justify-between gap-4">
        <p aria-live="polite" className="text-[14px] text-(--st-red)">
          {state.status === 'error' ? state.message : ''}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="st-btn min-h-11 shrink-0 px-5 text-[14px]"
        >
          {pending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  );
}

export function WaitlistForm() {
  const [state, formAction, pending] = useActionState(
    joinWaitlist,
    initialState,
  );
  const id = useId();

  if (state.status === 'success') {
    return (
      <div className="w-full max-w-xl">
        <p
          role="status"
          className="st-cond text-[26px] leading-tight font-bold text-(--st-yellow)"
        >
          {state.message}
        </p>
        {state.email && <FollowUp email={state.email} />}
      </div>
    );
  }

  return (
    <form action={formAction} className="w-full max-w-xl">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={state.status === 'error'}
          aria-describedby={`${id}-msg`}
          className="st-input flex-1"
        />
        <input
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <button type="submit" disabled={pending} className="st-btn shrink-0">
          {pending ? 'Joining…' : 'Request an invitation'}
          {!pending && (
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
              <path
                d="M2 8h11M9 3.5 13.5 8 9 12.5"
                stroke="currentColor"
                strokeWidth="2.2"
                fill="none"
              />
            </svg>
          )}
        </button>
      </div>
      <p
        id={`${id}-msg`}
        aria-live="polite"
        className={`mt-3 min-h-5 text-[14px] ${
          state.status === 'error' ? 'text-(--st-red)' : 'text-(--st-dim)'
        }`}
      >
        {state.status === 'error'
          ? state.message
          : 'Used only to send your invitation. Never shared, never sold.'}
      </p>
    </form>
  );
}
