import type { Metadata } from 'next';
import { site } from '@/lib/core/site';
import { requireUser } from '@/lib/server/auth';
import { AuthCard } from '../auth/auth-card';
import { ResetForm } from './reset-form';

export const metadata: Metadata = {
  title: `Choose a new password — ${site.name}`,
  robots: { index: false },
};

// Reached from the reset email, which signs the person in first.
export default async function ResetPasswordPage() {
  const { email } = await requireUser();

  return (
    <AuthCard
      title="Choose a new password"
      intro={
        email ? (
          <>
            For <span className="text-ink font-medium">{email}</span>.
          </>
        ) : null
      }
    >
      <ResetForm />
    </AuthCard>
  );
}
