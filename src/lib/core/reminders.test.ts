import { describe, expect, it } from 'vitest';
import { buildReminderEmail } from './reminder-email';
import {
  CATCH_UP_MS,
  dueReminders,
  effectiveDaysBefore,
  type ReminderItem,
  type ReminderProfile,
  type ReminderRule,
} from './reminders';

const brussels: ReminderProfile = {
  timeZone: 'Europe/Brussels',
  reminderTime: '09:00:00',
  emailReminders: true,
};
const defaults: ReminderRule[] = [30, 7, 1].map((d) => ({
  item_id: null,
  days_before: d,
}));

const once = (id: string, key_date: string): ReminderItem => ({
  id,
  key_date,
  recurrence_unit: null,
  recurrence_interval: null,
});

const at = (iso: string) => new Date(iso);

describe('effectiveDaysBefore', () => {
  it('uses the defaults when an item has no rules of its own', () => {
    expect(effectiveDaysBefore('a', defaults)).toEqual([30, 7, 1]);
  });

  it('lets an item’s own rules replace the defaults', () => {
    const rules = [...defaults, { item_id: 'a', days_before: 14 }];
    expect(effectiveDaysBefore('a', rules)).toEqual([14]);
    expect(effectiveDaysBefore('b', rules)).toEqual([30, 7, 1]);
  });
});

describe('dueReminders', () => {
  const passport = once('passport', '2026-12-15');

  it('is due at the reminder time in the user’s time zone, not before', () => {
    // 7 days before 15 Dec is 8 Dec; 09:00 in Brussels (CET) is 08:00 UTC.
    expect(
      dueReminders([passport], defaults, brussels, at('2026-12-08T07:59:00Z')),
    ).toEqual([]);
    const due = dueReminders(
      [passport],
      defaults,
      brussels,
      at('2026-12-08T08:00:00Z'),
    );
    expect(due).toHaveLength(1);
    expect(due[0]).toMatchObject({
      itemId: 'passport',
      occurrenceDate: '2026-12-15',
      daysBefore: 7,
    });
    expect(due[0].dueAt.toISOString()).toBe('2026-12-08T08:00:00.000Z');
  });

  it('follows summer time', () => {
    // 1 day before 15 Jul is 14 Jul; 09:00 in Brussels (CEST) is 07:00 UTC.
    const due = dueReminders(
      [once('x', '2027-07-15')],
      defaults,
      brussels,
      at('2027-07-14T07:05:00Z'),
    );
    expect(due.map((d) => d.daysBefore)).toEqual([1]);
    expect(due[0].dueAt.toISOString()).toBe('2027-07-14T07:00:00.000Z');
  });

  it('uses the user’s calendar day, not UTC’s', () => {
    const tokyo = { ...brussels, timeZone: 'Asia/Tokyo' };
    // 09:00 on 8 Dec in Tokyo is 00:00 UTC on 8 Dec.
    const due = dueReminders(
      [passport],
      defaults,
      tokyo,
      at('2026-12-08T00:00:00Z'),
    );
    expect(due.map((d) => d.daysBefore)).toEqual([7]);
  });

  it('catches up within the window and skips what is older', () => {
    const justInside = new Date(
      Date.parse('2026-12-08T08:00:00Z') + CATCH_UP_MS,
    );
    expect(
      dueReminders([passport], defaults, brussels, justInside).map(
        (d) => d.daysBefore,
      ),
    ).toEqual([7]);
    const tooLate = new Date(justInside.getTime() + 60_000);
    expect(dueReminders([passport], defaults, brussels, tooLate)).toEqual([]);
  });

  it('sends nothing when email reminders are off', () => {
    expect(
      dueReminders(
        [passport],
        defaults,
        { ...brussels, emailReminders: false },
        at('2026-12-08T08:00:00Z'),
      ),
    ).toEqual([]);
  });

  it('gives no reminders for an occurrence that has passed', () => {
    expect(
      dueReminders(
        [once('old', '2026-12-01')],
        [{ item_id: null, days_before: 0 }],
        brussels,
        at('2026-12-02T08:00:00Z'),
      ),
    ).toEqual([]);
  });

  it('supports a reminder on the day itself', () => {
    const due = dueReminders(
      [once('x', '2026-12-08')],
      [{ item_id: null, days_before: 0 }],
      brussels,
      at('2026-12-08T09:30:00Z'),
    );
    expect(due.map((d) => d.daysBefore)).toEqual([0]);
  });

  it('finds the right occurrence of a monthly item on the 31st', () => {
    const rent: ReminderItem = {
      id: 'rent',
      key_date: '2027-01-31',
      recurrence_unit: 'month',
      recurrence_interval: 1,
    };
    // Next occurrence after 31 Jan is 28 Feb; 1 day before is 27 Feb.
    const due = dueReminders(
      [rent],
      defaults,
      brussels,
      at('2027-02-27T08:30:00Z'),
    );
    expect(due).toHaveLength(1);
    expect(due[0]).toMatchObject({
      occurrenceDate: '2027-02-28',
      daysBefore: 1,
    });
  });

  it('covers later occurrences of an item that repeats often', () => {
    const weekly: ReminderItem = {
      id: 'w',
      key_date: '2026-12-01',
      recurrence_unit: 'week',
      recurrence_interval: 1,
    };
    // On 8 Dec: the 7-day reminder for 15 Dec is due.
    const due = dueReminders(
      [weekly],
      [{ item_id: null, days_before: 7 }],
      brussels,
      at('2026-12-08T08:30:00Z'),
    );
    expect(due.map((d) => d.occurrenceDate)).toEqual(['2026-12-15']);
  });

  it('returns nothing for an item without any rules', () => {
    expect(
      dueReminders([passport], [], brussels, at('2026-12-08T08:00:00Z')),
    ).toEqual([]);
  });
});

