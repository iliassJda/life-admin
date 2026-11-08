import type { Metadata } from 'next';
import Link from 'next/link';
import { todayIn, type LocalDate } from '@/lib/core/dates';
import { formatAmount, formatLocalDate } from '@/lib/core/format';
import { nextOccurrence } from '@/lib/core/recurrence';
import {
  describeRepeat,
  summarizeSpend,
  type CurrencySpend,
  type SpendRow,
} from '@/lib/core/spend';
import { requireUser } from '@/lib/server/auth';

export const metadata: Metadata = { title: 'Spending' };

type Row = SpendRow & { next: LocalDate | null };

function nextCharge(
  row: SpendRow,
  keyDates: Map<string, string>,
  today: LocalDate,
) {
  const anchor = keyDates.get(row.item.id);
  if (!anchor || !row.item.recurrence_unit || !row.item.recurrence_interval) {
    return null;
  }
  return nextOccurrence(
    anchor,
    { unit: row.item.recurrence_unit, interval: row.item.recurrence_interval },
    today,
  );
}

function Summary({ group }: { group: CurrencySpend }) {
  const money = (n: number) => formatAmount(n, group.currency);
  const otherMonthly =
    Math.round((group.monthly - group.subscriptionsMonthly) * 100) / 100;
  const otherYearly =
    Math.round((group.yearly - group.subscriptionsYearly) * 100) / 100;
  const cells = [
    {
      label: 'Subscriptions',
      monthly: group.subscriptionsMonthly,
      yearly: group.subscriptionsYearly,
    },
    { label: 'Contracts & cover', monthly: otherMonthly, yearly: otherYearly },
    {
      label: 'Total',
      monthly: group.monthly,
      yearly: group.yearly,
      total: true,
    },
  ];
  return (
    <dl className="grid rounded-[3px] border border-(--st-rule) sm:grid-cols-3">
      {cells.map((c, i) => (
        <div
          key={c.label}
          className={`flex items-baseline justify-between gap-4 px-5 py-4 sm:block sm:py-5 ${
            i > 0 ? 'border-t border-(--st-rule) sm:border-t-0 sm:border-l' : ''
          } ${c.total ? 'bg-(--st-housing)' : ''}`}
        >
          <dt className="text-[14px] font-semibold text-(--st-dim)">
            {c.label}
          </dt>
          <dd className="text-right sm:mt-2 sm:text-left">
            <span className="st-num block text-[22px] font-semibold sm:text-[28px]">
              {money(c.monthly)}
              <span className="ml-1.5 text-[13px] font-normal text-(--st-dim)">
                / month
              </span>
            </span>
            <span className="st-num mt-0.5 block text-[14px] text-(--st-dim)">
              {money(c.yearly)} / year
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Statement({ group, rows }: { group: CurrencySpend; rows: Row[] }) {
  const money = (n: number) => formatAmount(n, group.currency);
  const share = (yearly: number) =>
    group.yearly > 0 ? `${Math.round((yearly / group.yearly) * 100)}%` : '–';
  const sections = [
    {
      label: 'Subscriptions',
      rows: rows.filter((r) => r.item.kind === 'subscription'),
    },
    {
      label: 'Contracts & cover',
      rows: rows.filter((r) => r.item.kind !== 'subscription'),
    },
  ].filter((s) => s.rows.length > 0);

  const num = 'st-num py-3 pl-4 text-right whitespace-nowrap';
  return (
    <div className="mt-5 hidden overflow-x-auto sm:block">
      <table className="w-full min-w-[640px] border-collapse text-left text-[15px]">
        <caption className="sr-only">
          Recurring costs in {group.currency}, grouped by type
        </caption>
        <thead>
          <tr className="border-b border-(--st-rule) text-[13px] text-(--st-dim)">
            <th scope="col" className="py-3 pr-4 font-semibold">
              Item
            </th>
            <th scope="col" className="py-3 pr-4 font-semibold">
              Billing
            </th>
            <th scope="col" className="py-3 pr-4 font-semibold">
              Next charge
            </th>
            <th scope="col" className="py-3 pl-4 text-right font-semibold">
              Monthly
            </th>
            <th scope="col" className="py-3 pl-4 text-right font-semibold">
              Yearly
            </th>
            <th scope="col" className="py-3 pl-4 text-right font-semibold">
              Share
            </th>
          </tr>
        </thead>
        {sections.map((section) => {
          const monthly = section.rows.reduce((n, r) => n + r.monthly, 0);
          const yearly = section.rows.reduce((n, r) => n + r.yearly, 0);
          return (
            <tbody key={section.label}>
              <tr>
                <th
                  scope="colgroup"
                  colSpan={6}
                  className="pt-6 pb-2 text-[13px] font-semibold tracking-[0.04em] text-(--st-dim) uppercase"
                >
                  {section.label}
                </th>
              </tr>
              {section.rows.map((r) => (
                <tr key={r.item.id} className="border-t border-(--st-rule)">
                  <th scope="row" className="py-3 pr-4 font-normal">
                    <Link
                      href={`/app/items/${r.item.id}`}
                      className="st-focus font-semibold hover:underline"
                    >
                      {r.item.name}
                    </Link>
                    {r.unused && (
                      <span className="ml-2 text-[13px] text-(--st-dim)">
                        (no longer used)
                      </span>
                    )}
                  </th>
                  <td className="py-3 pr-4 whitespace-nowrap text-(--st-dim)">
                    {describeRepeat(
                      r.item.recurrence_unit,
                      r.item.recurrence_interval,
                    )}
                    {', '}
                    <span className="st-num">
                      {money(Number(r.item.amount))}
                    </span>
                  </td>
                  <td className="st-num py-3 pr-4 whitespace-nowrap text-(--st-dim)">
                    {r.next ? formatLocalDate(r.next) : '–'}
                  </td>
                  <td className={num}>{money(r.monthly)}</td>
                  <td className={num}>{money(r.yearly)}</td>
                  <td className={`${num} text-(--st-dim)`}>
                    {share(r.yearly)}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-(--st-rule) text-(--st-dim)">
                <th scope="row" colSpan={3} className="py-3 pr-4 font-semibold">
                  Subtotal
                </th>
                <td className={`${num} font-semibold`}>{money(monthly)}</td>
                <td className={`${num} font-semibold`}>{money(yearly)}</td>
                <td className={num}>{share(yearly)}</td>
              </tr>
            </tbody>
          );
        })}
        <tfoot>
          <tr className="border-t-2 border-(--st-white)">
            <th scope="row" colSpan={3} className="py-4 pr-4 font-semibold">
              Total
            </th>
            <td className={`${num} py-4 font-semibold`}>
              {money(group.monthly)}
            </td>
            <td className={`${num} py-4 font-semibold`}>
              {money(group.yearly)}
            </td>
            <td className={`${num} py-4 text-(--st-dim)`}>100%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/** The same statement as a stacked list, for phones. */
function MobileStatement({
  group,
  rows,
}: {
  group: CurrencySpend;
  rows: Row[];
}) {
  const money = (n: number) => formatAmount(n, group.currency);
  const sections = [
    {
      label: 'Subscriptions',
      rows: rows.filter((r) => r.item.kind === 'subscription'),
    },
    {
      label: 'Contracts & cover',
      rows: rows.filter((r) => r.item.kind !== 'subscription'),
    },
  ].filter((s) => s.rows.length > 0);

  return (
    <div className="mt-5 sm:hidden">
      {sections.map((section) => (
        <section key={section.label} className="mt-5 first:mt-0">
          <h3 className="pb-2 text-[13px] font-semibold tracking-[0.04em] text-(--st-dim) uppercase">
            {section.label}
          </h3>
          <ul>
            {section.rows.map((r) => (
              <li
                key={r.item.id}
                className="flex items-start justify-between gap-4 border-t border-(--st-rule) py-3"
              >
                <div className="min-w-0">
                  <Link
                    href={`/app/items/${r.item.id}`}
                    className="st-focus block truncate text-[15px] font-semibold"
                  >
                    {r.item.name}
                  </Link>
                  <p className="mt-0.5 text-[13px] text-(--st-dim)">
                    {describeRepeat(
                      r.item.recurrence_unit,
                      r.item.recurrence_interval,
                    )}
                    ,{' '}
                    <span className="st-num">
                      {money(Number(r.item.amount))}
                    </span>
                    {r.next && <> · next {formatLocalDate(r.next)}</>}
                    {r.unused && <> · no longer used</>}
                  </p>
                </div>
                <p className="st-num shrink-0 text-right text-[15px] font-semibold">
                  {money(r.yearly)}
                  <span className="block text-[12px] font-normal text-(--st-dim)">
                    / year
                  </span>
                </p>
              </li>
            ))}
          </ul>
          <p className="st-num flex justify-between border-t border-(--st-rule) py-3 text-[14px] font-semibold text-(--st-dim)">
            <span>Subtotal</span>
            <span>
              {money(section.rows.reduce((n, r) => n + r.yearly, 0))} / year
            </span>
          </p>
        </section>
      ))}
      <p className="st-num flex justify-between border-t-2 border-(--st-white) py-4 text-[15px] font-semibold">
        <span>Total</span>
        <span>{money(group.yearly)} / year</span>
      </p>
    </div>
  );
}

export default async function SpendingPage() {
  const { supabase, id } = await requireUser();
  const [{ data: items }, { data: profile }] = await Promise.all([
    supabase
      .from('items')
      .select(
        'id, name, kind, amount, currency, key_date, recurrence_unit, recurrence_interval, unused_since',
      ),
    supabase.from('profiles').select('time_zone').eq('id', id).maybeSingle(),
  ]);
  const today = todayIn(profile?.time_zone ?? 'Europe/Brussels');
  const groups = summarizeSpend(items ?? []);
  const keyDates = new Map((items ?? []).map((i) => [i.id, i.key_date]));
  const withNext = (g: CurrencySpend): Row[] =>
    g.rows.map((r) => ({ ...r, next: nextCharge(r, keyDates, today) }));

  if (groups.length === 0) {
    return (
      <div className="max-w-2xl">
        <h1 className="st-heading text-[44px] sm:text-[56px]">Spending</h1>
        <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-(--st-dim)">
          No recurring costs yet. Add a subscription or contract with its amount
          and how often it’s charged to see your totals here.
        </p>
        <Link href="/app/items/new" className="st-btn mt-8">
          Add an item
        </Link>
      </div>
    );
  }

  const [main, ...others] = groups;
  const unusedRows = main.rows.filter((r) => r.unused);

  return (
    <div>
      <h1 className="st-heading text-[44px] sm:text-[56px]">Spending</h1>
      <p className="mt-3 text-[15px] text-(--st-dim)">
        Recurring costs from your items, as of {formatLocalDate(today)}.
      </p>

      <section aria-label="Totals" className="mt-8">
        <Summary group={main} />
      </section>

      {unusedRows.length > 0 && (
        <section
          aria-labelledby="saving-heading"
          className="mt-6 flex flex-col gap-2 rounded-[3px] border border-(--st-rule) px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between"
        >
          <h2 id="saving-heading" className="text-[15px]">
            <span className="font-semibold">Potential saving: </span>
            <span className="st-num font-semibold">
              {formatAmount(main.unusedYearly, main.currency)} / year
            </span>
          </h2>
          <p className="text-[14px] text-(--st-dim)">
            {unusedRows.length === 1 ? 'From an item' : 'From items'} marked as
            no longer used:{' '}
            {unusedRows.map((r, i) => (
              <span key={r.item.id}>
                {i > 0 && ', '}
                <Link
                  href={`/app/items/${r.item.id}`}
                  className="text-(--st-white) underline-offset-4 hover:underline"
                >
                  {r.item.name}
                </Link>
              </span>
            ))}
          </p>
        </section>
      )}

      <section aria-labelledby="breakdown-heading" className="mt-12">
        <h2 id="breakdown-heading" className="st-heading text-[28px]">
          Breakdown
        </h2>
        <Statement group={main} rows={withNext(main)} />
        <MobileStatement group={main} rows={withNext(main)} />
      </section>

      {others.map((group) => (
        <section key={group.currency} className="mt-14">
          <h2 className="st-heading text-[28px]">In {group.currency}</h2>
          <p className="mt-2 text-[15px] text-(--st-dim)">
            Shown separately from {main.currency}; amounts are not converted.
          </p>
          <div className="mt-5">
            <Summary group={group} />
          </div>
          <Statement group={group} rows={withNext(group)} />
          <MobileStatement group={group} rows={withNext(group)} />
        </section>
      ))}

      <p className="mt-10 max-w-[64ch] text-[13px] leading-relaxed text-(--st-dim)">
        Monthly amounts spread yearly, quarterly and other charges evenly over
        twelve months. Items without an amount, and one-off items, are not
        included.
      </p>
    </div>
  );
}
