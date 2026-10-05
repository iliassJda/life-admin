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
      className="text-alert text-[14px] hover:underline disabled:opacity-60"
    >
      {pending ? 'Deleting…' : 'Delete this item'}
    </button>
  );
}
