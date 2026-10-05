create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.item_kind as enum ('subscription', 'document', 'contract');
create type public.recurrence_unit as enum ('day', 'week', 'month', 'year');
create type public.notification_channel as enum ('email');
create type public.notification_status as enum ('pending', 'sent', 'failed');

-- Profiles ------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  time_zone text not null default 'Europe/Brussels',
  reminder_time time not null default '09:00',
  email_reminders boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Items ---------------------------------------------------------------------

create table public.items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  kind public.item_kind not null,
  name text not null check (char_length(name) between 1 and 120),
  key_date date not null,
  recurrence_unit public.recurrence_unit,
  recurrence_interval integer check (recurrence_interval between 1 and 100),
  amount numeric(12, 2) check (amount >= 0),
  currency text not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  notes text check (char_length(notes) <= 2000),
  file_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint items_recurrence_complete
    check ((recurrence_unit is null) = (recurrence_interval is null)),
  constraint items_id_user_unique unique (id, user_id)
);

create index items_user_key_date_idx on public.items (user_id, key_date);

-- Reminder rules: item_id null = the user's default rules -------------------

create table public.reminder_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  item_id uuid,
  days_before integer not null check (days_before between 0 and 365),
  created_at timestamptz not null default now(),
  constraint reminder_rules_item_fk
    foreign key (item_id, user_id) references public.items (id, user_id) on delete cascade,
  constraint reminder_rules_unique unique nulls not distinct (user_id, item_id, days_before)
);

create index reminder_rules_item_idx on public.reminder_rules (item_id);

-- Notifications log ---------------------------------------------------------

create table public.notifications_sent (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id uuid not null,
  occurrence_date date not null,
  days_before integer not null,
  channel public.notification_channel not null,
  status public.notification_status not null default 'pending',
  attempts integer not null default 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  constraint notifications_item_fk
    foreign key (item_id, user_id) references public.items (id, user_id) on delete cascade,
  constraint notifications_once
    unique (item_id, occurrence_date, days_before, channel)
);

create index notifications_user_idx on public.notifications_sent (user_id);

-- updated_at ----------------------------------------------------------------

create function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function private.touch_updated_at();
create trigger items_touch before update on public.items
  for each row execute function private.touch_updated_at();

-- New user: profile + default reminder rules (30, 7 and 1 day before) -------

create function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.reminder_rules (user_id, days_before)
  select new.id, d from unnest(array[30, 7, 1]) as d;
  return new;
end;
$$;

revoke execute on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- Row-level security --------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.items enable row level security;
alter table public.reminder_rules enable row level security;
alter table public.notifications_sent enable row level security;

create policy "Own profile: read" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Own profile: update" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "Own items: read" on public.items
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Own items: create" on public.items
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Own items: update" on public.items
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own items: delete" on public.items
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Own rules: read" on public.reminder_rules
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Own rules: create" on public.reminder_rules
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Own rules: delete" on public.reminder_rules
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Own notifications: read" on public.notifications_sent
  for select to authenticated using ((select auth.uid()) = user_id);

-- Table privileges (this project does not grant them automatically) ---------

grant usage on type public.item_kind, public.recurrence_unit,
  public.notification_channel, public.notification_status to authenticated, service_role;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.items to authenticated;
grant select, insert, delete on public.reminder_rules to authenticated;
grant select on public.notifications_sent to authenticated;

grant all on public.profiles, public.items, public.reminder_rules,
  public.notifications_sent to service_role;
