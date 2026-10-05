import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/lib/core/site';
import { requireUser } from '@/lib/server/auth';

export const metadata: Metadata = {
  title: site.name,
  robots: { index: false },
};

export default async function AppLayout({ children }: LayoutProps<'/app'>) {
  const user = await requireUser();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-line border-b">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/app" className="font-serif text-2xl tracking-tight">
            {site.name}
            <span className="text-gold">.</span>
          </Link>
          <div className="flex items-center gap-4 text-[13px]">
            <span className="text-ink-faint hidden truncate sm:inline">
              {user.email}
            </span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="border-line text-ink-soft hover:border-ink-faint hover:text-ink rounded-full border px-3.5 py-1.5 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        {children}
      </main>
    </div>
  );
}
