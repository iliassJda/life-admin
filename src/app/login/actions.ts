'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { isValidEmail, normalizeEmail } from '@/lib/core/email';
import { safeNextPath } from '@/lib/core/redirect';
import { createUserClient } from '@/lib/server/supabase-user';

export type LoginState = {
  status: 'idle' | 'sent' | 'error';
  message: string;
  email?: string;
};

async function callbackUrl(next: string) {
  const h = await headers();
  const origin =
    h.get('origin') ??
    `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('host')}`;
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

export async function sendMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = normalizeEmail(formData.get('email'));
  if (!isValidEmail(email)) {
    return { status: 'error', message: 'Please enter a valid email address.' };
  }

  const supabase = await createUserClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: await callbackUrl(safeNextPath(formData.get('next'))),
    },
  });

  if (error) {
    return {
      status: 'error',
      message:
        error.status === 429
          ? 'Too many attempts. Please wait a minute and try again.'
          : 'We couldn’t send the link. Please try again in a moment.',
    };
  }
  return { status: 'sent', email, message: '' };
}

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: await callbackUrl(safeNextPath(formData.get('next'))),
    },
  });
  if (error || !data.url) redirect('/login?error=google');
  redirect(data.url);
}
