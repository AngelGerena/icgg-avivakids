-- EMERGENCY UNDO for the 2026-10-12 lockdown. Restores the previous (open) access rules.
-- Only run this if something breaks on a Sunday and you need the old behavior back immediately.
-- Paste into the Supabase SQL Editor for the "ICGG Kids" project and run.

alter policy "Anyone can view children" on public.children to anon, authenticated using (true);
alter policy "Anyone can insert children" on public.children to anon, authenticated with check (true);
alter policy "Authenticated users can update children" on public.children to authenticated using (true) with check (true);
alter policy "Authenticated users can delete children" on public.children to authenticated using (true);
alter policy "Anyone can view parents" on public.parents to anon, authenticated using (true);
alter policy "Anyone can insert parents" on public.parents to anon, authenticated with check (true);
alter policy "Authenticated users can update parents" on public.parents to authenticated using (true) with check (true);
alter policy "Anyone can view intake forms" on public.intake_forms to anon, authenticated using (true);
alter policy "Anyone can insert intake forms" on public.intake_forms to anon, authenticated with check (true);
alter policy "Authenticated users can update intake forms" on public.intake_forms to authenticated using (true) with check (true);
alter policy "Authenticated users can view attendance" on public.attendance to authenticated using (true);
alter policy "Authenticated users can insert attendance" on public.attendance to authenticated with check (true);
alter policy "Authenticated users can delete attendance" on public.attendance to authenticated using (true);
alter policy "Anyone can view alerts" on public.alerts to anon, authenticated using (true);
alter policy "Anyone can acknowledge alerts" on public.alerts to anon using (true) with check (true);
alter policy "Authenticated users can insert alerts" on public.alerts to authenticated with check (true);
alter policy "Authenticated users can update alerts" on public.alerts to authenticated using (true) with check (true);
alter policy "Authenticated users can delete alerts" on public.alerts to authenticated using (true);
alter policy "Public can read checkouts" on public.checkouts to anon using (true);
alter policy "Authenticated can manage checkouts" on public.checkouts to authenticated using (true) with check (true);
alter policy "Anyone can view notifications" on public.parent_notifications to anon, authenticated using (true);
alter policy "Anyone can mark notifications as read" on public.parent_notifications to anon, authenticated using (true) with check (true);
alter policy "Authenticated users can create notifications" on public.parent_notifications to authenticated with check (true);
alter policy "Public can read vbs_children" on public.vbs_children to anon using (true);
alter policy "Anyone can insert vbs_children" on public.vbs_children to anon with check (true);
alter policy "Authenticated can manage vbs_children" on public.vbs_children to authenticated using (true);
alter policy "Public can read vbs_attendance" on public.vbs_attendance to anon using (true);
alter policy "Authenticated can manage vbs_attendance" on public.vbs_attendance to authenticated using (true);
alter policy "Public can read vbs_settings" on public.vbs_settings to anon using (true);
alter policy "Authenticated can manage vbs_settings" on public.vbs_settings to authenticated using (true) with check (true);
alter policy "Authenticated users can insert events" on public.events to authenticated with check (true);
alter policy "Authenticated users can update events" on public.events to authenticated using (true) with check (true);
alter policy "Authenticated users can delete events" on public.events to authenticated using (true);
alter policy "Staff can read messages" on public.staff_messages to authenticated using (true);
alter policy "Staff can post messages" on public.staff_messages to authenticated with check (true);
alter policy "Staff can view volunteers" on public.volunteer_signups to authenticated using (true);
alter policy "Staff can delete volunteers" on public.volunteer_signups to authenticated using (true);
alter policy "Public read child photos" on storage.objects to anon, authenticated using (bucket_id = 'child-photos');
alter policy "Staff manage child photos" on storage.objects to anon, authenticated using (bucket_id = 'child-photos') with check (bucket_id = 'child-photos');
alter policy "Public read parent photos" on storage.objects to anon, authenticated using (bucket_id = 'parent-photos');
alter policy "Staff manage parent photos" on storage.objects to anon, authenticated using (bucket_id = 'parent-photos') with check (bucket_id = 'parent-photos');
alter policy "Public read staff chat files" on storage.objects to anon, authenticated using (bucket_id = 'staff-chat');
alter policy "Staff upload chat files" on storage.objects to authenticated with check (bucket_id = 'staff-chat');
