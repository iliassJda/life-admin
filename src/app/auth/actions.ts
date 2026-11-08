'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { isValidEmail, normalizeEmail } from '@/lib/core/email';
import { passwordProblem } from '@/lib/core/password';
import { safeNextPath } from '@/lib/core/redirect';
import { createUserClient } from '@/lib/server/supabase-user';

export type AuthState = {
  status: 'idle' | 'error' | 'check-email' | 'unconfirmed' | 'resent';
  message: string;
  email?: string;
  field?: 'email' | 'password' | 'confirm';
};

async function callbackUrl(next: string) {
  const h = await headers();
  const origin =
    h.get('origin') ??
    `${h.get('x-forwarded-proto') ?? 'https'}://${h.get('host')}`;
  return `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

const TOO_MANY = 'Too many attempts. Please wait a minute and try again.';
const GENERIC = 'Something went wrong. Please try again in a moment.';

function errorState(
  message: string,
  email?: string,
  field?: AuthState['field'],
): AuthState {
  return { status: 'error', message, email, field };
}

export async function signIn(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(formData.get('email'));
  const password = String(formData.get('password') ?? '');
  const next = safeNextPath(formData.get('next'));
  if (!isValidEmail(email)) {
    return errorState('Enter a valid email address.', email, 'email');
  }
  if (!password) return errorState('Enter your password.', email, 'password');

  const supabase = await createUserClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.code === 'email_not_confirmed') {
      return { status: 'unconfirmed', message: '', email };
    }
    if (error.status === 429) return errorState(TOO_MANY, email);
    if (error.code === 'invalid_credentials') {
      return errorState('That email and password don’t match.', email);
    }
    return errorState(GENERIC, email);
  }
  redirect(next);
}

export async function signUp(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(formData.get('email'));
  const password = String(formData.get('password') ?? '');
  const next = safeNextPath(formData.get('next'));
  if (!isValidEmail(email)) {
    return errorState('Enter a valid email address.', email, 'email');
  }
  const problem = passwordProblem(password);
  if (problem) return errorState(problem, email, 'password');

  const supabase = await createUserClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: await callbackUrl(next) },
  });
  if (error) {
    if (error.status === 429) return errorState(TOO_MANY, email);
    if (error.code === 'weak_password') {
      return errorState(
        'Choose a stronger password: longer, and not a common one.',
        email,
        'password',
      );
    }
    if (error.code === 'user_already_exists') {
      return errorState(
        'There is already an account with this email. Sign in instead.',
        email,
        'email',
      );
    }
    return errorState(GENERIC, email);
  }
  // With email confirmation off, the account is ready straight away.
  if (data.session) redirect(next);
  // Same answer whether or not the email was already registered.
  return { status: 'check-email', message: '', email };
}

export async function resendConfirmation(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(formData.get('email'));
  const next = safeNextPath(formData.get('next'));
  if (!isValidEmail(email)) return errorState('Enter a valid email address.');

  const supabase = await createUserClient();
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: { emailRedirectTo: await callbackUrl(next) },
  });
  if (error) {
    return errorState(error.status === 429 ? TOO_MANY : GENERIC, email);
  }
  return { status: 'resent', message: '', email };
}

export async function requestPasswordReset(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = normalizeEmail(formData.get('email'));
  if (!isValidEmail(email)) {
    return errorState('Enter a valid email address.', email, 'email');
  }

  const supabase = await createUserClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: await callbackUrl('/reset-password'),
  });
  if (error?.status === 429) return errorState(TOO_MANY, email);
  // Never reveal whether an account exists for this email.
  return { status: 'check-email', message: '', email };
}

export async function updatePassword(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');
  const problem = passwordProblem(password);
  if (problem) return errorState(problem, undefined, 'password');
  if (password !== confirm) {
    return errorState('The two passwords don’t match.', undefined, 'confirm');
  }

  const supabase = await createUserClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.code === 'same_password') {
      return errorState(
        'That’s your current password. Choose a new one.',
        undefined,
        'password',
      );
    }
    if (error.code === 'weak_password') {
      return errorState(
        'Choose a stronger password: longer, and not a common one.',
        undefined,
        'password',
      );
    }
    if (error.status === 401 || error.code === 'session_not_found') {
      redirect('/forgot-password?error=expired');
    }
    return errorState(GENERIC);
  }
  redirect('/app');
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
