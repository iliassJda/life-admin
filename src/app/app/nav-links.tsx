'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/app', label: 'Upcoming' },
  { href: '/app/settings', label: 'Settings' },
] as const;

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="flex items-center gap-1">
      {LINKS.map((link) => {
        const active =
          link.href === '/app'
            ? pathname === '/app' || pathname.startsWith('/app/items')
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className="st-focus relative px-3 py-2 text-[15px] font-semibold text-(--st-dim) transition-colors hover:text-(--st-white) aria-[current=page]:text-(--st-white) aria-[current=page]:after:absolute aria-[current=page]:after:inset-x-3 aria-[current=page]:after:-bottom-px aria-[current=page]:after:h-0.5 aria-[current=page]:after:bg-(--st-yellow)"
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
