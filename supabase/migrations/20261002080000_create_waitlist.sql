create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (char_length(email) <= 254),
  joined_at timestamptz not null default now(),
  track text[] not null default '{}',
  other text check (char_length(other) <= 200),
  answered_at timestamptz
);

-- No policies: only the server (secret key) can read or write.
alter table public.waitlist enable row level security;
grant select, insert, update on public.waitlist to service_role;
