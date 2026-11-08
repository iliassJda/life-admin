'use client';

import { Flaps, Gap } from '../../landing/flaps';

export type BoardRow = { period: string; what: string; amount: number };

const COLS = 25; // PERIOD 9 · WHAT 4 · AMOUNT 10, with a blank tile between
const NARROW_COLS = 17; // LABEL 6 · AMOUNT 10 on narrow screens

// One short label on narrow boards: MONTH / YEAR for subscriptions, ALL/MO / ALL/YR for everything.
function narrowLabel(row: BoardRow): string {
  const unit = row.period.endsWith('month') ? 'MO' : 'YR';
  return row.what === 'Subs' ? row.period.replace(/^Per /, '') : `ALL/${unit}`;
}

/** Board characters only: "€" for euros, the ISO code for anything else. */
function boardAmount(amount: number, currency: string): string {
  const figures = amount.toLocaleString('en-GB', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency === 'EUR' ? `€${figures}` : `${currency} ${figures}`;
}

/** The spending totals on split-flap tiles, like the homepage board. */
export function SpendingBoard({
  rows,
  currency,
  stamp,
}: {
  rows: BoardRow[];
  currency: string;
  stamp: string;
}) {
  return (
    <div className="st-board max-w-3xl p-2 sm:p-3">
      <div className="flex items-center justify-between gap-4 px-2 pt-1 pb-3 sm:px-3">
        <p className="st-label">
          <span className="text-(--st-white)">Spending</span>
        </p>
        <p className="st-label">{stamp}</p>
      </div>
      <div className="st-face px-3 py-4 sm:px-5 sm:py-5">
        {/* Narrow boards merge the two label columns so the tiles stay readable. */}
        {(['wide', 'narrow'] as const).map((size) => (
          <div
            key={size}
            className={`st-msg--${size} flex-col gap-[max(4px,0.8cqi)] ${
              size === 'wide' ? 'flex' : ''
            }`}
          >
            {rows.map((row, i) => {
              const d = i * 220;
              return (
                <div
                  key={`${row.period}-${row.what}`}
                  className="st-row"
                  style={
                    {
                      '--cols': size === 'wide' ? COLS : NARROW_COLS,
                    } as React.CSSProperties
                  }
                >
                  {size === 'wide' ? (
                    <>
                      <Flaps
                        text={row.period}
                        length={9}
                        tone="amber"
                        delay={d}
                      />
                      <Gap />
                      <Flaps
                        text={row.what}
                        length={4}
                        tone="dim"
                        delay={d + 60}
                      />
                    </>
                  ) : (
                    <Flaps
                      text={narrowLabel(row)}
                      length={6}
                      tone="amber"
                      delay={d}
                    />
                  )}
                  <Gap />
                  <Flaps
                    text={boardAmount(row.amount, currency)}
                    length={10}
                    align="right"
                    delay={d + 120}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
