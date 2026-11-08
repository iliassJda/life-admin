'use client';

import { useEffect, useRef, useState } from 'react';
import { Flaps, Gap, type Tone } from './flaps';

type Kind = 'SUBSCR.' | 'DOCUMENT' | 'POLICY' | 'CONTRACT';
type Entry = {
  id: string;
  name: string;
  board: string;
  kind: Kind;
  days: number;
  amount: number | null;
};

// Sample data only. Labelled as a sample on the page.
const INITIAL: Entry[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    board: 'NETFLIX',
    kind: 'SUBSCR.',
    days: 3,
    amount: 15.99,
  },
  {
    id: 'car',
    name: 'Car insurance',
    board: 'CAR INSURANCE',
    kind: 'POLICY',
    days: 11,
    amount: 487,
  },
  {
    id: 'adobe',
    name: 'Adobe Creative Cloud',
    board: 'ADOBE CC',
    kind: 'SUBSCR.',
    days: 27,
    amount: 287.88,
  },
  {
    id: 'passport',
    name: 'Passport',
    board: 'PASSPORT',
    kind: 'DOCUMENT',
    days: 41,
    amount: null,
  },
];

const PRESETS: Entry[] = [
  {
    id: 'phone',
    name: 'Phone contract',
    board: 'PHONE CONTRACT',
    kind: 'CONTRACT',
    days: 1,
    amount: 29,
  },
  {
    id: 'gym',
    name: 'Gym membership',
    board: 'GYM MEMBERSHIP',
    kind: 'SUBSCR.',
    days: 9,
    amount: 39.9,
  },
  {
    id: 'spotify',
    name: 'Spotify',
    board: 'SPOTIFY',
    kind: 'SUBSCR.',
    days: 19,
    amount: 11.99,
  },
  {
    id: 'licence',
    name: 'Driving licence',
    board: 'DRIVING LICENCE',
    kind: 'DOCUMENT',
    days: 52,
    amount: null,
  },
];

const SLOTS = INITIAL.length + PRESETS.length;

// Reminders go out 30, 7 and 1 day before, so the remark follows the real rules.
function remark(days: number): { text: string; tone: Tone; spoken: string } {
  if (days <= 0) return { text: 'DUE TODAY', tone: 'red', spoken: 'due today' };
  if (days === 1)
    return { text: 'DUE TOMORROW', tone: 'red', spoken: '1-day reminder sent' };
  if (days <= 7)
    return { text: '7-DAY SENT', tone: 'amber', spoken: '7-day reminder sent' };
  if (days <= 30)
    return {
      text: '30-DAY SENT',
      tone: 'amber',
      spoken: '30-day reminder sent',
    };
  return {
    text: 'ON WATCH',
    tone: 'dim',
    spoken: `first reminder in ${days - 30} days`,
  };
}

const when = (days: number) => (days === 1 ? '1 DAY' : `${days} DAYS`);
const euro = (n: number) => `€${n.toFixed(2)}`;

function Clock() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setTime(
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
      );
    };
    const first = setTimeout(update, 0);
    const id = setInterval(update, 10_000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);
  return (
    <span className="[container-type:inline-size] block w-[5.5rem] sm:w-[7rem]">
      <span className="st-row" style={{ '--cols': 5 } as React.CSSProperties}>
        <Flaps text={time} length={5} tone="amber" />
      </span>
    </span>
  );
}

type Seg = { text: string; tone?: Tone };

function MessageLine({
  segs,
  cols,
  delay,
  blank = false,
}: {
  segs: Seg[];
  cols: number;
  delay: number;
  blank?: boolean;
}) {
  const starts = segs.map((_, i) =>
    segs.slice(0, i).reduce((n, s) => n + s.text.length, 0),
  );
  const used = segs.reduce((n, s) => n + s.text.length, 0);
  const parts = segs.map((s, i) => (
    <Flaps
      key={i}
      text={blank ? '' : s.text}
      length={s.text.length}
      tone={s.tone}
      delay={delay + starts[i] * 22}
    />
  ));
  const rest = cols - used;
  return (
    <div className="st-row" style={{ '--cols': cols } as React.CSSProperties}>
      {parts}
      {rest > 0 && <Flaps text="" length={rest} />}
    </div>
  );
}

const WIDE: Seg[][] = [
  [{ text: 'NEVER BE SURPRISED BY A CHARGE, A FINE' }],
  [
    { text: 'OR AN ' },
    { text: 'EXPIRED', tone: 'red' },
    { text: ' DOCUMENT AGAIN.' },
  ],
];
const NARROW: Seg[][] = [
  [{ text: 'NEVER BE SURPRISED' }],
  [{ text: 'BY A CHARGE, A FINE' }],
  [{ text: 'OR AN ' }, { text: 'EXPIRED', tone: 'red' }],
  [{ text: 'DOCUMENT AGAIN.' }],
];

