import type { Metadata } from 'next';
import Link from 'next/link';
import { safeNextPath } from '@/lib/core/redirect';
import { site } from '@/lib/core/site';
import { AuthCard } from '../auth/auth-card';
import { GoogleSignIn } from '../auth/ui';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: `Sign in — ${site.name}`,
  robots: { index: false },
};

const errors: Record<string, string> = {
  link: 'That link has expired or was already used. Sign in below, or request a new one.',
  google: 'Google sign-in didn’t work. Try again, or use your email instead.',
};

export default async function LoginPage(props: PageProps<'/login'>) {
  const query = await props.searchParams;
  const next = safeNextPath(query.next);
  const error = typeof query.error === 'string' ? errors[query.error] : null;
  const registerHref =
    next === '/app'
      ? '/register'
      : `/register?next=${encodeURIComponent(next)}`;

  return (
    <AuthCard
      title="Sign in"
      alert={error}
      footer={
        <>
          New to {site.name}?{' '}
          <Link
            href={registerHref}
            className="text-ink font-medium underline underline-offset-4"
          >
            Create an account
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
      <GoogleSignIn next={next} />
    </AuthCard>
  );
}
