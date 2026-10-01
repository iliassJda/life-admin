import { site } from '@/lib/core/site';
import { WaitlistForm } from './waitlist-form';

const upcoming = [
  {
    name: 'Netflix',
    kind: 'Subscription',
    when: 'Renews in 3 days',
    amount: '€15.99',
    urgent: true,
  },
  {
    name: 'Car insurance',
    kind: 'Policy',
    when: 'Renews 12 Nov',
    amount: '€486.00',
  },
  {
    name: 'Passport',
    kind: 'Document',
    when: 'Expires in 41 days',
    amount: null,
  },
  {
    name: 'Adobe Creative Cloud',
    kind: 'Subscription',
    when: 'Annual · 28 Nov',
    amount: '€287.88',
  },
];

const watches = [
  {
    numeral: 'I',
    title: 'Subscriptions',
    body: 'Streaming, software, gyms, the free trial you forgot about. See what you pay each month and year, and get a nudge to cancel what you no longer use.',
  },
  {
    numeral: 'II',
    title: 'Documents',
    body: 'Passport, ID card, driving licence, residence permit. Know months ahead when something needs renewing — not at the airport.',
  },
  {
    numeral: 'III',
    title: 'Contracts & cover',
    body: 'Insurance policies, phone and energy contracts, your lease, product warranties. Decide before they quietly roll over at a higher price.',
  },
];

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

