-- Reminder engine: retry bookkeeping and the 15-minute schedule.

-- When a send was last tried, so failed sends are retried with a pause between.
alter table public.notifications_sent
  add column last_attempt_at timestamptz;

create index notifications_retry_idx on public.notifications_sent (status)
  where status = 'failed';

-- Schedule ---------------------------------------------------------------------
-- Every 15 minutes the database calls the app's reminder endpoint. The URL and
-- the shared secret live in Vault, set once per environment (never in a
-- migration):
--   select vault.create_secret('https://<your-app>/api/cron/reminders', 'reminders_url');
--   select vault.create_secret('<same value as CRON_SECRET>', 'cron_secret');
-- Until both exist, the job runs and does nothing.

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

create function private.trigger_reminder_run()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_url text;
  secret text;
begin
  select decrypted_secret into target_url
    from vault.decrypted_secrets where name = 'reminders_url';
  select decrypted_secret into secret
    from vault.decrypted_secrets where name = 'cron_secret';
  if target_url is null or secret is null then
    return;
  end if;

  perform net.http_post(
    url := target_url,
    body := '{}'::jsonb,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || secret
    ),
    timeout_milliseconds := 60000
  );
end;
$$;

revoke execute on function private.trigger_reminder_run() from public, anon, authenticated;

select cron.schedule(
  'send-reminders',
  '*/15 * * * *',
  $$select private.trigger_reminder_run()$$
);
