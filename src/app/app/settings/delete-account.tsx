'use client';

import { useActionState, useState } from 'react';
import { deleteAccount, type DeleteState } from './actions';

export function DeleteAccount({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<DeleteState, FormData>(
    deleteAccount,
    {},
  );

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="st-focus text-[15px] font-semibold text-(--st-red) underline-offset-4 hover:underline"
      >
        Delete my account…
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="rounded-[3px] border border-(--st-red) p-5"
    >
      <p className="text-[15px] font-medium">
        This permanently deletes your account, every item, its reminders and any
        uploaded documents. It can’t be undone.
      </p>
      <label htmlFor="confirm" className="st-field-label mt-4">
        Type <span className="font-semibold text-(--st-white)">{email}</span> to
        confirm
      </label>
      <input
        id="confirm"
        name="confirm"
        autoComplete="off"
        required
        aria-invalid={Boolean(state.message)}
        aria-describedby="delete-msg"
        className="st-input focus:border-(--st-red)!"
      />
      <p id="delete-msg" aria-live="polite" className="st-error mt-2 min-h-5">
        {state.message ?? ''}
      </p>
      <div className="mt-2 flex items-center gap-3">
        <button type="submit" disabled={pending} className="st-btn-danger">
          {pending ? 'Deleting…' : 'Delete everything'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="st-focus px-3 py-2.5 text-[14px] font-semibold text-(--st-dim) hover:text-(--st-white)"
        >
          Keep my account
        </button>
      </div>
    </form>
  );
}
