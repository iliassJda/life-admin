import type { Metadata } from 'next';
import { requireUser } from '@/lib/server/auth';
import { DeleteAccount } from './delete-account';
import { SettingsForm } from './settings-form';

export const metadata: Metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const { supabase, id, email } = await requireUser();
  const [{ data: profile }, { data: rules }] = await Promise.all([
    supabase
      .from('profiles')
      .select('time_zone, reminder_time, email_reminders')
      .eq('id', id)
      .maybeSingle(),
    supabase.from('reminder_rules').select('days_before').is('item_id', null),
  ]);

  const timeZone = profile?.time_zone ?? 'Europe/Brussels';
  const zones = Intl.supportedValuesOf('timeZone');
  const timeZones = zones.includes(timeZone) ? zones : [timeZone, ...zones];

  return (
    <div className="max-w-xl">
      <h1 className="mb-10 font-serif text-4xl font-light">Settings</h1>

      <section aria-labelledby="reminders-heading">
        <h2 id="reminders-heading" className="mb-6 font-serif text-2xl">
          Reminders
        </h2>
        <SettingsForm
          timeZones={timeZones}
          initial={{
            timeZone,
            reminderTime: (profile?.reminder_time ?? '09:00').slice(0, 5),
            emailReminders: profile?.email_reminders ?? true,
            defaultDays: (rules ?? []).map((r) => r.days_before),
          }}
        />
      </section>

      <section
        aria-labelledby="account-heading"
        className="border-line mt-16 border-t pt-8"
      >
        <h2 id="account-heading" className="mb-2 font-serif text-2xl">
          Account
        </h2>
        <p className="text-ink-soft mb-6 text-[15px]">
          Signed in as <span className="text-ink">{email}</span>.
        </p>
        {email && <DeleteAccount email={email} />}
      </section>
    </div>
  );
}
