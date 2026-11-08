'use server';

import { redirect } from 'next/navigation';
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
  const { data, error } = await supabase
    .from('items')
    .insert(toRow(parsed.value))
    .select('id')
    .single();
  if (error || !data) return { errors: {}, message: SAVE_FAILED, values };
  if (!(await saveReminders(supabase, userId, data.id, parsed.reminders))) {
    return { errors: {}, message: SAVE_FAILED, values };
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
    .update(toRow(parsed.value))
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
  await supabase.from('items').delete().eq('id', id);
  redirect('/app');
}