export default function Home() {
  return (
    <div className="relative overflow-x-clip">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 sm:px-10">
        <a href="#" className="font-serif text-2xl tracking-tight">
          {site.name}
          <span className="text-gold">.</span>
        </a>
        <a
          href="#join"
          className="border-line text-ink-soft hover:border-ink-faint hover:text-ink rounded-full border px-4 py-2 text-[13px] font-medium tracking-wide transition-colors"
        >
          Join the waitlist
        </a>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-16 px-6 pt-12 pb-24 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20 lg:pb-32">
          <div className="rise">
            <p className="text-ink-faint mb-6 flex items-center gap-3 text-[12px] font-medium tracking-[0.2em] uppercase">
              <span className="bg-gold h-px w-8" />
              Early access · Opening soon
            </p>
            <h1 className="font-serif text-[clamp(2.75rem,6.5vw,5.25rem)] leading-[1.02] font-light tracking-[-0.02em]">
              Never be surprised by a charge, a fine or an{' '}
              <em className="text-accent font-normal italic">expired</em>{' '}
              document again.
            </h1>
            <p className="text-ink-soft mt-8 max-w-xl text-[17px] leading-relaxed">
              {site.description}
            </p>
            <div className="mt-10">
              <WaitlistForm />
            </div>
          </div>

          <div className="rise [animation-delay:150ms]" aria-hidden="true">
            <div className="relative mx-auto max-w-md">
              <div className="from-gold/15 to-accent/10 absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br via-transparent blur-2xl" />
              <div className="border-line bg-paper-raised rounded-[1.75rem] border p-7 shadow-[0_30px_60px_-30px_rgba(40,30,10,0.25)]">
                <div className="border-line flex items-baseline justify-between border-b pb-5">
                  <div>
                    <p className="text-ink-faint text-[11px] font-medium tracking-[0.18em] uppercase">
                      Upcoming
                    </p>
                    <p className="mt-1 font-serif text-2xl">The next 60 days</p>
                  </div>
                  <p className="text-right">
                    <span className="block font-serif text-2xl">€789.87</span>
                    <span className="text-ink-faint text-[11px]">due</span>
                  </p>
                </div>
                <ul className="divide-line divide-y">
                  {upcoming.map((item) => (
                    <li
                      key={item.name}
                      className="flex items-center gap-4 py-4"
                    >
                      <span
                        className={`size-2 shrink-0 rounded-full ${item.urgent ? 'bg-alert' : 'bg-line'}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-medium">
                          {item.name}
                        </p>
                        <p className="text-ink-faint text-[12px]">
                          {item.kind} ·{' '}
                          <span className={item.urgent ? 'text-alert' : ''}>
                            {item.when}
                          </span>
                        </p>
                      </div>
                      <span className="text-ink-soft font-serif text-[15px] tabular-nums">
                        {item.amount ?? '—'}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="bg-paper text-ink-soft mt-2 rounded-xl px-4 py-3 text-[12.5px] leading-snug">
                  <span className="text-ink font-medium">Reminder sent.</span>{' '}
                  Netflix renews in 3 days. Still watching? Now’s the time to
                  decide.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quote band */}
        <section className="border-line bg-paper-raised border-y">
          <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:px-10 sm:py-24">
            <p className="font-serif text-[clamp(1.6rem,3.4vw,2.5rem)] leading-snug font-light">
              Most of us pay for something we forgot we signed up for — and find
              out a passport has expired{' '}
              <em className="text-accent">the week of the trip</em>.
            </p>
            <p className="text-ink-faint mt-6 text-[13px] tracking-[0.18em] uppercase">
              {site.name} exists so that never happens to you
            </p>
          </div>
        </section>

        {/* What it watches */}
        <section className="mx-auto w-full max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
          <div className="max-w-2xl">
            <p className="text-gold text-[12px] font-medium tracking-[0.2em] uppercase">
              What it watches
            </p>
            <h2 className="mt-4 font-serif text-[clamp(2rem,4vw,3.25rem)] leading-tight font-light tracking-[-0.01em]">
              Everything with a date attached to it.
            </h2>
          </div>
          <div className="border-line bg-line mt-16 grid gap-px overflow-hidden rounded-3xl border md:grid-cols-3">
            {watches.map((w) => (
              <article key={w.title} className="bg-paper p-8 sm:p-10">
                <p className="text-gold font-serif text-sm italic">
                  {w.numeral}
                </p>
                <h3 className="mt-6 font-serif text-2xl">{w.title}</h3>
                <p className="text-ink-soft mt-4 text-[15px] leading-relaxed">
                  {w.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-24 sm:px-10 sm:pb-32">
          <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-gold text-[12px] font-medium tracking-[0.2em] uppercase">
                How it works
              </p>
              <h2 className="mt-4 font-serif text-[clamp(2rem,4vw,3.25rem)] leading-tight font-light tracking-[-0.01em]">
                Add it once. <br />
                <em className="text-accent">Let it go.</em>
              </h2>
              <p className="text-ink-soft mt-6 max-w-sm text-[15px] leading-relaxed">
                The best life admin is the kind you don’t have to think about.
                Add something once, and it’s taken care of from then on.
              </p>
            </div>
            <ol className="space-y-0">
              {steps.map((s, i) => (
                <li
                  key={s.title}
                  className="border-line grid grid-cols-[3.5rem_1fr] gap-4 border-t py-8 last:border-b"
                >
                  <span className="text-ink-faint font-serif text-3xl font-light tabular-nums">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl">{s.title}</h3>
                    <p className="text-ink-soft mt-2 text-[15px] leading-relaxed">
                      {s.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Privacy */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-24 sm:px-10 sm:pb-32">
          <div className="border-line bg-paper-raised grid gap-10 rounded-3xl border p-8 sm:p-12 md:grid-cols-3">
            <div className="md:col-span-1">
              <p className="text-gold text-[12px] font-medium tracking-[0.2em] uppercase">
                Discretion
              </p>
              <h2 className="mt-4 font-serif text-3xl leading-tight font-light">
                Your documents are yours.
              </h2>
            </div>
            <ul className="text-ink-soft grid gap-8 text-[15px] leading-relaxed sm:grid-cols-2 md:col-span-2">
              <li>
                <p className="text-ink font-medium">Private by design</p>
                Files live in private storage, reachable only through
                short-lived links.
              </li>
              <li>
                <p className="text-ink font-medium">Only what’s needed</p>A
                name, a date, an amount. Uploading the document itself is always
                optional.
              </li>
              <li>
                <p className="text-ink font-medium">Never sold</p>
                No advertising, no data brokers. You pay for the product; you
                are not the product.
              </li>
              <li>
                <p className="text-ink font-medium">Leave any time</p>
                Delete your account — and all of its data — in one step.
              </li>
            </ul>
          </div>
        </section>

        {/* On the horizon */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-24 sm:px-10 sm:pb-32">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-gold text-[12px] font-medium tracking-[0.2em] uppercase">
                On the horizon
              </p>
              <h2 className="mt-4 font-serif text-[clamp(2rem,4vw,3.25rem)] leading-tight font-light tracking-[-0.01em]">
                Where we’re heading.
              </h2>
            </div>
            <p className="text-ink-soft max-w-sm text-[15px] leading-relaxed">
              None of this exists yet — and early members help decide what comes
              first.{' '}
              <a
                href="#join"
                className="text-accent decoration-accent/40 hover:decoration-accent underline underline-offset-4"
              >
                Tell us what matters to you
              </a>
              .
            </p>
          </div>
          <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-16">
            {horizon.map((group) => (
              <div key={group.stage}>
                <p className="border-line flex items-baseline gap-3 border-b pb-4">
                  <span className="font-serif text-2xl italic">
                    {group.stage}
                  </span>
                </p>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.title} className="border-line border-b py-5">
                      <p className="text-[15px] font-medium">{item.title}</p>
                      <p className="text-ink-soft mt-1 text-[14px] leading-relaxed">
                        {item.body}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section id="join" className="bg-accent text-accent-ink scroll-mt-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center sm:px-10 sm:py-32">
            <p className="text-[12px] font-medium tracking-[0.2em] uppercase opacity-70">
              Early access
            </p>
            <h2 className="mt-5 font-serif text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.05] font-light tracking-[-0.01em]">
              Hand over the remembering.
            </h2>
            <p className="mt-6 max-w-lg text-[16px] leading-relaxed opacity-75">
              We’re inviting a small first group to shape {site.name}. Leave
              your email and you’ll be among the first in.
            </p>
            <div className="mt-10 flex w-full justify-center">
              <WaitlistForm tone="inverse" />
            </div>
          </div>
        </section>
      </main>

      <footer className="text-ink-faint mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-[13px] sm:flex-row sm:px-10">
        <p className="text-ink font-serif text-lg">
          {site.name}
          <span className="text-gold">.</span>
        </p>
        <p>{site.tagline}</p>
        <p>© {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
