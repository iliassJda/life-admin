import 'server-only';
import { redirect } from 'next/navigation';
import { createUserClient } from './supabase-user';

export async function getCurrentUser() {
  const supabase = await createUserClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) return null;
  return {
    id: data.claims.sub,
    email: typeof data.claims.email === 'string' ? data.claims.email : null,
    supabase,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}
