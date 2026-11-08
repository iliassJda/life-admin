-- Phone and browser notifications as a second reminder channel.

alter type public.notification_channel add value if not exists 'push';

-- One row per device (browser or installed app) that turned notifications on.
create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  endpoint text not null unique check (endpoint like 'https://%'),
  p256dh text not null,
  auth text not null,
  device text check (char_length(device) <= 200),
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "Own devices: read" on public.push_subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Own devices: add" on public.push_subscriptions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Own devices: remove" on public.push_subscriptions
  for delete to authenticated using ((select auth.uid()) = user_id);

grant select, insert, delete on public.push_subscriptions to authenticated;
grant all on public.push_subscriptions to service_role;