/** A small board showing one message, for the closing call to action. */
export function MessageBoard({
  wide,
  narrow,
}: {
  wide: string[];
  narrow: string[];
}) {
  // Flips in when it scrolls into view, so the visitor actually sees it turn.
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="st-board p-2 sm:p-3">
      <div className="st-face px-3 py-4 sm:px-5 sm:py-5">
        <div className="st-msg--wide flex flex-col gap-[max(3px,0.6cqi)]">
          {wide.map((t, i) => (
            <MessageLine
              key={i}
              segs={[{ text: t }]}
              cols={26}
              delay={i * 260}
              blank={!seen}
            />
          ))}
        </div>
        <div className="st-msg--narrow flex-col gap-[max(3px,0.6cqi)]">
          {narrow.map((t, i) => (
            <MessageLine
              key={i}
              segs={[{ text: t }]}
              cols={14}
              delay={i * 200}
              blank={!seen}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DepartureBoard() {
  const [entries, setEntries] = useState<Entry[]>(INITIAL);
  const [announce, setAnnounce] = useState('');

  const sorted = [...entries].sort((a, b) => a.days - b.days);
  const slots = Array.from({ length: SLOTS }, (_, i) => sorted[i] ?? null);
  const total = sorted.reduce((sum, e) => sum + (e.amount ?? 0), 0);
  const onBoard = new Set(entries.map((e) => e.id));
  const left = PRESETS.filter((p) => !onBoard.has(p.id));

  function add(p: Entry) {
    setEntries((prev) =>
      prev.some((e) => e.id === p.id) ? prev : [...prev, p],
    );
    setAnnounce(
      `${p.name} added to the sample board: due in ${p.days === 1 ? '1 day' : `${p.days} days`}, ${remark(p.days).spoken}.`,
    );
  }

  return (
    <div className="st-board p-2 sm:p-3">
      {/* Header strip, painted on the housing */}
      <div className="flex items-center justify-between gap-4 px-2 pt-1 pb-3 sm:px-3">
        <p className="st-label">
          <span className="text-(--st-white)">Upcoming</span>
          <span className="mx-2 text-(--st-rule)">/</span>
          next 60 days
        </p>
        <Clock />
      </div>

      <div className="st-face px-3 py-4 sm:px-5 sm:py-6">
        {/* Message rows: the headline */}
        <div className="st-msg--wide flex flex-col gap-[max(3px,0.5cqi)]">
          {WIDE.map((segs, i) => (
            <MessageLine key={i} segs={segs} cols={38} delay={i * 260} />
          ))}
        </div>
        <div className="st-msg--narrow flex-col gap-[max(3px,0.6cqi)]">
          {NARROW.map((segs, i) => (
            <MessageLine key={i} segs={segs} cols={19} delay={i * 200} />
          ))}
        </div>

        {/* Column heads */}
        <div
          className="st-row st-colheads--wide mt-[3.2cqi] mb-[1cqi] border-t border-(--st-rule) pt-[1.6cqi]"
          style={{ '--cols': 56 } as React.CSSProperties}
        >
          {(
            [
              ['When', 7],
              ['Item', 16],
              ['Type', 8],
              ['Amount', 8],
              ['Reminders', 13],
            ] as const
          ).flatMap(([label, n], i) => [
            i > 0 ? <Gap key={`g${label}`} /> : null,
            <span
              key={label}
              className="st-label flex-none"
              style={{
                width: `calc(var(--tw) * ${n} + var(--gap) * ${n - 1})`,
                textAlign: label === 'Amount' ? 'right' : 'left',
              }}
            >
              {label}
            </span>,
          ])}
        </div>
        <div
          className="st-row st-colheads--narrow mt-6 mb-2 justify-between border-t border-(--st-rule) pt-4"
          style={{ '--cols': 24 } as React.CSSProperties}
        >
          <span className="st-label">When · Item</span>
          <span className="st-label">Reminders · Amount</span>
        </div>

        {/* Item rows */}
        <div className="flex flex-col gap-[max(5px,0.7cqi)]">
          {slots.map((e, i) => {
            const r = e ? remark(e.days) : null;
            const d = 700 + i * 120;
            return (
              <div
                key={i}
                className="st-row st-item-row"
                data-empty={e ? undefined : ''}
                style={{ '--cols': 56 } as React.CSSProperties}
              >
                <Flaps
                  text={e ? when(e.days) : ''}
                  length={7}
                  tone="amber"
                  delay={d}
                />
                <Gap />
                <Flaps text={e?.board ?? ''} length={16} delay={d + 60} />
                <Gap className="st-gap--type" />
                <Flaps
                  text={e?.kind ?? ''}
                  length={8}
                  tone="dim"
                  delay={d + 120}
                  className="st-field--type"
                />
                <Gap className="st-gap--amount" />
                <Flaps
                  text={e?.amount != null ? euro(e.amount) : e ? '-' : ''}
                  length={8}
                  align="right"
                  delay={d + 160}
                  className="st-field--amount"
                />
                <Gap className="st-gap--remarks" />
                <Flaps
                  text={r?.text ?? ''}
                  length={13}
                  tone={r?.tone ?? 'white'}
                  delay={d + 200}
                  className="st-field--remarks"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer strip: try it + total */}
      <div className="flex flex-col gap-4 px-2 pt-4 pb-2 sm:px-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="-mx-2 flex [scrollbar-width:none] items-center gap-2 overflow-x-auto px-2 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          <span className="st-label mr-1 flex-none">Try it, add one:</span>
          {left.length > 0 ? (
            left.map((p) => (
              <button
                key={p.id}
                type="button"
                className="st-chip flex-none"
                onClick={() => add(p)}
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
              </button>
            ))
          ) : (
            <span className="text-[13px] text-(--st-white)">
              Full board. Every one of these would reach your inbox in time.
            </span>
          )}
        </div>
        <p className="st-label flex items-baseline gap-3 whitespace-nowrap">
          Due on this board
          <span className="st-num st-cond text-[20px] font-bold tracking-normal text-(--st-amber) normal-case">
            {euro(total)}
          </span>
        </p>
      </div>
      <p role="status" aria-live="polite" className="sr-only">
        {announce}
      </p>
    </div>
  );
}
