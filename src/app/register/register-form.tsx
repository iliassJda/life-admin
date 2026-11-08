'use client';

import { useActionState } from 'react';
import { resendConfirmation, signUp, type AuthState } from '../auth/actions';
import { inputClass, PasswordInput, SubmitButton } from '../auth/ui';
import { MIN_PASSWORD_LENGTH } from '@/lib/core/password';

const idle: AuthState = { status: 'idle', message: '' };

function CheckEmail({ email, next }: { email: string; next: string }) {
  const [state, action] = useActionState(resendConfirmation, idle);
  return (
    <div role="status" className="space-y-4">
      <p className="font-serif text-2xl">Check your inbox.</p>
      <p className="text-ink-soft text-[15px] leading-relaxed">
        We sent a confirmation link to{' '}
        <span className="text-ink font-medium">{email}</span>. Open it in this
        browser to finish creating your account.
      </p>
      {state.status === 'resent' ? (
        <p className="text-ink-soft text-[14px]">Sent again.</p>
      ) : (
        <form action={action}>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={next} />
          {state.status === 'error' && (
            <p role="alert" className="text-alert mb-2 text-[13px]">
              {state.message}
            </p>
          )}
          <button
            type="submit"
            className="text-ink-soft hover:text-ink text-[14px] underline underline-offset-4"
          >
            Didn’t get it? Send it again
          </button>
        </form>
      )}
    </div>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(signUp, idle);

  if (state.status === 'check-email' && state.email) {
    return <CheckEmail email={state.email} next={next} />;
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
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
          aria-invalid={state.field === 'email'}
          aria-describedby="register-msg"
          className={inputClass}
        />
      </div>
      <PasswordInput
        name="password"
        label="Choose a password"
        autoComplete="new-password"
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        invalid={state.field === 'password'}
        describedBy="register-msg"
      />
      <p
        id="register-msg"
        aria-live="polite"
        className="text-alert text-[13px] empty:hidden"
      >
        {state.status === 'error' ? state.message : ''}
      </p>
      <SubmitButton label="Create account" pendingLabel="Creating account…" />
    </form>
  );
}
