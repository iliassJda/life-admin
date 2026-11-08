# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Busy adults living in Europe who manage their own life admin: personal subscriptions, identity documents, insurance and household contracts. They aren't disorganised. They just lose track of dates that come round once a month or once a decade, and find out only when a charge lands, a contract renews at a higher price or a passport turns out to have expired.

Their job: hand over the remembering, and be told early enough to decide what to do (cancel, renew, switch).

## Product Purpose

Kalends keeps track of everything in a person's life that has a date attached to it, and warns them before anything charges them, expires or rolls over. Success means the user is never caught out by a forgotten charge, an expired document or an automatic renewal, and spends almost no time keeping Kalends up to date.

Tagline: "Life admin, quietly handled."

## Positioning

One calm place for three things people usually track separately or not at all: subscriptions, documents and contracts. You add an item once, and Kalends handles recurrence properly (including month-end and leap-year dates) and sends reminders at the right time. It is a watch-and-warn service, not a budgeting app or a document vault. The documents themselves are optional; a name, a date and an amount are enough.

## Operating Context

- Users add items by hand: a name, a key date, an optional recurrence (every N days, weeks, months or years), an optional amount and currency, notes, and an optional file.
- Reminders go out by email, by default 30, 7 and 1 day before each occurrence, at the user's chosen time in their own time zone. Default rules can be overridden per item.
- Sign-in uses an email magic link or Google.
- The main app screen is a list of upcoming items, and each item can be added, edited and deleted.

## Capabilities and Constraints

- Stack: Next.js 16 (App Router), React 19, Tailwind CSS 4, Supabase (Postgres with row-level security, auth, private storage), deployed on Vercel.
- Item kinds: `subscription`, `document`, `contract`.
- Notification channel today: email only.
- Defaults: EUR, Europe/Brussels, reminders at 09:00.
- Launch market: the EU, English UI only. Amounts are in euros by default, but any ISO currency code is stored.
- Business model: freemium (a free tier with limits plus a paid tier). Price, tier limits and which features are paid are **undecided**.
- Status: pre-launch, collecting sign-ups through a waitlist.
- The roadmap shown publicly is not built yet. "Next": read dates from a photo, spending totals, how-to-cancel guides, an installable PWA with notifications. "Later": receipt forwarding by email, shared households, calendar sync, price-rise alerts, native apps.

## Brand Commitments

- Name: **Kalends**, written with a trailing coloured full stop in the wordmark ("Kalends."). It is gold in the app's old look and signal yellow on the redesigned landing page.
- Voice: calm, plain, reassuring and lightly literary ("Hand over the remembering", "Add it once. Let it go."). Reminders are described as "calm", never alarming. The copy says what something does in plain words and avoids hype.
- Privacy promises made publicly, which future work must keep true: files live in private storage behind short-lived links; uploading documents is optional; no advertising and no data brokers ("you are not the product"); users can delete their account and all its data in one step.

## Evidence on Hand

- Landing-page copy and a sample "upcoming" card in `src/app/page.tsx`. The items and amounts on the card are illustrative, not real user data.
- There are no customers, testimonials, usage numbers, press or pricing yet. Do not invent any of them.

## Product Principles

1. **Add once, then forget.** Every flow should keep the user's effort to the minimum needed to record a date. Ask for anything beyond that only when it is optional.
2. **Warn in time, calmly.** Reminders should come early enough to act on and be worded to inform the user, not to alarm them.
3. **Collect only what's needed.** A name, a date and an amount come first. Documents and extra details stay optional, and privacy promises are treated as product requirements.
4. **Be right about dates.** Recurrence, time zones and edge-case calendar dates must be correct, because a wrong reminder breaks the user's trust.
5. **Be honest about what exists.** The roadmap is presented as the roadmap; features that aren't built are never implied to be live.
