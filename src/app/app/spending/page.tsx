import type { Metadata } from 'next';
import Link from 'next/link';
import { formatAmount } from '@/lib/core/format';
import { KIND_LABELS } from '@/lib/core/items';
import {
  describeRepeat,
  summarizeSpend,
  type CurrencySpend,
} from '@/lib/core/spend';
import { requireUser } from '@/lib/server/auth';

export const metadata: Metadata = { title: 'Spending' };

function Breakdown({ group }: { group: CurrencySpend }) {
  const money = (n: number) => formatAmount(n, group.currency);
  return (
    <table className="mt-6 w-full border-collapse text-left">
      <caption className="sr-only">
        Repeating costs in {group.currency}, most expensive first
      </caption>
      <thead className="max-sm:sr-only">
        <tr className="border-b border-(--st-rule)">
          <th scope="col" className="st-label py-3 font-semibold">
            Item
          </th>
          <th scope="col" className="st-label py-3 font-semibold">
            How often
          </th>
          <th scope="col" className="st-label py-3 text-right font-semibold">
            Per month
          </th>
          <th scope="col" className="st-label py-3 text-right font-semibold">
            Per year
          </th>
        </tr>
      </thead>
      <tbody>
        {group.rows.map(({ item, monthly, yearly, unused }) => (
          <tr
            key={item.id}
            className="grid grid-cols-[1fr_auto] gap-x-4 border-b border-(--st-rule) py-4 sm:table-row sm:py-0"
          >
            <th scope="row" className="font-normal sm:py-4 sm:pr-4">
              <Link
                href={`/app/items/${item.id}`}
                className="st-focus text-[16px] font-semibold hover:underline"
              >
                {item.name}
              </Link>
              <span className="mt-0.5 block text-[13px] text-(--st-dim)">
                {KIND_LABELS[item.kind]}
                {unused && (
                  <span className="ml-2 font-semibold text-(--st-amber)">
                    · Marked unused
                  </span>
                )}
              </span>
            </th>
            <td className="col-start-1 text-[14px] text-(--st-dim) sm:py-4 sm:pr-4">
              {describeRepeat(item.recurrence_unit, item.recurrence_interval)}
              {' · '}
              <span className="st-num">{money(Number(item.amount))}</span>
            </td>
            <td className="st-num hidden text-right text-[15px] sm:table-cell sm:py-4">
              {money(monthly)}
            </td>
            <td className="st-num col-start-2 row-span-2 row-start-1 self-center text-right text-[16px] font-semibold sm:py-4">
              {money(yearly)}
              <span className="block text-[12px] font-normal text-(--st-dim) sm:hidden">
                a year
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function SpendingPage() {
  const { supabase } = await requireUser();
  const { data: items } = await supabase
    .from('items')
    .select(
      'id, name, kind, amount, currency, recurrence_unit, recurrence_interval, unused_since',
    );
  const groups = summarizeSpend(items ?? []);

  if (groups.length === 0) {
    return (
      <div className="max-w-2xl">
        <h1 className="st-heading text-[44px] sm:text-[56px]">Spending</h1>
        <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-(--st-dim)">
          Nothing repeating with an amount yet. Add a subscription or contract
          with what it costs and how often, and you’ll see what it adds up to
          here.
        </p>
        <Link href="/app/items/new" className="st-btn mt-8">
          Add an item
        </Link>
      </div>
    );
  }

  const [main, ...others] = groups;
  const money = (n: number, c = main.currency) => formatAmount(n, c);
  const unusedRows = main.rows.filter((r) => r.unused);

  return (
    <div>
      <h1 className="st-heading text-[44px] sm:text-[56px]">Spending</h1>

      <p className="st-heading mt-8 max-w-[22ch] text-[32px] sm:text-[44px]">
        Your subscriptions cost{' '}
        <span className="st-num text-(--st-amber)">
          {money(main.subscriptionsMonthly)}
        </span>{' '}
        a month,{' '}
        <span className="st-num text-(--st-amber)">
          {money(main.subscriptionsYearly)}
        </span>{' '}
        a year.
      </p>
      {main.yearly !== main.subscriptionsYearly && (
        <p className="mt-4 text-[17px] text-(--st-dim)">
          With contracts and cover included:{' '}
          <span className="st-num font-semibold text-(--st-white)">
            {money(main.monthly)}
          </span>{' '}
          a month,{' '}
          <span className="st-num font-semibold text-(--st-white)">
            {money(main.yearly)}
          </span>{' '}
          a year.
        </p>
      )}

      {unusedRows.length > 0 && (
        <section
          aria-labelledby="unused-heading"
          className="mt-10 rounded-[3px] border border-(--st-amber) p-5 sm:p-6"
        >
          <h2 id="unused-heading" className="st-heading text-[26px]">
            Cancelling what you don’t use saves{' '}
            <span className="st-num text-(--st-amber)">
              {money(main.unusedYearly)}
            </span>{' '}
            a year
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-(--st-dim)">
            You marked {unusedRows.length === 1 ? 'this' : 'these'} as unused.
            Your reminders will tell you to cancel before the next charge.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {unusedRows.map(({ item, yearly }) => (
              <li key={item.id}>
                <Link href={`/app/items/${item.id}`} className="st-chip">
                  {item.name} ·{' '}
                  <span className="st-num">{money(yearly)} a year</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="breakdown-heading" className="mt-14">
        <h2 id="breakdown-heading" className="st-heading text-[30px]">
          What it’s made of
        </h2>
        <Breakdown group={main} />
      </section>

      {others.map((group) => (
        <section key={group.currency} className="mt-14">
          <h2 className="st-heading text-[30px]">
            In {group.currency}:{' '}
            <span className="st-num text-(--st-amber)">
              {money(group.monthly, group.currency)}
            </span>{' '}
            a month
          </h2>
          <p className="mt-2 text-[15px] text-(--st-dim)">
            Kept separate from your {main.currency} total, without converting.
          </p>
          <Breakdown group={group} />
        </section>
      ))}

      <p className="mt-10 max-w-[60ch] text-[14px] leading-relaxed text-(--st-dim)">
        Monthly figures spread yearly and quarterly charges evenly across the
        year. Items without an amount, or that don’t repeat, aren’t counted.
      </p>
    </div>
  );
}
