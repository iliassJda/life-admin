'use client';

import { useActionState } from 'react';
import { MIN_PASSWORD_LENGTH } from '@/lib/core/password';
import { updatePassword, type AuthState } from '../auth/actions';
import { PasswordInput, SubmitButton } from '../auth/ui';

const idle: AuthState = { status: 'idle', message: '' };

export function ResetForm() {
  const [state, formAction] = useActionState(updatePassword, idle);

  return (
    <form action={formAction} className="space-y-5">
      <PasswordInput
        name="password"
        label="New password"
        autoComplete="new-password"
        hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
        invalid={state.field === 'password'}
        describedBy="reset-msg"
      />
      <PasswordInput
        name="confirm"
        label="Type it again"
        autoComplete="new-password"
        invalid={state.field === 'confirm'}
        describedBy="reset-msg"
      />
      <p id="reset-msg" aria-live="polite" className="st-error empty:hidden">
        {state.status === 'error' ? state.message : ''}
      </p>
      <SubmitButton label="Save new password" pendingLabel="Saving…" />
    </form>
  );
}
