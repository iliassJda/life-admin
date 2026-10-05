'use client';

import { useActionState } from 'react';
import { sendMagicLink, signInWithGoogle, type LoginState } from './actions';

const initialState: LoginState = { status: 'idle', message: '' };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(
    sendMagicLink,
    initialState,
  );

  if (state.status === 'sent') {
    return (
      <div role="status" className="text-center">
        <p className="font-serif text-2xl">Check your inbox.</p>
        <p className="text-ink-soft mt-3 text-[15px] leading-relaxed">
          We sent a sign-in link to{' '}
          <span className="text-ink font-medium">{state.email}</span>. Open it
          in this browser to continue.
        </p>
      </div>
    );
  }

  return (
    <div>
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="next" value={next} />
        <label htmlFor="email" className="text-ink-soft block text-[13px]">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={state.status === 'error'}
          aria-describedby="login-msg"
          className="border-line bg-paper text-ink placeholder:text-ink-faint focus:border-accent w-full rounded-xl border px-4 py-3 text-[15px] outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-accent-ink focus-visible:outline-accent w-full rounded-xl px-4 py-3 text-[15px] font-medium transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
        >
          {pending ? 'Sending…' : 'Email me a sign-in link'}
        </button>
        <p
          id="login-msg"
          aria-live="polite"
          className="text-alert min-h-5 text-[13px]"
        >
          {state.status === 'error' ? state.message : ''}
        </p>
      </form>

      <div className="text-ink-faint my-4 flex items-center gap-3 text-[12px] tracking-[0.15em] uppercase">
        <span className="bg-line h-px flex-1" />
        or
        <span className="bg-line h-px flex-1" />
      </div>

      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="border-line text-ink hover:border-ink-faint w-full rounded-xl border px-4 py-3 text-[15px] font-medium transition-colors"
        >
          Continue with Google
        </button>
      </form>
    </div>
  );
}
