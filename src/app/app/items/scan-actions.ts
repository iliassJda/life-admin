'use server';

import { todayIn } from '@/lib/core/dates';
import { isOwnDocumentPath } from '@/lib/core/documents';
import type { ScanFields } from '@/lib/core/scan';
import { requireUser } from '@/lib/server/auth';
import { readDocument } from '@/lib/server/gemini';

export type ScanResult =
  | { status: 'read'; fields: ScanFields; confident: boolean }
  | { status: 'unreadable' }
  | { status: 'error'; message: string };

/**
 * Reads a document the browser already uploaded to the person's own folder.
 * Nothing is saved here: the result only pre-fills the form for them to check.
 */
export async function readScan(path: string): Promise<ScanResult> {
  const { supabase, id } = await requireUser();
  if (!isOwnDocumentPath(path, id)) {
    return { status: 'error', message: 'That file can’t be read.' };
  }

  const { data: file, error } = await supabase.storage
    .from('documents')
    .download(path);
  if (error || !file) {
    return {
      status: 'error',
      message: 'We couldn’t open the upload. Please try again.',
    };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('time_zone')
    .eq('id', id)
    .maybeSingle();
  const today = todayIn(profile?.time_zone ?? 'Europe/Brussels');

  const outcome = await readDocument(
    await file.arrayBuffer(),
    file.type,
    today,
  );
  if (outcome.ok) {
    return {
      status: 'read',
      fields: outcome.fields,
      confident: outcome.confident,
    };
  }
  if (outcome.reason === 'failed') {
    return {
      status: 'error',
      message:
        'Reading the document didn’t work this time. Fill in the details below, or try again.',
    };
  }
  return { status: 'unreadable' };
}
