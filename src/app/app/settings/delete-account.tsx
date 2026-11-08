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
        className="text-alert text-[14px] hover:underline"
      >
        Delete my account…
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="border-alert/40 rounded-2xl border p-5"
    >
      <p className="text-[15px] font-medium">
        This permanently deletes your account, every item, its reminders and any
        uploaded documents. It can’t be undone.
      </p>
      <label
        htmlFor="confirm"
        className="text-ink-soft mt-4 mb-2 block text-[13px]"
      >
        Type <span className="text-ink font-medium">{email}</span> to confirm
      </label>
      <input
        id="confirm"
        name="confirm"
        autoComplete="off"
        required
        aria-invalid={Boolean(state.message)}
        aria-describedby="delete-msg"
        className="border-line bg-paper text-ink focus:border-alert w-full rounded-xl border px-4 py-3 text-[15px] outline-none"
      />
      <p
        id="delete-msg"
        aria-live="polite"
        className="text-alert mt-2 min-h-5 text-[13px]"
      >
        {state.message ?? ''}
      </p>
      <div className="mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-alert rounded-full px-5 py-2.5 text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending ? 'Deleting…' : 'Delete everything'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-ink-soft hover:text-ink px-3 py-2.5 text-[14px]"
        >
          Keep my account
        </button>
      </div>
    </form>
  );
}
