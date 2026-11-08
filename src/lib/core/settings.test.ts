import { describe, expect, it } from 'vitest';
import {
  describeReminderDays,
  isQuarterHour,
  parseReminderDays,
  parseSettingsForm,
} from './settings';

describe('describeReminderDays', () => {
  it('reads naturally', () => {
    expect(describeReminderDays([30, 7, 1])).toBe('30, 7 and 1 days before');
    expect(describeReminderDays([7])).toBe('7 days before');
    expect(describeReminderDays([1])).toBe('1 day before');
    expect(describeReminderDays([0])).toBe('On the day');
    expect(describeReminderDays([7, 0])).toBe('7 days before, and on the day');
    expect(describeReminderDays([])).toBe('No reminders');
  });
});

describe('isQuarterHour', () => {
  it('accepts quarter hours only', () => {
    expect(isQuarterHour('09:00')).toBe(true);
    expect(isQuarterHour('23:45')).toBe(true);
    expect(isQuarterHour('09:10')).toBe(false);
    expect(isQuarterHour('24:00')).toBe(false);
  });
});

describe('parseReminderDays', () => {
  it('dedupes, sorts and rejects unknown offsets', () => {
    expect(parseReminderDays(['1', '30', '7', '7'])).toEqual([30, 7, 1]);
    expect(parseReminderDays(['5'])).toBeUndefined();
    expect(parseReminderDays(['abc'])).toBeUndefined();
  });
});

describe('parseSettingsForm', () => {
  const valid = {
    timeZone: 'Europe/Brussels',
    reminderTime: '09:00',
    emailReminders: true,
    defaultDays: ['30', '7', '1'],
  };

  it('accepts a valid form', () => {
    expect(parseSettingsForm(valid)).toEqual({
      ok: true,
      value: {
        timeZone: 'Europe/Brussels',
        reminderTime: '09:00',
        emailReminders: true,
        defaultDays: [30, 7, 1],
      },
    });
  });

  it('accepts a time with seconds from the database', () => {
    const result = parseSettingsForm({ ...valid, reminderTime: '08:30:00' });
    expect(result.ok && result.value.reminderTime).toBe('08:30');
  });

  it('rejects a made-up time zone, an odd time and no reminder days', () => {
    const result = parseSettingsForm({
      ...valid,
      timeZone: 'Mars/Olympus',
      reminderTime: '09:07',
      defaultDays: [],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(Object.keys(result.errors).sort()).toEqual([
        'defaultDays',
        'reminderTime',
        'timeZone',
      ]);
    }
  });
});
