'use client';

import { useId, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { signInWithGoogle } from './actions';

export const inputClass =
  'border-line bg-paper text-ink placeholder:text-ink-faint focus:border-accent aria-[invalid=true]:border-alert w-full rounded-xl border px-4 py-3 text-[15px] outline-none';

export const primaryButtonClass =
  'bg-accent text-accent-ink focus-visible:outline-accent w-full rounded-xl px-4 py-3 text-[15px] font-medium transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60';

export function PasswordInput({
  name,
  label,
  autoComplete,
  invalid,
  describedBy,
  hint,
}: {
  name: string;
  label: string;
  autoComplete: 'current-password' | 'new-password';
  invalid?: boolean;
  describedBy?: string;
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div>
      <label htmlFor={id} className="text-ink-soft mb-2 block text-[13px]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          required
          autoComplete={autoComplete}
          aria-invalid={invalid}
          aria-describedby={
            [hint ? hintId : null, describedBy].filter(Boolean).join(' ') ||
            undefined
          }
          className={`${inputClass} pr-20`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="text-ink-soft hover:text-ink focus-visible:outline-accent absolute inset-y-1 right-1 rounded-lg px-3 text-[13px] focus-visible:outline-2"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {hint && (
        <p id={hintId} className="text-ink-faint mt-1.5 text-[13px]">
          {hint}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={primaryButtonClass}>
      {pending ? pendingLabel : label}
    </button>
  );
}

function GoogleButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="border-line text-ink hover:border-ink-faint focus-visible:outline-accent flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-[15px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
    >
      <svg aria-hidden="true" viewBox="0 0 18 18" className="size-[18px]">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.61Z"
        />
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
        />
        <path
          fill="#FBBC05"
          d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33Z"
        />
        <path
          fill="#EA4335"
          d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
        />
      </svg>
      {pending ? 'Opening Google…' : 'Continue with Google'}
    </button>
  );
}

export function GoogleSignIn({ next }: { next: string }) {
  return (
    <>
      <div className="text-ink-faint my-5 flex items-center gap-3 text-[13px]">
        <span className="bg-line h-px flex-1" />
        or
        <span className="bg-line h-px flex-1" />
      </div>
      <form action={signInWithGoogle}>
        <input type="hidden" name="next" value={next} />
        <GoogleButton />
      </form>
    </>
  );
}
