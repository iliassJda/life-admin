import type { Metadata } from 'next';
import Link from 'next/link';
import { safeNextPath } from '@/lib/core/redirect';
import { site } from '@/lib/core/site';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: `Sign in — ${site.name}`,
  robots: { index: false },
};

const errors: Record<string, string> = {
  link: 'That link has expired or was already used. Request a new one below.',
  google: 'Google sign-in didn’t work. Try again, or use your email instead.',
};

export default async function LoginPage(props: PageProps<'/login'>) {
  const query = await props.searchParams;
  const next = safeNextPath(query.next);
  const error = typeof query.error === 'string' ? errors[query.error] : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="font-serif text-3xl tracking-tight">
        {site.name}
        <span className="text-gold">.</span>
      </Link>
      <div className="border-line bg-paper-raised mt-10 w-full max-w-sm rounded-3xl border p-8 shadow-[0_30px_60px_-30px_rgba(40,30,10,0.2)]">
        <h1 className="font-serif text-2xl font-light">Sign in</h1>
        <p className="text-ink-soft mt-2 mb-6 text-[14px] leading-relaxed">
          No password needed. New here? Signing in creates your account.
        </p>
        {error && (
          <p
            role="alert"
            className="bg-paper text-alert mb-5 rounded-xl px-4 py-3 text-[13px]"
          >
            {error}
          </p>
        )}
        <LoginForm next={next} />
      </div>
    </main>
  );
}
