-- Private storage for scanned documents and receipts.
-- Files live at documents/<user id>/<file>, readable only by their owner and
-- only through short-lived signed URLs (the bucket is not public).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
)
on conflict (id) do nothing;

create policy "Own documents: read" on storage.objects
  for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Own documents: upload" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Own documents: delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- An item can only point at a file in its owner's own folder.
alter table public.items
  add constraint items_file_path_own_folder
  check (file_path is null or file_path like (user_id::text || '/%'));
