import Link from 'next/link';
import { site } from '@/lib/core/site';

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
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <Link href="/" className="font-serif text-3xl tracking-tight">
        {site.name}
        <span className="text-gold">.</span>
      </Link>
      <div className="border-line bg-paper-raised mt-10 w-full max-w-sm rounded-3xl border p-8 shadow-[0_30px_60px_-30px_rgba(40,30,10,0.2)]">
        <h1 className="font-serif text-2xl font-light">{title}</h1>
        {intro && (
          <p className="text-ink-soft mt-2 text-[14px] leading-relaxed">
            {intro}
          </p>
        )}
        {alert && (
          <p
            role="alert"
            className="bg-paper text-alert mt-5 rounded-xl px-4 py-3 text-[13px]"
          >
            {alert}
          </p>
        )}
        <div className="mt-6">{children}</div>
      </div>
      {footer && <p className="text-ink-soft mt-6 text-[14px]">{footer}</p>}
    </main>
  );
}
