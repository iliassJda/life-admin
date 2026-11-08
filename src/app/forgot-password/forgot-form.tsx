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
        <p className="st-heading text-[30px]">Check your inbox.</p>
        <p className="text-[16px] leading-relaxed text-(--st-dim)">
          If there’s an account for{' '}
          <span className="font-semibold text-(--st-white)">{state.email}</span>
          , we’ve sent a link to choose a new password. Open it in this browser.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="st-field-label">
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
      <p id="forgot-msg" aria-live="polite" className="st-error empty:hidden">
        {state.status === 'error' ? state.message : ''}
      </p>
      <SubmitButton label="Email me a reset link" pendingLabel="Sending…" />
    </form>
  );
}
