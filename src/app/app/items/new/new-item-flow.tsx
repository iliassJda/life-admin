'use client';

import { useState, type ReactNode } from 'react';
import { createItem } from '../actions';
import { ItemForm } from '../item-form';
import { ScanPanel, type ScanState } from './scan-panel';

export function NewItemFlow({
  userId,
  initial,
  defaultsLabel,
  presets,
}: {
  userId: string;
  initial: Record<string, string>;
  defaultsLabel: string;
  presets: ReactNode;
}) {
  const [scan, setScan] = useState<ScanState | null>(null);

  const values =
    scan?.status === 'read'
      ? { ...initial, ...scan.fields, filePath: scan.filePath }
      : scan
        ? { ...initial, filePath: scan.filePath }
        : initial;

  return (
    <>
      <ScanPanel userId={userId} onResult={setScan} />

      {scan && (
        <p
          role="status"
          className={`mt-6 rounded-[3px] border px-4 py-3 text-[15px] leading-relaxed ${
            scan.status === 'read' && scan.confident
              ? 'border-(--st-rule)'
              : 'border-(--st-amber)'
          }`}
        >
          {scan.status === 'read' && scan.confident
            ? 'Filled in from your document. Check each field before you save.'
            : scan.status === 'read'
              ? 'Some details may be missing or wrong. Check each field closely before you save.'
              : 'We couldn’t find a name or date in that file. Fill in the details below; the file is attached.'}
        </p>
      )}

      {!scan && <div className="mt-8">{presets}</div>}

      <div className="mt-10">
        <ItemForm
          key={scan ? scan.filePath : 'manual'}
          action={createItem}
          submitLabel="Add item"
          defaultsLabel={defaultsLabel}
          initial={values}
        />
      </div>
    </>
  );
}
