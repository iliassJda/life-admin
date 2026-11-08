-- Local development only: runs on `supabase start` (first time) and `supabase db reset`.
-- Lets the 15-minute schedule reach the dev server on your machine.
-- The secret matches CRON_SECRET in .env.development.local.

select vault.create_secret(
  'http://host.docker.internal:3000/api/cron/reminders',
  'reminders_url'
);
select vault.create_secret('local-dev-cron-secret', 'cron_secret');
