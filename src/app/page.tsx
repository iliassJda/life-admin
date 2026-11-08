import { site } from '@/lib/core/site';
import { DepartureBoard, MessageBoard } from './landing/departure-board';
import { Wordmark } from './wordmark';
import Link from 'next/link';

const watches = [
  {
    title: 'Subscriptions',
    arrow: 'left',
    body: 'Streaming, software, gyms, the free trial you forgot about. See what you pay each month and year, and get a nudge to cancel what you no longer use.',
  },
  {
    title: 'Documents',
    arrow: 'up',
    body: 'Passport, ID card, driving licence, residence permit. Know months ahead when something needs renewing — not at the airport.',
  },
  {
    title: 'Contracts & cover',
    arrow: 'right',
    body: 'Insurance policies, phone and energy contracts, your lease, product warranties. Decide before they quietly roll over at a higher price.',
  },
] as const;

const steps = [
  {
    title: 'Add it once',
    body: 'A name, a date, an amount if there is one. Common ones — Netflix, your passport, car insurance — are a tap away.',
  },
  {
    title: 'We keep watch',
    body: 'Every renewal, expiry and charge is tracked, recurring dates included. Leap years and the 31st of the month too.',
  },
  {
    title: 'You’re told in time',
    body: 'A calm email 30, 7 and 1 day before anything happens, with a direct link to the item so you can decide.',
  },
];

const privacy = [
  {
    title: 'Private by design',
    body: 'Files live in private storage, reachable only through short-lived links.',
  },
  {
    title: 'Only what’s needed',
    body: 'A name, a date, an amount. Uploading the document itself is always optional.',
  },
  {
    title: 'Never sold',
    body: 'No advertising, no data brokers. You are not the product.',
  },
  {
    title: 'Leave any time',
    body: 'Delete your account — and all of its data — in one step.',
  },
];

const horizon = [
  {
    stage: 'Next',
    items: [
      {
        title: 'Photograph it',
        body: 'Snap a document or receipt and have its dates and amounts read for you. You confirm before anything is saved.',
      },
      {
        title: 'What you really spend',
        body: 'Your monthly and yearly subscription total, and a gentle flag on the ones you no longer use.',
      },
      {
        title: 'How to cancel',
        body: 'Clear links and short steps for the most common subscriptions.',
      },
      {
        title: 'On your phone',
        body: 'Install it on your home screen and get reminders as notifications too.',
      },
    ],
  },
  {
    stage: 'Later',
    items: [
      {
        title: 'Forward a receipt',
        body: `Forward a confirmation email to your own ${site.name} address, and we'll add it for you, dates and all.`,
      },
      {
        title: 'Shared households',
        body: 'Invite a partner or housemate. Shared bills stay shared, private things stay private.',
      },
      {
        title: 'In your calendar',
        body: 'Renewals and expiry dates alongside everything else, in Google or Apple Calendar.',
      },
      {
        title: 'Price-rise alerts',
        body: 'Know when a subscription quietly starts charging you more.',
      },
      {
        title: 'iPhone & Android apps',
        body: 'Native apps with reminders you can rely on, wherever you are.',
      },
    ],
  },
];

