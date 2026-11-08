import type { Metadata } from 'next';
import Link from 'next/link';
import { safeNextPath } from '@/lib/core/redirect';
import { site } from '@/lib/core/site';
import { AuthCard } from '../auth/auth-card';
import { GoogleSignIn } from '../auth/ui';
import { RegisterForm } from './register-form';

export const metadata: Metadata = {
  title: `Create an account — ${site.name}`,
  robots: { index: false },
};

export default async function RegisterPage(props: PageProps<'/register'>) {
  const query = await props.searchParams;
  const next = safeNextPath(query.next);
  const loginHref =
    next === '/app' ? '/login' : `/login?next=${encodeURIComponent(next)}`;

  return (
    <AuthCard
      title="Create your account"
      intro="Add what renews or expires, and we’ll remind you in time."
      footer={
        <>
          Already have an account?{' '}
          <Link
            href={loginHref}
            className="text-ink font-medium underline underline-offset-4"
          >
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm next={next} />
      <GoogleSignIn next={next} />
    </AuthCard>
  );
}
