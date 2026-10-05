'use server';

import { isValidEmail, normalizeEmail } from '@/lib/core/email';
import { isTrackOption } from '@/lib/core/waitlist';
import { addToWaitlist, recordAnswer } from '@/lib/server/waitlist';

export type WaitlistState = {
  status: 'idle' | 'success' | 'error';
  message: string;
  email?: string;
};

export type AnswerState = {
  status: 'idle' | 'success' | 'error';
  message: string;
};

export async function joinWaitlist(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  if (formData.get('company')) {
    return { status: 'success', message: "You're on the list." };
  }

  const email = normalizeEmail(formData.get('email'));

  if (!isValidEmail(email)) {
    return { status: 'error', message: 'Please enter a valid email address.' };
  }

  try {
    const result = await addToWaitlist(email);
    return {
      status: 'success',
      email,
      message:
        result === 'exists'
          ? "You're already on the list — we'll be in touch."
          : "You're on the list. We'll write when your invitation is ready.",
    };
  } catch {
    return {
      status: 'error',
      message: 'Something went wrong. Please try again in a moment.',
    };
  }
}

export async function saveAnswer(
  _prev: AnswerState,
  formData: FormData,
): Promise<AnswerState> {
  const email = normalizeEmail(formData.get('email'));
  const track = formData.getAll('track').map(String).filter(isTrackOption);
  const other = String(formData.get('other') ?? '')
    .trim()
    .slice(0, 200);

  if (track.length === 0 && !other) {
    return { status: 'error', message: 'Pick at least one, or tell us below.' };
  }

  try {
    const saved = await recordAnswer(email, track, other);
    if (!saved) {
      return { status: 'error', message: 'Please join the waitlist first.' };
    }
    return { status: 'success', message: 'Thank you — that genuinely helps.' };
  } catch {
    return {
      status: 'error',
      message: 'Something went wrong. Please try again in a moment.',
    };
  }
}