function Arrow({ dir }: { dir: 'left' | 'up' | 'right' }) {
  const rotate = { left: 180, up: -90, right: 0 }[dir];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      className="size-full"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path
        d="M8 24h28M24 10l14 14-14 14"
        stroke="currentColor"
        strokeWidth="6"
        fill="none"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

function Pictogram({ kind }: { kind: 'bell' | 'info' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="size-full">
      {kind === 'bell' ? (
        <g fill="currentColor">
          <path d="M24 7c-7.2 0-12 5.4-12 12.6v8.2L8 33.5V36h32v-2.5l-4-5.7v-8.2C36 12.4 31.2 7 24 7Z" />
          <path d="M19 38.5h10a5 5 0 0 1-10 0Z" />
        </g>
      ) : (
        <g fill="currentColor">
          <circle cx="24" cy="12" r="4.5" />
          <path d="M18 20h9v16h4v5H17v-5h4V25h-3z" />
        </g>
      )}
    </svg>
  );
}

function SignUpActions() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Link href="/register" className="st-btn">
        Create an account
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4">
          <path
            d="M2 8h11M9 3.5 13.5 8 9 12.5"
            stroke="currentColor"
            strokeWidth="2.2"
            fill="none"
          />
        </svg>
      </Link>
      <p className="text-[15px] text-(--st-dim)">
        Already have one?{' '}
        <Link
          href="/login"
          className="font-semibold text-(--st-white) underline decoration-(--st-yellow) decoration-2 underline-offset-4 hover:text-(--st-yellow)"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

const heading =
  'st-cond font-bold tracking-[-0.01em] leading-[0.98] text-balance';

export default function Home() {
  return (
    <div className="relative overflow-x-clip">
      {/* Concourse header */}
      <header className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-6 px-4 py-5 sm:px-8">
        <a
          href="#"
          className="text-[30px] leading-none"
          aria-label={`${site.name} home`}
        >
          <Wordmark />
        </a>
        <div className="flex items-center gap-5">
          <Link
            href="/login"
            className="st-semi hidden text-[14px] font-semibold text-(--st-white) underline-offset-4 hover:underline sm:inline"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="st-semi rounded-[3px] border border-(--st-yellow) px-4 py-2.5 text-[14px] font-semibold text-(--st-yellow) transition-colors hover:bg-(--st-yellow) hover:text-(--st-ink)"
          >
            Create an account
          </Link>
        </div>
      </header>

      <main>
        {/* Hero: the board is the page */}
        <section className="mx-auto w-full max-w-[1320px] px-4 pt-2 pb-20 sm:px-8 lg:pb-28">
          <h1 className="sr-only">
            Never be surprised by a charge, a fine or an expired document again.
          </h1>
          <p className="sr-only">
            Sample board: Netflix renews in 3 days, car insurance in 11 days,
            Adobe Creative Cloud in 27 days and your passport expires in 41
            days. Reminders have already gone out for the first three.
          </p>
          <DepartureBoard />
          <p className="mt-3 px-1 text-[13px] text-(--st-dim)">
            Sample board. Your own items appear here once you sign up.
          </p>

          <div className="mt-8 grid gap-8 lg:mt-12 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-16">
            <p className="order-2 max-w-[46ch] text-[18px] leading-relaxed text-(--st-white) sm:text-[20px] lg:order-none">
              {site.description}
            </p>
            <div className="order-1 lg:order-none">
              <SignUpActions />
            </div>
          </div>
        </section>

        {/* Announcement: signal-yellow field */}
        <section className="st-on-yellow bg-(--st-yellow) text-(--st-ink)">
          <div className="mx-auto grid w-full max-w-[1320px] gap-8 px-4 py-20 sm:px-8 sm:py-28 md:grid-cols-[auto_1fr] md:gap-12">
            <div className="size-16 bg-(--st-ink) p-3 text-(--st-yellow) sm:size-24 sm:p-4">
              <Pictogram kind="bell" />
            </div>
            <div>
              <p
                className={`${heading} max-w-[24ch] text-[clamp(2.25rem,5.4vw,4.75rem)]`}
              >
                Most of us pay for something we forgot we signed up for — and
                find out a passport has expired{' '}
                <span className="underline decoration-[0.09em] underline-offset-[0.12em]">
                  the week of the trip
                </span>
                .
              </p>
              <p className="st-semi mt-8 text-[18px] font-semibold">
                {site.name} exists so that never happens to you.
              </p>
            </div>
          </div>
        </section>

        {/* What it watches: a hanging direction sign on enamel */}
        <section className="st-on-light bg-(--st-enamel) text-(--st-ink)">
          <div className="mx-auto w-full max-w-[1320px] px-4 py-24 sm:px-8 sm:py-32">
            <h2
              className={`${heading} max-w-[16ch] text-[clamp(2.5rem,5.6vw,5rem)]`}
            >
              Everything with a date attached to it.
            </h2>

            <ul className="mt-14 grid gap-10 md:grid-cols-3 md:gap-0">
              {watches.map((w, i) => (
                <li key={w.title} className="flex flex-col">
                  <div
                    className={`flex items-center gap-4 bg-(--st-ink) px-5 py-6 text-(--st-white) sm:px-7 sm:py-8 ${
                      i > 0 ? 'md:border-l md:border-(--st-rule)' : ''
                    } ${w.arrow === 'right' ? 'md:flex-row-reverse md:justify-start' : ''}`}
                  >
                    <span className="size-12 flex-none bg-(--st-yellow) p-2 text-(--st-ink) sm:size-14">
                      <Arrow dir={w.arrow} />
                    </span>
                    <h3 className="st-cond text-[30px] leading-none font-bold sm:text-[36px]">
                      {w.title}
                    </h3>
                  </div>
                  <p
                    className={`max-w-[38ch] pt-5 text-[16px] leading-relaxed text-(--st-ink-soft) md:px-7 md:pt-8 ${
                      i === 0
                        ? 'md:pl-0'
                        : 'md:border-l md:border-(--st-ink)/15'
                    }`}
                  >
                    {w.body}
                  </p>
                </li>
              ))}
            </ul>

            {/* How it works: a route line */}
            <div className="mt-28 grid gap-14 sm:mt-36 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
              <div>
                <h2 className={`${heading} text-[clamp(2.5rem,5.6vw,5rem)]`}>
                  Add it once.
                  <br />
                  Let it go.
                </h2>
                <p className="mt-6 max-w-[38ch] text-[17px] leading-relaxed text-(--st-ink-soft)">
                  The best life admin is the kind you don’t have to think about.
                  Add something once, and it’s taken care of from then on.
                </p>
              </div>
              <div className="lg:pt-4">
                <ol className="st-route" aria-label="Calling at">
                  {steps.map((s, i) => (
                    <li
                      key={s.title}
                      className="st-stop"
                      data-terminus={i === steps.length - 1 ? '' : undefined}
                    >
                      <span className="st-stop-dot" aria-hidden="true" />
                      <div>
                        <h3 className="st-cond text-[28px] leading-none font-bold">
                          {s.title}
                        </h3>
                        <p className="mt-3 max-w-[34ch] text-[16px] leading-relaxed text-(--st-ink-soft)">
                          {s.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy: information panel on the concourse */}
        <section className="mx-auto w-full max-w-[1320px] px-4 py-24 sm:px-8 sm:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
            <div className="flex items-start gap-5">
              <span className="size-14 flex-none bg-(--st-yellow) p-2.5 text-(--st-ink) sm:size-16">
                <Pictogram kind="info" />
              </span>
              <h2 className={`${heading} text-[clamp(2.25rem,4.6vw,4rem)]`}>
                Your documents are yours.
              </h2>
            </div>
            <ul className="grid border-t border-(--st-rule) sm:grid-cols-2">
              {privacy.map((p, i) => (
                <li
                  key={p.title}
                  className={`border-b border-(--st-rule) py-7 sm:px-7 ${
                    i % 2 === 0 ? 'sm:border-r sm:pl-0' : 'sm:pr-0'
                  }`}
                >
                  <h3 className="st-cond text-[24px] leading-none font-bold">
                    {p.title}
                  </h3>
                  <p className="mt-3 text-[16px] leading-relaxed text-(--st-dim)">
                    {p.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* On the horizon: the printed yellow timetable */}
        <section className="st-on-yellow bg-(--st-yellow) text-(--st-ink)">
          <div className="mx-auto w-full max-w-[1320px] px-4 py-24 sm:px-8 sm:py-32">
            <div className="flex flex-col justify-between gap-6 border-b-[6px] border-(--st-ink) pb-8 md:flex-row md:items-end">
              <h2 className={`${heading} text-[clamp(2.5rem,5.6vw,5rem)]`}>
                Where we’re heading.
              </h2>
              <p className="max-w-[40ch] text-[16px] leading-relaxed">
                None of this exists yet. People using {site.name} now help
                decide what comes first.
              </p>
            </div>

            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Planned features. None of them exist yet.
              </caption>
              <thead className="max-md:sr-only">
                <tr className="st-label border-b border-(--st-ink) text-(--st-ink)!">
                  <th scope="col" className="w-[7rem] py-3 font-semibold">
                    Stage
                  </th>
                  <th scope="col" className="w-[30%] py-3 font-semibold">
                    Service
                  </th>
                  <th scope="col" className="py-3 font-semibold">
                    What it does
                  </th>
                </tr>
              </thead>
              {horizon.map((group) => (
                <tbody key={group.stage}>
                  {group.items.map((item, i) => (
                    <tr
                      key={item.title}
                      className="grid grid-cols-[5rem_1fr] border-b border-(--st-ink)/25 py-5 md:table-row md:py-0"
                    >
                      <td className="st-cond row-span-2 text-[22px] font-bold md:py-5 md:align-top">
                        {i === 0 ? (
                          group.stage
                        ) : (
                          <span className="sr-only">{group.stage}</span>
                        )}
                      </td>
                      <th
                        scope="row"
                        className="st-cond text-[24px] leading-tight font-bold md:py-5 md:pr-8 md:align-top"
                      >
                        {item.title}
                      </th>
                      <td className="mt-1 text-[16px] leading-relaxed md:py-5 md:align-top">
                        {item.body}
                      </td>
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </section>

        {/* Closing: back to the board */}
        <section id="join" className="scroll-mt-4">
          <div className="mx-auto w-full max-w-[1100px] px-4 py-24 sm:px-8 sm:py-32">
            <h2 className="sr-only">Hand over the remembering.</h2>
            <MessageBoard
              wide={['HAND OVER THE REMEMBERING.']}
              narrow={['HAND OVER THE', 'REMEMBERING.']}
            />
            <div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto] md:items-start md:gap-14">
              <p className="max-w-[44ch] text-[18px] leading-relaxed">
                Add what renews or expires, choose when you want to hear about
                it, and {site.name} emails you in time.
              </p>
              <SignUpActions />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-(--st-rule)">
        <div className="mx-auto flex w-full max-w-[1320px] flex-col items-start justify-between gap-3 px-4 py-8 text-[14px] text-(--st-dim) sm:flex-row sm:items-center sm:px-8">
          <Wordmark className="text-[22px] text-(--st-white)" />
          <p>{site.tagline}</p>
          <p className="st-num">© {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
