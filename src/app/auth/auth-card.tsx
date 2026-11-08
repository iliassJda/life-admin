import Link from 'next/link';
import { site } from '@/lib/core/site';
import { Wordmark } from '../wordmark';

/** The shared frame for sign-in, register and password pages. */
export function AuthCard({
  title,
  intro,
  alert,
  children,
  footer,
}: {
  title: string;
  intro?: React.ReactNode;
  alert?: string | null;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-[1320px] items-center px-4 py-5 sm:px-8">
        <Link
          href="/"
          className="text-[30px] leading-none"
          aria-label={`${site.name} home`}
        >
          <Wordmark />
        </Link>
      </header>
      <main className="flex flex-1 justify-center px-4 pt-8 pb-20 sm:items-center sm:pt-0">
        <div className="w-full max-w-[420px]">
          <div
            className="mb-8 h-1.5 w-12 bg-(--st-yellow)"
            aria-hidden="true"
          />
          <h1 className="st-heading text-[44px] sm:text-[52px]">{title}</h1>
          {intro && (
            <p className="mt-4 text-[16px] leading-relaxed text-(--st-dim)">
              {intro}
            </p>
          )}
          {alert && (
            <p
              role="alert"
              className="mt-6 rounded-[3px] border border-(--st-red) px-4 py-3 text-[14px] leading-relaxed text-(--st-white)"
            >
              {alert}
            </p>
          )}
          <div className="mt-8">{children}</div>
          {footer && (
            <p className="mt-10 border-t border-(--st-rule) pt-6 text-[15px] text-(--st-dim)">
              {footer}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
