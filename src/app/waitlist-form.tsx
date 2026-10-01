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

function FollowUp({ email, inverse }: { email: string; inverse: boolean }) {
  const [state, formAction, pending] = useActionState(
    saveAnswer,
    initialAnswer,
  );
  const id = useId();

  if (state.status === 'success') {
    return (
      <p
        role="status"
        className={`mt-4 text-[14px] ${inverse ? 'text-accent-ink/70' : 'text-ink-soft'}`}
      >
        {state.message}
      </p>
    );
  }

  return (
    <form
      action={formAction}
      className={`mt-6 rounded-2xl border p-5 text-left ${
        inverse ? 'border-accent-ink/25' : 'border-line bg-paper-raised'
      }`}
    >
      <input type="hidden" name="email" value={email} />
      <fieldset>
        <legend
          className={`text-[14px] ${inverse ? 'text-accent-ink' : 'text-ink'}`}
        >
          One optional question: what would you want us to watch first?
        </legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {TRACK_OPTIONS.map((option) => (
            <label key={option} className="cursor-pointer">
              <input
                type="checkbox"
                name="track"
                value={option}
                className="peer sr-only"
              />
              <span
                className={`inline-block rounded-full border px-3.5 py-1.5 text-[13px] transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 ${
                  inverse
                    ? 'border-accent-ink/30 text-accent-ink peer-checked:bg-accent-ink peer-checked:text-accent peer-focus-visible:outline-accent-ink'
                    : 'border-line text-ink-soft peer-checked:border-accent peer-checked:bg-accent peer-checked:text-accent-ink peer-focus-visible:outline-accent'
                }`}
              >
                {option}
              </span>
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
        className={`mt-4 w-full border-b bg-transparent py-2 text-[14px] outline-none ${
          inverse
            ? 'border-accent-ink/30 text-accent-ink placeholder:text-accent-ink/50 focus:border-accent-ink'
            : 'border-line text-ink placeholder:text-ink-faint focus:border-accent'
        }`}
      />
      <div className="mt-4 flex items-center justify-between gap-4">
        <p
          aria-live="polite"
          className={`text-[13px] ${inverse ? 'text-accent-ink' : 'text-alert'}`}
        >
          {state.status === 'error' ? state.message : ''}
        </p>
        <button
          type="submit"
          disabled={pending}
          className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-opacity hover:opacity-90 disabled:opacity-60 ${
            inverse ? 'bg-accent-ink text-accent' : 'bg-accent text-accent-ink'
          }`}
        >
          {pending ? 'Sending…' : 'Send'}
        </button>
      </div>
    </form>
  );
}

export function WaitlistForm({
  tone = 'light',
}: {
  tone?: 'light' | 'inverse';
}) {
  const [state, formAction, pending] = useActionState(
    joinWaitlist,
    initialState,
  );
  const id = useId();
  const inverse = tone === 'inverse';

  if (state.status === 'success') {
    return (
      <div className="w-full max-w-md">
        <p
          role="status"
          className={`font-serif text-xl italic ${inverse ? 'text-accent-ink' : 'text-accent'}`}
        >
          {state.message}
        </p>
        {state.email && <FollowUp email={state.email} inverse={inverse} />}
      </div>
    );
  }

  return (
    <form action={formAction} className="w-full max-w-md">
      <div
        className={`flex flex-col gap-2 rounded-full border p-1.5 sm:flex-row sm:items-center ${
          inverse
            ? 'border-accent-ink/25 bg-accent-ink/5'
            : 'border-line bg-paper-raised shadow-[0_1px_0_rgba(0,0,0,0.02)]'
        } max-sm:rounded-2xl`}
      >
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
          className={`min-w-0 flex-1 bg-transparent px-4 py-2.5 text-[15px] outline-none ${
            inverse
              ? 'text-accent-ink placeholder:text-accent-ink/50'
              : 'text-ink placeholder:text-ink-faint'
          }`}
        />
        <input
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <button
          type="submit"
          disabled={pending}
          className={`rounded-full px-5 py-2.5 text-[14px] font-medium tracking-wide transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 ${
            inverse
              ? 'bg-accent-ink text-accent focus-visible:outline-accent-ink'
              : 'bg-accent text-accent-ink focus-visible:outline-accent'
          }`}
        >
          {pending ? 'Joining…' : 'Request an invitation'}
        </button>
      </div>
      <p
        id={`${id}-msg`}
        aria-live="polite"
        className={`mt-3 min-h-5 px-4 text-[13px] ${
          state.status === 'error'
            ? inverse
              ? 'text-accent-ink'
              : 'text-alert'
            : inverse
              ? 'text-accent-ink/60'
              : 'text-ink-faint'
        }`}
      >
        {state.status === 'error'
          ? state.message
          : 'Used only to send your invitation. Never shared, never sold.'}
      </p>
    </form>
  );
}
