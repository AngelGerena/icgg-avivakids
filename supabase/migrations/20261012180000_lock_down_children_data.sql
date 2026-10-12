-- Aviva Kids security hardening, step 2 of 2: close public and non-staff access.
-- Apply only after the site version that uses the kids_* functions is live.
-- Staff = user_roles.role 'teacher' (is_teacher()). Parents linked through Faith at Home
-- (parent_profiles) can read only their own children.

-- 1. Remove every existing policy on the tables being locked down.
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('children','parents','intake_forms','attendance','alerts','checkouts',
                        'parent_notifications','vbs_children','vbs_attendance','vbs_settings',
                        'events','staff_messages','volunteer_signups')
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- 2. Children, parents, intake forms: staff full access; linked parents read their own.
create policy kids_children_read on public.children for select to authenticated
  using (is_teacher() or parent_can_access_child(id));
create policy kids_children_write on public.children for all to authenticated
  using (is_teacher()) with check (is_teacher());

create policy kids_parents_read on public.parents for select to authenticated
  using (is_teacher() or parent_can_access_child(child_id));
create policy kids_parents_write on public.parents for all to authenticated
  using (is_teacher()) with check (is_teacher());

create policy kids_intake_read on public.intake_forms for select to authenticated
  using (is_teacher() or parent_can_access_child(child_id));
create policy kids_intake_write on public.intake_forms for all to authenticated
  using (is_teacher()) with check (is_teacher());

-- 3. Staff-only tables.
create policy kids_attendance_staff on public.attendance for all to authenticated
  using (is_teacher()) with check (is_teacher());
create policy kids_alerts_staff on public.alerts for all to authenticated
  using (is_teacher()) with check (is_teacher());
create policy kids_checkouts_staff on public.checkouts for all to authenticated
  using (is_teacher()) with check (is_teacher());
create policy kids_vbs_children_staff on public.vbs_children for all to authenticated
  using (is_teacher()) with check (is_teacher());
create policy kids_vbs_attendance_staff on public.vbs_attendance for all to authenticated
  using (is_teacher()) with check (is_teacher());
create policy kids_staff_messages_read on public.staff_messages for select to authenticated
  using (is_teacher());
create policy kids_staff_messages_post on public.staff_messages for insert to authenticated
  with check (is_teacher());
create policy kids_staff_messages_delete on public.staff_messages for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'finessemediapro@gmail.com');

-- 4. Parent notifications: staff manage; linked parents read and mark their own as read.
create policy kids_notifications_staff on public.parent_notifications for all to authenticated
  using (is_teacher()) with check (is_teacher());
create policy kids_notifications_parent_read on public.parent_notifications for select to authenticated
  using (parent_can_access_child(child_id));
create policy kids_notifications_parent_update on public.parent_notifications for update to authenticated
  using (parent_can_access_child(child_id)) with check (parent_can_access_child(child_id));

-- 5. Public information stays public; changes are staff only.
create policy kids_events_public_read on public.events for select to anon, authenticated using (true);
create policy kids_events_staff on public.events for all to authenticated
  using (is_teacher()) with check (is_teacher());
create policy kids_vbs_settings_public_read on public.vbs_settings for select to anon, authenticated using (true);
create policy kids_vbs_settings_staff on public.vbs_settings for all to authenticated
  using (is_teacher()) with check (is_teacher());
create policy kids_volunteer_signup on public.volunteer_signups for insert to anon, authenticated
  with check (volunteer_date >= current_date);
create policy kids_volunteer_staff_read on public.volunteer_signups for select to authenticated using (is_teacher());
create policy kids_volunteer_staff_delete on public.volunteer_signups for delete to authenticated using (is_teacher());

-- 6. Storage: photos can be uploaded (registration), but only staff can list, replace or delete.
drop policy if exists "Public read child photos" on storage.objects;
drop policy if exists "Anyone can upload child photos" on storage.objects;
drop policy if exists "Staff manage child photos" on storage.objects;
drop policy if exists "Public read parent photos" on storage.objects;
drop policy if exists "Anyone can upload parent photos" on storage.objects;
drop policy if exists "Staff manage parent photos" on storage.objects;
drop policy if exists "Public read staff chat files" on storage.objects;
drop policy if exists "Staff upload chat files" on storage.objects;

create policy kids_photos_upload on storage.objects for insert to anon, authenticated
  with check (bucket_id in ('child-photos', 'parent-photos'));
create policy kids_photos_staff_read on storage.objects for select to authenticated
  using (bucket_id in ('child-photos', 'parent-photos') and is_teacher());
create policy kids_photos_staff_update on storage.objects for update to authenticated
  using (bucket_id in ('child-photos', 'parent-photos') and is_teacher())
  with check (bucket_id in ('child-photos', 'parent-photos') and is_teacher());
create policy kids_photos_staff_delete on storage.objects for delete to authenticated
  using (bucket_id in ('child-photos', 'parent-photos') and is_teacher());
create policy kids_staff_chat_read on storage.objects for select to authenticated
  using (bucket_id = 'staff-chat' and is_teacher());
create policy kids_staff_chat_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'staff-chat' and is_teacher());

update storage.buckets
set file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp','image/heic']
where id in ('child-photos', 'parent-photos');

-- 7. Internal helper off the public API. is_teacher() and parent_can_access_child() stay
--    callable because policies (for example published lessons) evaluate them for every visitor.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
