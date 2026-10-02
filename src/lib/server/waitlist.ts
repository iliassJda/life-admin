import 'server-only';
import { supabaseAdmin } from './supabase';

const UNIQUE_VIOLATION = '23505';

export async function addToWaitlist(
  email: string,
): Promise<'added' | 'exists'> {
  const { error } = await supabaseAdmin.from('waitlist').insert({ email });
  if (!error) return 'added';
  if (error.code === UNIQUE_VIOLATION) return 'exists';
  throw error;
}

export async function recordAnswer(
  email: string,
  track: string[],
  other: string,
): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('waitlist')
    .update({
      track,
      other: other || null,
      answered_at: new Date().toISOString(),
    })
    .eq('email', email)
    .select('id');
  if (error) throw error;
  return data.length > 0;
}
