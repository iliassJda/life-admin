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

export default async function AppHome() {
  const { supabase, id } = await requireUser();
  const [{ data: items }, { data: profile }] = await Promise.all([
    supabase.from('items').select('*'),
    supabase.from('profiles').select('time_zone').eq('id', id).maybeSingle(),
  ]);

  const today = todayIn(profile?.time_zone ?? 'Europe/Brussels');
  const groups = buildUpcoming(items ?? [], today);
  const isEmpty = !items || items.length === 0;

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h1 className="font-serif text-4xl font-light">Upcoming</h1>
        {!isEmpty && (
          <Link
            href="/app/items/new"
            className="bg-accent text-accent-ink rounded-full px-5 py-2.5 text-[14px] font-medium transition-opacity hover:opacity-90"
          >
            Add item
          </Link>
        )}
      </div>

      {isEmpty ? (
        <div className="border-line bg-paper-raised mt-10 rounded-3xl border p-8 sm:p-10">
          <p className="font-serif text-2xl">Nothing to watch yet.</p>
          <p className="text-ink-soft mt-2 max-w-md text-[15px] leading-relaxed">
            Add the first thing with a date attached. We’ll email you 30, 7 and
            1 day before it renews or expires.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {PRESETS.slice(0, 6).map((p) => (
              <Link
                key={p.id}
                href={`/app/items/new?preset=${p.id}`}
                className="border-line text-ink-soft hover:border-ink-faint hover:text-ink rounded-full border px-3.5 py-1.5 text-[13px] transition-colors"
              >
                {p.name}
              </Link>
            ))}
            <Link
              href="/app/items/new"
              className="bg-accent text-accent-ink rounded-full px-3.5 py-1.5 text-[13px] font-medium"
            >
              Something else
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          {GROUP_ORDER.filter((g) => groups[g].length > 0).map((group) => (
            <section key={group}>
              <h2
                className={`mb-2 text-[12px] font-medium tracking-[0.18em] uppercase ${
                  group === 'past' ? 'text-alert' : 'text-gold'
                }`}
              >
                {GROUP_LABELS[group]}
              </h2>
              <ul className="divide-line border-line divide-y border-y">
                {groups[group].map(({ item, date, daysUntil }) => (
                  <li key={item.id}>
                    <Link
                      href={`/app/items/${item.id}`}
                      className="hover:bg-paper-raised -mx-3 flex items-center gap-4 rounded-xl px-3 py-4 transition-colors"
                    >
                      <span
                        className={`size-2 shrink-0 rounded-full ${
                          daysUntil < 0
                            ? 'bg-alert'
                            : daysUntil <= 7
                              ? 'bg-gold'
                              : 'bg-line'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium">
                          {item.name}
                        </p>
                        <p className="text-ink-faint text-[13px]">
                          {KIND_LABELS[item.kind]} · {formatLocalDate(date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-[13px] ${daysUntil < 0 ? 'text-alert' : 'text-ink-soft'}`}
                        >
                          {describeDaysUntil(daysUntil)}
                        </p>
                        {item.amount !== null && (
                          <p className="text-ink-soft font-serif text-[15px] tabular-nums">
                            {formatAmount(item.amount, item.currency)}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