describe('buildReminderEmail', () => {
  const base = {
    today: '2026-12-08',
    appUrl: 'https://kalends.app/',
  };

  it('words a subscription with its amount and links to the item', () => {
    const email = buildReminderEmail({
      ...base,
      occurrenceDate: '2026-12-15',
      item: {
        id: 'abc',
        kind: 'subscription',
        name: 'Netflix',
        amount: 15.99,
        currency: 'EUR',
      },
    });
    expect(email.subject).toBe('Netflix renews in 7 days');
    expect(email.text).toContain('Netflix renews on 15 Dec 2026, for €15.99.');
    expect(email.text).toContain('https://kalends.app/app/items/abc');
    expect(email.html).toContain('href="https://kalends.app/app/items/abc"');
  });

  it('says tomorrow and today', () => {
    const item = {
      id: 'p',
      kind: 'document' as const,
      name: 'Passport',
      amount: null,
      currency: 'EUR',
    };
    expect(
      buildReminderEmail({ ...base, item, occurrenceDate: '2026-12-09' })
        .subject,
    ).toBe('Passport expires tomorrow');
    expect(
      buildReminderEmail({ ...base, item, occurrenceDate: '2026-12-08' })
        .subject,
    ).toBe('Passport expires today');
  });

  it('nudges to cancel when the item is marked unused', () => {
    const email = buildReminderEmail({
      ...base,
      occurrenceDate: '2026-12-15',
      item: {
        id: 'g',
        kind: 'subscription',
        name: 'Gym',
        amount: 39.9,
        currency: 'EUR',
        unused: true,
      },
    });
    expect(email.subject).toBe('Cancel Gym? It renews in 7 days');
    expect(email.text).toContain(
      'You marked this as no longer used. Cancel before 15 Dec 2026 to avoid paying again.',
    );
  });

  it('adds the cancellation help link only for unused items', () => {
    const item = {
      id: 'n',
      kind: 'subscription' as const,
      name: 'Netflix',
      amount: 15.99,
      currency: 'EUR',
    };
    const cancelUrl = 'https://help.netflix.com/en/node/407';
    const unused = buildReminderEmail({
      ...base,
      occurrenceDate: '2026-12-15',
      cancelUrl,
      item: { ...item, unused: true },
    });
    expect(unused.text).toContain(`How to cancel: ${cancelUrl}`);
    expect(unused.html).toContain(`href="${cancelUrl}"`);
    const inUse = buildReminderEmail({
      ...base,
      occurrenceDate: '2026-12-15',
      cancelUrl,
      item,
    });
    expect(inUse.text).not.toContain('How to cancel');
  });

  it('escapes names in the HTML', () => {
    const email = buildReminderEmail({
      ...base,
      occurrenceDate: '2026-12-15',
      item: {
        id: 'x',
        kind: 'contract',
        name: '<b>Tom & Jerry</b>',
        amount: null,
        currency: 'EUR',
      },
    });
    expect(email.html).not.toContain('<b>Tom');
    expect(email.html).toContain('&lt;b&gt;Tom &amp; Jerry&lt;/b&gt;');
  });
});
