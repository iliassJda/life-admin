drop index public.reminder_rules_item_idx;
create index reminder_rules_item_user_idx on public.reminder_rules (item_id, user_id);
create index notifications_item_user_idx on public.notifications_sent (item_id, user_id);
