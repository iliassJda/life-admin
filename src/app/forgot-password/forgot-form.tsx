'use client';

import { useActionState } from 'react';
import { requestPasswordReset, type AuthState } from '../auth/actions';
import { inputClass, SubmitButton } from '../auth/ui';

const idle: AuthState = { status: 'idle', message: '' };

export function ForgotForm() {
  const [state, formAction] = useActionState(requestPasswordReset, idle);

  if (state.status === 'check-email') {
    return (
      <div role="status" className="space-y-3">
        <p className="font-serif text-2xl">Check your inbox.</p>
        <p className="text-ink-soft text-[15px] leading-relaxed">
          If there’s an account for{' '}
          <span className="text-ink font-medium">{state.email}</span>, we’ve
          sent a link to choose a new password. Open it in this browser.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="text-ink-soft mb-2 block text-[13px]">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.email}
          placeholder="you@example.com"
          aria-invalid={state.status === 'error'}
          aria-describedby="forgot-msg"
          className={inputClass}
        />
      </div>
      <p
        id="forgot-msg"
        aria-live="polite"
        className="text-alert text-[13px] empty:hidden"
      >
        {state.status === 'error' ? state.message : ''}
      </p>
      <SubmitButton label="Email me a reset link" pendingLabel="Sending…" />
    </form>
  );
}
