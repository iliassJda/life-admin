-- "Forgotten" subscriptions: when someone marks an item as no longer used.
-- Null means in use; a timestamp records when it was marked unused.
alter table public.items
  add column unused_since timestamptz;
