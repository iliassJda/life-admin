import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/lib/core/site';
import { AuthCard } from '../auth/auth-card';
import { ForgotForm } from './forgot-form';

export const metadata: Metadata = {
  title: `Reset your password — ${site.name}`,
  robots: { index: false },
};

export default async function ForgotPasswordPage(
  props: PageProps<'/forgot-password'>,
) {
  const query = await props.searchParams;
  const expired = query.error === 'expired';

  return (
    <AuthCard
      title="Reset your password"
      intro="Enter the email you use for Kalends and we’ll send you a link to choose a new password."
      alert={
        expired
          ? 'That reset link has expired or was already used. Request a new one.'
          : null
      }
      footer={
        <Link
          href="/login"
          className="text-ink font-medium underline underline-offset-4"
        >
          Back to sign in
        </Link>
      }
    >
      <ForgotForm />
    </AuthCard>
  );
}
