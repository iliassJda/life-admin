'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { parseSettingsForm, type SettingsErrors } from '@/lib/core/settings';
import { requireUser } from '@/lib/server/auth';
import { supabaseAdmin } from '@/lib/server/supabase';

export type SettingsState = {
  errors: SettingsErrors;
  message?: string;
  saved?: boolean;
};

export async function saveSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const parsed = parseSettingsForm({
    timeZone: String(formData.get('timeZone') ?? ''),
    reminderTime: String(formData.get('reminderTime') ?? ''),
    emailReminders: formData.get('emailReminders') === 'on',
    defaultDays: formData.getAll('defaultDays').map(String),
  });
  if (!parsed.ok) return { errors: parsed.errors };
  const { timeZone, reminderTime, emailReminders, defaultDays } = parsed.value;

  const { supabase, id } = await requireUser();
  const failed: SettingsState = {
    errors: {},
    message: 'We couldn’t save your settings. Please try again.',
  };

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      time_zone: timeZone,
      reminder_time: reminderTime,
      email_reminders: emailReminders,
    })
    .eq('id', id);
  if (profileError) return failed;

  // Replace the default rules (the ones not tied to an item).
  const { error: deleteError } = await supabase
    .from('reminder_rules')
    .delete()
    .is('item_id', null)
    .not('days_before', 'in', `(${defaultDays.join(',')})`);
  if (deleteError) return failed;
  const { error: insertError } = await supabase.from('reminder_rules').upsert(
    defaultDays.map((d) => ({ user_id: id, item_id: null, days_before: d })),
    { onConflict: 'user_id,item_id,days_before', ignoreDuplicates: true },
  );
  if (insertError) return failed;

  revalidatePath('/app', 'layout');
  return { errors: {}, saved: true };
}

export type DeleteState = { message?: string };

export async function deleteAccount(
  _prev: DeleteState,
  formData: FormData,
): Promise<DeleteState> {
  const { supabase, id, email } = await requireUser();
  const typed = String(formData.get('confirm') ?? '')
    .trim()
    .toLowerCase();
  if (!email || typed !== email.toLowerCase()) {
    return { message: 'Type your email address exactly to confirm.' };
  }

  // Uploaded documents first: they live outside the database.
  const { data: files } = await supabaseAdmin
    .from('items')
    .select('file_path')
    .eq('user_id', id)
    .not('file_path', 'is', null);
  const paths = (files ?? []).map((f) => f.file_path!).filter(Boolean);
  if (paths.length > 0) {
    const { error } = await supabaseAdmin.storage
      .from('documents')
      .remove(paths);
    if (error) {
      return {
        message:
          'We couldn’t delete your files. Nothing was removed; please try again.',
      };
    }
  }

  // Deleting the login removes everything else: every table cascades from it.
  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) {
    return { message: 'We couldn’t delete your account. Please try again.' };
  }
  await supabaseAdmin
    .from('waitlist')
    .delete()
    .eq('email', email.toLowerCase());
  await supabase.auth.signOut();
  redirect('/?account=deleted');
}
