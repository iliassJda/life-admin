'use client';

import { useFormStatus } from 'react-dom';

export function DeleteButton({ name }: { name: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(`Delete “${name}”? Its reminders will stop.`)) {
          e.preventDefault();
        }
      }}
      className="st-focus text-[15px] font-semibold text-(--st-red) underline-offset-4 hover:underline disabled:opacity-60"
    >
      {pending ? 'Deleting…' : 'Delete this item'}
    </button>
  );
}
