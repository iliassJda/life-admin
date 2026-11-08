'use server';

import { redirect } from 'next/navigation';
import { isOwnDocumentPath } from '@/lib/core/documents';
import {
  parseItemForm,
  type ItemErrors,
  type ItemInput,
} from '@/lib/core/items';
import { parseReminderDays } from '@/lib/core/settings';
import { requireUser } from '@/lib/server/auth';

export type ItemFormState = {
  errors: ItemErrors;
  message?: string;
  values?: Record<string, string>;
};

const FIELDS = [
  'kind',
  'name',
  'keyDate',
  'repeat',
  'amount',
  'currency',
  'notes',
] as const;

function fieldsFrom(formData: FormData): Record<string, string> {
  return {
    ...Object.fromEntries(
      FIELDS.map((key) => [key, String(formData.get(key) ?? '')]),
    ),
    reminderMode:
      formData.get('reminderMode') === 'custom' ? 'custom' : 'default',
    reminderDays: formData.getAll('reminderDays').map(String).join(','),
    filePath: String(formData.get('filePath') ?? ''),
    unused: formData.get('unused') === 'on' ? 'on' : '',
    unusedSince: String(formData.get('unusedSince') ?? ''),
    keepFile: formData.get('keepFile') === 'on' ? 'on' : '',
  };
}

type Reminders = { custom: false } | { custom: true; days: number[] };

function parseReminders(
  values: Record<string, string>,
): Reminders | { error: string } {
  if (values.reminderMode !== 'custom') return { custom: false };
  const days = parseReminderDays(
    values.reminderDays ? values.reminderDays.split(',') : [],
  );
  if (!days) return { error: 'Choose from the listed reminder days.' };
  if (days.length === 0) return { error: 'Pick at least one reminder day.' };
  return { custom: true, days };
}

type UserClient = Awaited<ReturnType<typeof requireUser>>['supabase'];

// An item's own rules replace the defaults; no own rules means defaults apply.
async function saveReminders(
  supabase: UserClient,
  userId: string,
  itemId: string,
  reminders: Reminders,
): Promise<boolean> {
  const { error: deleteError } = await supabase
    .from('reminder_rules')
    .delete()
    .eq('item_id', itemId);
  if (deleteError) return false;
  if (!reminders.custom) return true;
  const { error } = await supabase.from('reminder_rules').insert(
    reminders.days.map((d) => ({
      user_id: userId,
      item_id: itemId,
      days_before: d,
    })),
  );
  return !error;
}

function validate(values: Record<string, string>) {
  const parsed = parseItemForm(values);
  const reminders = parseReminders(values);
  const errors: ItemErrors = parsed.ok ? {} : { ...parsed.errors };
  if ('error' in reminders) errors.reminders = reminders.error;
  if (!parsed.ok || 'error' in reminders) {
    return { ok: false as const, errors };
  }
  return { ok: true as const, value: parsed.value, reminders };
}

// Keeps the original "marked unused" time when an unused item is saved again.
function unusedSince(value: ItemInput, values: Record<string, string>) {
  if (value.kind === 'document' || values.unused !== 'on') return null;
  const since = Date.parse(values.unusedSince);
  return Number.isNaN(since)
    ? new Date().toISOString()
    : new Date(since).toISOString();
}

function toRow(value: ItemInput) {
  return {
    kind: value.kind,
    name: value.name,
    key_date: value.keyDate,
    recurrence_unit: value.recurrence?.unit ?? null,
    recurrence_interval: value.recurrence?.interval ?? null,
    amount: value.amount,
    currency: value.currency,
    notes: value.notes,
  };
}

const SAVE_FAILED = 'We couldn’t save this. Please try again.';

export async function createItem(
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const values = fieldsFrom(formData);
  const parsed = validate(values);
  if (!parsed.ok) return { errors: parsed.errors, values };

  const { supabase, id: userId } = await requireUser();
  // A scanned file stays only when the person chose to keep it.
  const filePath = isOwnDocumentPath(values.filePath, userId)
    ? values.filePath
    : null;
  const keep = Boolean(filePath) && values.keepFile === 'on';
  const { data, error } = await supabase
    .from('items')
    .insert({
      ...toRow(parsed.value),
      unused_since: unusedSince(parsed.value, values),
      file_path: keep ? filePath : null,
    })
    .select('id')
    .single();
  if (error || !data) return { errors: {}, message: SAVE_FAILED, values };
  if (!(await saveReminders(supabase, userId, data.id, parsed.reminders))) {
    return { errors: {}, message: SAVE_FAILED, values };
  }
  if (filePath && !keep) {
    await supabase.storage.from('documents').remove([filePath]);
  }
  redirect('/app');
}

export async function updateItem(
  id: string,
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const values = fieldsFrom(formData);
  const parsed = validate(values);
  if (!parsed.ok) return { errors: parsed.errors, values };

  const { supabase, id: userId } = await requireUser();
  const { data, error } = await supabase
    .from('items')
    .update({
      ...toRow(parsed.value),
      unused_since: unusedSince(parsed.value, values),
    })
    .eq('id', id)
    .select('id');
  if (error || data.length === 0) {
    return { errors: {}, message: SAVE_FAILED, values };
  }
  if (!(await saveReminders(supabase, userId, id, parsed.reminders))) {
    return { errors: {}, message: SAVE_FAILED, values };
  }
  redirect('/app');
}

export async function deleteItem(id: string) {
  const { supabase } = await requireUser();
  const { data } = await supabase
    .from('items')
    .delete()
    .eq('id', id)
    .select('file_path');
  const paths = (data ?? []).map((r) => r.file_path).filter(Boolean);
  if (paths.length > 0) {
    await supabase.storage.from('documents').remove(paths as string[]);
  }
  redirect('/app');
}

/** Deletes the stored document but keeps the item. */
export async function removeDocument(id: string) {
  const { supabase } = await requireUser();
  const { data: item } = await supabase
    .from('items')
    .select('file_path')
    .eq('id', id)
    .maybeSingle();
  if (item?.file_path) {
    const { error } = await supabase.storage
      .from('documents')
      .remove([item.file_path]);
    if (!error) {
      await supabase.from('items').update({ file_path: null }).eq('id', id);
    }
  }
  redirect(`/app/items/${id}`);
}
