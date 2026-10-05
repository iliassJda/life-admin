'use server';

import { redirect } from 'next/navigation';
import {
  parseItemForm,
  type ItemErrors,
  type ItemInput,
} from '@/lib/core/items';
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
  return Object.fromEntries(
    FIELDS.map((key) => [key, String(formData.get(key) ?? '')]),
  );
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
  const parsed = parseItemForm(values);
  if (!parsed.ok) return { errors: parsed.errors, values };

  const { supabase } = await requireUser();
  const { error } = await supabase.from('items').insert(toRow(parsed.value));
  if (error) return { errors: {}, message: SAVE_FAILED, values };
  redirect('/app');
}

export async function updateItem(
  id: string,
  _prev: ItemFormState,
  formData: FormData,
): Promise<ItemFormState> {
  const values = fieldsFrom(formData);
  const parsed = parseItemForm(values);
  if (!parsed.ok) return { errors: parsed.errors, values };

  const { supabase } = await requireUser();
  const { data, error } = await supabase
    .from('items')
    .update(toRow(parsed.value))
    .eq('id', id)
    .select('id');
  if (error || data.length === 0) {
    return { errors: {}, message: SAVE_FAILED, values };
  }
  redirect('/app');
}

export async function deleteItem(id: string) {
  const { supabase } = await requireUser();
  await supabase.from('items').delete().eq('id', id);
  redirect('/app');
}
