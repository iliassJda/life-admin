import Link from 'next/link';
import { todayIn } from '@/lib/core/dates';
import { formatAmount, formatLocalDate } from '@/lib/core/format';
import { KIND_LABELS } from '@/lib/core/items';
import { PRESETS } from '@/lib/core/presets';
import {
  buildUpcoming,
  describeDaysUntil,
  GROUP_LABELS,
  type UpcomingGroup,
} from '@/lib/core/upcoming';
import { requireUser } from '@/lib/server/auth';

const GROUP_ORDER: UpcomingGroup[] = ['past', 'week', 'month', 'later'];

// Red is for due or overdue, amber for soon, white for later (DESIGN.md).
function tone(daysUntil: number): string {
  if (daysUntil <= 1) return 'st-tone-red';
  if (daysUntil <= 30) return 'st-tone-amber';
  return '';
}

function DayTiles({ days }: { days: number }) {
  const shown = String(Math.min(Math.abs(days), 999)).padStart(3, ' ');
  return (
    <span className={`st-static-tiles ${tone(days)}`} aria-hidden="true">
      {Array.from(shown).map((ch, i) => (
        <span key={i}>{ch === ' ' ? ' ' : ch}</span>
      ))}
    </span>
  );
}

export default async function AppHome() {
  const { supabase, id } = await requireUser();
  const [{ data: items }, { data: profile }] = await Promise.all([
    supabase.from('items').select('*'),
    supabase.from('profiles').select('time_zone').eq('id', id).maybeSingle(),
  ]);

  const today = todayIn(profile?.time_zone ?? 'Europe/Brussels');
  const groups = buildUpcoming(items ?? [], today);
  const isEmpty = !items || items.length === 0;

  // What is due within 30 days, per currency.
  const dueSoon = new Map<string, number>();
  for (const group of ['week', 'month'] as const) {
    for (const { item, daysUntil } of groups[group]) {
      if (item.amount !== null && daysUntil <= 30) {
        dueSoon.set(
          item.currency,
          (dueSoon.get(item.currency) ?? 0) + Number(item.amount),
        );
      }
    }
  }

  if (isEmpty) {
    return (
      <div className="max-w-2xl">
        <h1 className="st-heading text-[44px] sm:text-[56px]">
          Nothing on your board yet.
        </h1>
        <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-(--st-dim)">
          Add the first thing with a date attached: a subscription, a document
          or a contract. We’ll email you 30, 7 and 1 day before it renews or
          expires.
        </p>
        <h2 className="st-label mt-10 mb-3">Start with a common one</h2>
        <div className="flex flex-wrap gap-2">
          {PRESETS.slice(0, 8).map((p) => (
            <Link
              key={p.id}
              href={`/app/items/new?preset=${p.id}`}
              className="st-chip"
            >
              <svg aria-hidden="true" viewBox="0 0 12 12" className="size-3">
                <path
                  d="M6 1v10M1 6h10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  fill="none"
                />
              </svg>
              {p.name}
            </Link>
          ))}
        </div>
        <Link href="/app/items/new" className="st-btn mt-8">
          Add something else
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
        <h1 className="st-heading text-[44px] sm:text-[56px]">Upcoming</h1>
        <p className="text-[15px] text-(--st-dim)">
          {items.length} {items.length === 1 ? 'item' : 'items'}
          {dueSoon.size > 0 && (
            <>
              {' · '}
              <span className="st-num font-semibold text-(--st-amber)">
                {[...dueSoon]
                  .map(([currency, total]) => formatAmount(total, currency))
                  .join(' + ')}
              </span>{' '}
              due in the next 30 days
            </>
          )}
        </p>
      </div>

      <div className="mt-10 space-y-12">
        {GROUP_ORDER.filter((g) => groups[g].length > 0).map((group) => (
          <section key={group} aria-labelledby={`group-${group}`}>
            <h2
              id={`group-${group}`}
              className={`st-label mb-1 border-b border-(--st-rule) pb-3 ${
                group === 'past' ? 'text-(--st-red)!' : ''
              }`}
            >
              {GROUP_LABELS[group]}
            </h2>
            <ul>
              {groups[group].map(({ item, date, daysUntil }) => (
                <li key={item.id} className="border-b border-(--st-rule)">
                  <Link
                    href={`/app/items/${item.id}`}
                    className="st-focus -mx-3 grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-[3px] px-3 py-4 transition-colors hover:bg-(--st-housing) sm:gap-6"
                  >
                    <DayTiles days={daysUntil} />
                    <span className="min-w-0">
                      <span className="block truncate text-[17px] font-semibold">
                        {item.name}
                      </span>
                      <span className="mt-0.5 block text-[14px] text-(--st-dim)">
                        <span
                          className={
                            daysUntil <= 1
                              ? 'font-semibold text-(--st-red)'
                              : daysUntil <= 30
                                ? 'font-semibold text-(--st-amber)'
                                : ''
                          }
                        >
                          {describeDaysUntil(daysUntil)}
                        </span>
                        {' · '}
                        {formatLocalDate(date)}
                        <span className="hidden sm:inline">
                          {' · '}
                          {KIND_LABELS[item.kind]}
                        </span>
                      </span>
                    </span>
                    <span className="st-num text-right text-[16px] font-semibold">
                      {item.amount !== null
                        ? formatAmount(Number(item.amount), item.currency)
                        : ''}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
