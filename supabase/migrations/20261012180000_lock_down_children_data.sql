-- Aviva Kids security hardening, step 2 of 2: close public and non-staff access.
-- Apply only after the site version that uses the kids_* functions is live.
-- Staff = user_roles.role 'teacher' (is_teacher()). Parents linked through Faith at Home
-- (parent_profiles) can read only their own children. Existing policies are altered in place.

-- children
alter policy "Anyone can view children" on public.children to authenticated using (is_teacher() or parent_can_access_child(id));
alter policy "Anyone can insert children" on public.children to authenticated with check (is_teacher());
alter policy "Authenticated users can update children" on public.children to authenticated using (is_teacher()) with check (is_teacher());
alter policy "Authenticated users can delete children" on public.children to authenticated using (is_teacher());

-- parents
alter policy "Anyone can view parents" on public.parents to authenticated using (is_teacher() or parent_can_access_child(child_id));
alter policy "Anyone can insert parents" on public.parents to authenticated with check (is_teacher());
alter policy "Authenticated users can update parents" on public.parents to authenticated using (is_teacher()) with check (is_teacher());

-- intake_forms
alter policy "Anyone can view intake forms" on public.intake_forms to authenticated using (is_teacher() or parent_can_access_child(child_id));
alter policy "Anyone can insert intake forms" on public.intake_forms to authenticated with check (is_teacher());
alter policy "Authenticated users can update intake forms" on public.intake_forms to authenticated using (is_teacher()) with check (is_teacher());

-- attendance
alter policy "Authenticated users can view attendance" on public.attendance to authenticated using (is_teacher());
alter policy "Authenticated users can insert attendance" on public.attendance to authenticated with check (is_teacher());
alter policy "Authenticated users can delete attendance" on public.attendance to authenticated using (is_teacher());

-- alerts (the public banner uses kids_active_alerts / acknowledge_alert)
alter policy "Anyone can view alerts" on public.alerts to authenticated using (is_teacher());
alter policy "Anyone can acknowledge alerts" on public.alerts to authenticated using (is_teacher()) with check (is_teacher());
alter policy "Authenticated users can insert alerts" on public.alerts to authenticated with check (is_teacher());
alter policy "Authenticated users can update alerts" on public.alerts to authenticated using (is_teacher()) with check (is_teacher());
alter policy "Authenticated users can delete alerts" on public.alerts to authenticated using (is_teacher());

-- checkouts
alter policy "Public can read checkouts" on public.checkouts to authenticated using (is_teacher());
alter policy "Authenticated can manage checkouts" on public.checkouts to authenticated using (is_teacher()) with check (is_teacher());

-- parent_notifications
alter policy "Anyone can view notifications" on public.parent_notifications to authenticated using (is_teacher() or parent_can_access_child(child_id));
alter policy "Anyone can mark notifications as read" on public.parent_notifications to authenticated
  using (is_teacher() or parent_can_access_child(child_id)) with check (is_teacher() or parent_can_access_child(child_id));
alter policy "Authenticated users can create notifications" on public.parent_notifications to authenticated with check (is_teacher());

-- VBS
alter policy "Public can read vbs_children" on public.vbs_children to authenticated using (is_teacher());
alter policy "Anyone can insert vbs_children" on public.vbs_children to authenticated with check (is_teacher());
alter policy "Authenticated can manage vbs_children" on public.vbs_children to authenticated using (is_teacher()) with check (is_teacher());
alter policy "Public can read vbs_attendance" on public.vbs_attendance to authenticated using (is_teacher());
alter policy "Authenticated can manage vbs_attendance" on public.vbs_attendance to authenticated using (is_teacher()) with check (is_teacher());
alter policy "Public can read vbs_settings" on public.vbs_settings to anon, authenticated using (true);
alter policy "Authenticated can manage vbs_settings" on public.vbs_settings to authenticated using (is_teacher()) with check (is_teacher());

-- events (public read stays)
alter policy "Authenticated users can insert events" on public.events to authenticated with check (is_teacher());
alter policy "Authenticated users can update events" on public.events to authenticated using (is_teacher()) with check (is_teacher());
alter policy "Authenticated users can delete events" on public.events to authenticated using (is_teacher());

-- staff chat and volunteers
alter policy "Staff can read messages" on public.staff_messages to authenticated using (is_teacher());
alter policy "Staff can post messages" on public.staff_messages to authenticated with check (is_teacher());
alter policy "Staff can view volunteers" on public.volunteer_signups to authenticated using (is_teacher());
alter policy "Staff can delete volunteers" on public.volunteer_signups to authenticated using (is_teacher());

-- Storage: photos can still be uploaded at registration; only staff can list, replace or delete.
alter policy "Public read child photos" on storage.objects to authenticated using (bucket_id = 'child-photos' and is_teacher());
alter policy "Staff manage child photos" on storage.objects to authenticated
  using (bucket_id = 'child-photos' and is_teacher()) with check (bucket_id = 'child-photos' and is_teacher());
alter policy "Public read parent photos" on storage.objects to authenticated using (bucket_id = 'parent-photos' and is_teacher());
alter policy "Staff manage parent photos" on storage.objects to authenticated
  using (bucket_id = 'parent-photos' and is_teacher()) with check (bucket_id = 'parent-photos' and is_teacher());
alter policy "Public read staff chat files" on storage.objects to authenticated using (bucket_id = 'staff-chat' and is_teacher());
alter policy "Staff upload chat files" on storage.objects to authenticated with check (bucket_id = 'staff-chat' and is_teacher());

update storage.buckets
set file_size_limit = 5242880, allowed_mime_types = array['image/jpeg','image/png','image/webp','image/heic']
where id in ('child-photos', 'parent-photos');

-- Internal helper off the public API. is_teacher() and parent_can_access_child() stay callable
-- because policies (for example published lessons) evaluate them for every visitor.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
