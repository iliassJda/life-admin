import 'server-only';
import { supabaseAdmin as db } from './supabase';

// Uploads younger than this may still be on someone's open "Add item" form.
const GRACE_MS = 24 * 60 * 60 * 1000;

/**
 * Deletes scanned uploads that never became part of an item: the person
 * scanned something and then left without saving.
 */
export async function removeAbandonedDocuments(now = new Date()) {
  let removed = 0;
  const { data: profiles, error } = await db.from('profiles').select('id');
  if (error) throw error;

  for (const { id } of profiles ?? []) {
    const { data: files } = await db.storage
      .from('documents')
      .list(id, { limit: 1000 });
    if (!files || files.length === 0) continue;

    const { data: items } = await db
      .from('items')
      .select('file_path')
      .eq('user_id', id)
      .not('file_path', 'is', null);
    const kept = new Set((items ?? []).map((i) => i.file_path));

    const stale = files
      .filter(
        (f) =>
          f.created_at &&
          now.getTime() - Date.parse(f.created_at) > GRACE_MS &&
          !kept.has(`${id}/${f.name}`),
      )
      .map((f) => `${id}/${f.name}`);
    if (stale.length > 0) {
      const { error: removeError } = await db.storage
        .from('documents')
        .remove(stale);
      if (!removeError) removed += stale.length;
    }
  }
  return removed;
}
