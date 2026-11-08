import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/lib/core/site';
import { Wordmark } from '../wordmark';
import { NavLinks } from './nav-links';
import { ServiceWorker } from './service-worker';

export const metadata: Metadata = {
  title: site.name,
  robots: { index: false },
};

export default function AppLayout({ children }: LayoutProps<'/app'>) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-(--st-rule)">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 sm:px-8">
          <Link
            href="/app"
            className="text-[28px] leading-none"
            aria-label={`${site.name}, upcoming`}
          >
            <Wordmark />
          </Link>
          <div className="order-last -mx-3 w-full sm:order-none sm:mx-0 sm:w-auto">
            <NavLinks />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/app/items/new"
              className="st-btn min-h-11 px-4 text-[14px]"
            >
              <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3">
                <path
                  d="M6 1v10M1 6h10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
              Add item
            </Link>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="st-focus text-[14px] font-semibold text-(--st-dim) hover:text-(--st-white)"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <ServiceWorker />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-8 sm:py-14">
        {children}
      </main>
    </div>
  );
}
