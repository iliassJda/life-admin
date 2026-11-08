/** Reminder offsets people can pick, in days before the date. */
export const REMINDER_DAY_OPTIONS = [60, 30, 14, 7, 3, 1, 0] as const;

export function reminderDayLabel(days: number): string {
  if (days === 0) return 'On the day';
  if (days === 1) return '1 day before';
  return `${days} days before`;
}

export function describeReminderDays(days: number[]): string {
  if (days.length === 0) return 'No reminders';
  const numbers = [...days].filter((d) => d > 0).sort((a, b) => b - a);
  const onDay = days.includes(0);
  if (numbers.length === 0) return 'On the day';
  const list =
    numbers.length === 1
      ? reminderDayLabel(numbers[0])
      : `${numbers.slice(0, -1).join(', ')} and ${numbers.at(-1)} days before`;
  return onDay ? `${list}, and on the day` : list;
}

export function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

/** The reminder job runs every 15 minutes, so times sit on the quarter hour. */
export function isQuarterHour(value: string): boolean {
  const match = /^([01]\d|2[0-3]):(00|15|30|45)$/.exec(value);
  return match !== null;
}

export function parseReminderDays(values: string[]): number[] | undefined {
  const allowed = new Set<number>(REMINDER_DAY_OPTIONS);
  const days = [...new Set(values.map(Number))];
  if (days.some((d) => !allowed.has(d))) return undefined;
  return days.sort((a, b) => b - a);
}

export type SettingsInput = {
  timeZone: string;
  reminderTime: string;
  emailReminders: boolean;
  defaultDays: number[];
};

export type SettingsField = 'timeZone' | 'reminderTime' | 'defaultDays';
export type SettingsErrors = Partial<Record<SettingsField, string>>;

export function parseSettingsForm(input: {
  timeZone: string;
  reminderTime: string;
  emailReminders: boolean;
  defaultDays: string[];
}): { ok: true; value: SettingsInput } | { ok: false; errors: SettingsErrors } {
  const errors: SettingsErrors = {};
  const timeZone = input.timeZone.trim();
  const reminderTime = input.reminderTime.trim().slice(0, 5);
  const defaultDays = parseReminderDays(input.defaultDays);

  if (!isValidTimeZone(timeZone)) errors.timeZone = 'Choose a time zone.';
  if (!isQuarterHour(reminderTime)) {
    errors.reminderTime = 'Choose a time on the hour or quarter hour.';
  }
  if (!defaultDays) {
    errors.defaultDays = 'Choose from the listed reminder days.';
  } else if (defaultDays.length === 0) {
    errors.defaultDays = 'Pick at least one, or turn email reminders off.';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      timeZone,
      reminderTime,
      emailReminders: input.emailReminders,
      defaultDays: defaultDays!,
    },
  };
}
