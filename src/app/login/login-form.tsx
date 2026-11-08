'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { resendConfirmation, signIn, type AuthState } from '../auth/actions';
import { inputClass, PasswordInput, SubmitButton } from '../auth/ui';

const idle: AuthState = { status: 'idle', message: '' };

function ResendConfirmation({ email, next }: { email: string; next: string }) {
  const [state, action] = useActionState(resendConfirmation, idle);
  if (state.status === 'resent') {
    return (
      <p role="status" className="text-ink-soft text-[14px]">
        Sent. Check your inbox for a new confirmation link.
      </p>
    );
  }
  return (
    <form action={action}>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="next" value={next} />
      {state.status === 'error' && (
        <p role="alert" className="text-alert mb-2 text-[13px]">
          {state.message}
        </p>
      )}
      <SubmitButton
        label="Send the confirmation link again"
        pendingLabel="Sending…"
      />
    </form>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(signIn, idle);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <div>
          <label
            htmlFor="email"
            className="text-ink-soft mb-2 block text-[13px]"
          >
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
            aria-describedby="login-msg"
            className={inputClass}
          />
        </div>
        <PasswordInput
          name="password"
          label="Password"
          autoComplete="current-password"
          invalid={state.status === 'error' && state.field !== 'email'}
          describedBy="login-msg"
        />
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-ink-soft hover:text-ink text-[13px] underline-offset-4 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
        <p
          id="login-msg"
          aria-live="polite"
          className="text-alert text-[13px] empty:hidden"
        >
          {state.status === 'error' ? state.message : ''}
        </p>
        <SubmitButton label="Sign in" pendingLabel="Signing in…" />
      </form>

      {state.status === 'unconfirmed' && state.email && (
        <div
          role="alert"
          className="bg-paper space-y-3 rounded-xl px-4 py-4 text-[14px]"
        >
          <p>
            Confirm your email first. We sent a link to{' '}
            <span className="font-medium">{state.email}</span> when you
            registered.
          </p>
          <ResendConfirmation email={state.email} next={next} />
        </div>
      )}
    </div>
  );
}
