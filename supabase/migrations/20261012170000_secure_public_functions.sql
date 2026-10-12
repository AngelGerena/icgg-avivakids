-- Aviva Kids security hardening, step 1 of 2 (additive only).
-- Secure functions that the public pages call instead of reading tables directly.
-- Each one does a single job and returns only what that page needs.

create or replace function public.kids_digits(p text)
returns text language sql immutable set search_path = public as $$
  select regexp_replace(coalesce(p, ''), '\D', '', 'g');
$$;

-- Registro de Ninos (/check-in): create a child + parent, return the new child number.
create or replace function public.kids_register_child(
  p_child_name text, p_dob date, p_room text, p_photo_url text,
  p_parent_name text, p_parent_phone text, p_parent_email text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_num text; v_id uuid; i int := 0;
begin
  if coalesce(trim(p_child_name), '') = '' or p_dob is null or coalesce(trim(p_room), '') = ''
     or coalesce(trim(p_parent_name), '') = '' or coalesce(trim(p_parent_phone), '') = '' then
    raise exception 'missing_fields';
  end if;
  if length(p_child_name) > 120 or length(p_parent_name) > 120 or length(coalesce(p_parent_email, '')) > 200
     or length(p_parent_phone) > 40 or length(p_room) > 60 or length(coalesce(p_photo_url, '')) > 500 then
    raise exception 'field_too_long';
  end if;
  loop
    v_num := lpad(floor(random() * 10000)::int::text, 4, '0');
    exit when not exists (select 1 from children where unique_number = v_num);
    i := i + 1;
    if i > 50 then raise exception 'no_number_available'; end if;
  end loop;

  insert into children (full_name, dob, room, photo_url, unique_number, checked_in_today, check_in_time, qr_code_data)
  values (trim(p_child_name), p_dob, p_room, nullif(p_photo_url, ''), v_num, true, now(), '')
  returning id into v_id;

  update children set qr_code_data = jsonb_build_object(
    'childId', v_id, 'childNumber', v_num, 'childName', trim(p_child_name), 'type', 'child-profile')::text
  where id = v_id;

  insert into parents (child_id, primary_name, primary_relationship, primary_phone, primary_email)
  values (v_id, trim(p_parent_name), 'Parent', trim(p_parent_phone), coalesce(trim(p_parent_email), ''));

  return jsonb_build_object('id', v_id, 'unique_number', v_num);
end $$;

-- Admision form lookup by child number.
-- Staff get the full record to pre-fill. Everyone else only learns that the number exists.
create or replace function public.kids_intake_lookup(p_number text)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare c children%rowtype; p parents%rowtype; v_intake uuid;
begin
  select * into c from children where unique_number = trim(p_number) limit 1;
  if not found then return jsonb_build_object('found', false); end if;
  if not is_teacher() then
    return jsonb_build_object('found', true, 'first_name', split_part(trim(c.full_name), ' ', 1));
  end if;
  select * into p from parents where child_id = c.id limit 1;
  select id into v_intake from intake_forms where child_id = c.id limit 1;
  return jsonb_build_object('found', true, 'staff', true,
    'child', to_jsonb(c), 'parent', case when p.id is null then null else to_jsonb(p) end,
    'intake_id', v_intake);
end $$;

-- Admision form submit. Updates an existing child only when the caller is staff or
-- the parent phone or email entered matches the one on file.
create or replace function public.kids_intake_submit(
  p_number text, p_child jsonb, p_parent jsonb, p_intake jsonb
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_staff boolean := is_teacher();
  v_child_id uuid; v_num text; v_parent parents%rowtype; v_dob date; i int := 0;
begin
  v_dob := nullif(p_child->>'dob', '')::date;
  if coalesce(trim(p_child->>'full_name'), '') = '' or v_dob is null then raise exception 'missing_fields'; end if;
  if coalesce(trim(p_intake->>'digital_signature'), '') = '' then raise exception 'missing_signature'; end if;

  if coalesce(trim(p_number), '') <> '' then
    select id into v_child_id from children where unique_number = trim(p_number) limit 1;
  end if;
  if v_child_id is null then
    select id into v_child_id from children
     where full_name = trim(p_child->>'full_name') and dob = v_dob limit 1;
  end if;

  if v_child_id is not null and not v_staff then
    select * into v_parent from parents where child_id = v_child_id limit 1;
    if v_parent.id is not null and not (
         (kids_digits(v_parent.primary_phone) <> '' and kids_digits(v_parent.primary_phone) = kids_digits(p_parent->>'primary_phone'))
      or (coalesce(v_parent.primary_email, '') <> '' and lower(trim(v_parent.primary_email)) = lower(trim(coalesce(p_parent->>'primary_email', ''))))
    ) then
      raise exception 'contact_mismatch';
    end if;
  end if;

  if v_child_id is null then
    loop
      v_num := floor(10000 + random() * 90000)::int::text;
      exit when not exists (select 1 from children where unique_number = v_num);
      i := i + 1;
      if i > 50 then raise exception 'no_number_available'; end if;
    end loop;
    insert into children (full_name, nickname, dob, gender, photo_url, room, unique_number, checked_in_today)
    values (trim(p_child->>'full_name'), nullif(p_child->>'nickname', ''), v_dob, nullif(p_child->>'gender', ''),
            nullif(p_child->>'photo_url', ''), coalesce(nullif(p_child->>'room', ''), 'general'), v_num, false)
    returning id into v_child_id;
  else
    update children set
      full_name = trim(p_child->>'full_name'),
      nickname = nullif(p_child->>'nickname', ''),
      dob = v_dob,
      gender = nullif(p_child->>'gender', ''),
      photo_url = coalesce(nullif(p_child->>'photo_url', ''), photo_url),
      room = coalesce(nullif(p_child->>'room', ''), room)
    where id = v_child_id
    returning unique_number into v_num;
  end if;

  if exists (select 1 from parents where child_id = v_child_id) then
    update parents set
      primary_name = coalesce(p_parent->>'primary_name', primary_name),
      primary_relationship = coalesce(p_parent->>'primary_relationship', primary_relationship),
      primary_phone = coalesce(p_parent->>'primary_phone', primary_phone),
      primary_email = coalesce(p_parent->>'primary_email', primary_email),
      secondary_name = nullif(p_parent->>'secondary_name', ''),
      secondary_relationship = nullif(p_parent->>'secondary_relationship', ''),
      secondary_phone = nullif(p_parent->>'secondary_phone', ''),
      primary_photo_url = coalesce(nullif(p_parent->>'primary_photo_url', ''), primary_photo_url),
      secondary_photo_url = coalesce(nullif(p_parent->>'secondary_photo_url', ''), secondary_photo_url),
      approved_pickup_name = nullif(p_parent->>'approved_pickup_name', ''),
      approved_pickup_phone = nullif(p_parent->>'approved_pickup_phone', ''),
      approved_pickup_photo_url = coalesce(nullif(p_parent->>'approved_pickup_photo_url', ''), approved_pickup_photo_url)
    where child_id = v_child_id;
  else
    insert into parents (child_id, primary_name, primary_relationship, primary_phone, primary_email,
      secondary_name, secondary_relationship, secondary_phone, primary_photo_url, secondary_photo_url,
      approved_pickup_name, approved_pickup_phone, approved_pickup_photo_url)
    values (v_child_id, coalesce(p_parent->>'primary_name', ''), coalesce(p_parent->>'primary_relationship', ''),
      coalesce(p_parent->>'primary_phone', ''), coalesce(p_parent->>'primary_email', ''),
      nullif(p_parent->>'secondary_name', ''), nullif(p_parent->>'secondary_relationship', ''), nullif(p_parent->>'secondary_phone', ''),
      nullif(p_parent->>'primary_photo_url', ''), nullif(p_parent->>'secondary_photo_url', ''),
      nullif(p_parent->>'approved_pickup_name', ''), nullif(p_parent->>'approved_pickup_phone', ''), nullif(p_parent->>'approved_pickup_photo_url', ''));
  end if;

  if exists (select 1 from intake_forms where child_id = v_child_id) then
    update intake_forms set
      allergies = coalesce(array(select jsonb_array_elements_text(coalesce(p_intake->'allergies', '[]'::jsonb))), '{}'),
      restricted_foods = nullif(p_intake->>'restricted_foods', ''),
      medications = case when jsonb_typeof(p_intake->'medications') = 'array' and jsonb_array_length(p_intake->'medications') > 0 then p_intake->'medications' else null end,
      medical_conditions = nullif(p_intake->>'medical_conditions', ''),
      special_needs = nullif(p_intake->>'special_needs', ''),
      doctor_name = nullif(p_intake->>'doctor_name', ''),
      doctor_phone = nullif(p_intake->>'doctor_phone', ''),
      behavioral_notes = nullif(p_intake->>'behavioral_notes', ''),
      triggers = nullif(p_intake->>'triggers', ''),
      communication_notes = nullif(p_intake->>'communication_notes', ''),
      photo_consent = coalesce((p_intake->>'photo_consent')::boolean, false),
      medical_consent = coalesce((p_intake->>'medical_consent')::boolean, false),
      digital_signature = p_intake->>'digital_signature'
    where child_id = v_child_id;
  else
    insert into intake_forms (child_id, allergies, restricted_foods, medications, medical_conditions, special_needs,
      doctor_name, doctor_phone, behavioral_notes, triggers, communication_notes, photo_consent, medical_consent, digital_signature)
    values (v_child_id,
      coalesce(array(select jsonb_array_elements_text(coalesce(p_intake->'allergies', '[]'::jsonb))), '{}'),
      nullif(p_intake->>'restricted_foods', ''),
      case when jsonb_typeof(p_intake->'medications') = 'array' and jsonb_array_length(p_intake->'medications') > 0 then p_intake->'medications' else null end,
      nullif(p_intake->>'medical_conditions', ''), nullif(p_intake->>'special_needs', ''),
      nullif(p_intake->>'doctor_name', ''), nullif(p_intake->>'doctor_phone', ''),
      nullif(p_intake->>'behavioral_notes', ''), nullif(p_intake->>'triggers', ''), nullif(p_intake->>'communication_notes', ''),
      coalesce((p_intake->>'photo_consent')::boolean, false), coalesce((p_intake->>'medical_consent')::boolean, false),
      p_intake->>'digital_signature');
  end if;

  return jsonb_build_object('child_id', v_child_id, 'unique_number', v_num);
end $$;

-- Faith at Home login: does this email belong to the parent of this child?
create or replace function public.kids_parent_email_matches(p_number text, p_email text)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from children c join parents p on p.child_id = c.id
    where c.unique_number = trim(p_number)
      and lower(trim(p.primary_email)) = lower(trim(p_email))
      and coalesce(trim(p_email), '') <> ''
  );
$$;

-- Parent notifications bell: verified by child number + parent email on every call.
create or replace function public.kids_parent_notifications(p_number text, p_email text)
returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare c children%rowtype;
begin
  if not kids_parent_email_matches(p_number, p_email) then raise exception 'not_verified'; end if;
  select * into c from children where unique_number = trim(p_number) limit 1;
  return jsonb_build_object(
    'children', jsonb_build_array(jsonb_build_object('id', c.id, 'full_name', c.full_name, 'unique_number', c.unique_number)),
    'notifications', coalesce((
      select jsonb_agg(to_jsonb(n) order by n.created_at desc)
      from (select * from parent_notifications where child_id = c.id order by created_at desc limit 50) n
    ), '[]'::jsonb)
  );
end $$;

create or replace function public.kids_parent_notifications_read(p_number text, p_email text, p_ids uuid[])
returns void
language plpgsql security definer set search_path = public as $$
declare v_child uuid;
begin
  if not kids_parent_email_matches(p_number, p_email) then raise exception 'not_verified'; end if;
  select id into v_child from children where unique_number = trim(p_number) limit 1;
  update parent_notifications set is_read = true where child_id = v_child and id = any(p_ids);
end $$;

-- Site-wide alert banner: only unresolved alerts, only the fields the banner shows.
create or replace function public.kids_active_alerts()
returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', a.id, 'alert_type', a.alert_type, 'child_number', a.child_number, 'reason', a.reason,
      'acknowledged', a.acknowledged, 'triggered_at', a.triggered_at, 'resolved', a.resolved,
      'pickup_name', a.pickup_name, 'pickup_photo_url', a.pickup_photo_url,
      'child_name', split_part(trim(c.full_name), ' ', 1), 'child_photo_url', c.photo_url
    ) order by a.triggered_at desc), '[]'::jsonb)
  from alerts a left join children c on c.id = a.child_id
  where a.resolved = false;
$$;

-- Public birthdays page: first names and birthdays only.
create or replace function public.kids_birthdays()
returns jsonb
language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
      'id', id, 'full_name', split_part(trim(full_name), ' ', 1), 'dob', dob, 'birthday_celebrated', birthday_celebrated
    )), '[]'::jsonb)
  from children;
$$;

-- QR badge profile page for people who are not signed in as staff.
create or replace function public.kids_badge_profile(p_id uuid)
returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'child', jsonb_build_object('id', c.id, 'full_name', c.full_name, 'photo_url', c.photo_url, 'room', c.room,
      'unique_number', c.unique_number, 'checked_in_today', c.checked_in_today, 'check_in_time', c.check_in_time),
    'parent', (select jsonb_build_object('primary_name', p.primary_name, 'approved_pickup_name', p.approved_pickup_name)
               from parents p where p.child_id = c.id limit 1))
  from children c where c.id = p_id;
$$;

-- VBS online registration: insert and return the VBS code.
create or replace function public.kids_vbs_register(p jsonb)
returns text
language plpgsql security definer set search_path = public as $$
declare v_code text; i int := 0;
begin
  if coalesce(trim(p->>'full_name'), '') = '' or coalesce(trim(p->>'parent_name'), '') = ''
     or coalesce(trim(p->>'parent_phone'), '') = '' then raise exception 'missing_fields'; end if;
  if length(p->>'full_name') > 120 or length(p->>'parent_name') > 120 or length(p->>'parent_phone') > 40
     or length(coalesce(p->>'parent_email', '')) > 200 then raise exception 'field_too_long'; end if;
  loop
    v_code := 'VBS' || floor(1000 + random() * 9000)::int::text;
    exit when not exists (select 1 from vbs_children where unique_code = v_code);
    i := i + 1;
    if i > 50 then raise exception 'no_code_available'; end if;
  end loop;
  insert into vbs_children (full_name, dob, age, grade, group_name, parent_name, parent_phone, parent_email,
    is_first_time, registered_by, unique_code)
  values (trim(p->>'full_name'), nullif(p->>'dob', '')::date, nullif(p->>'age', '')::int, nullif(trim(coalesce(p->>'grade', '')), ''),
    nullif(p->>'group_name', ''), trim(p->>'parent_name'), trim(p->>'parent_phone'), nullif(trim(coalesce(p->>'parent_email', '')), ''),
    coalesce((p->>'is_first_time')::boolean, false), 'online', v_code);
  return v_code;
end $$;

-- Staff approvals: new teacher-portal sign-ups wait here until a teacher approves them.
create or replace function public.kids_pending_staff()
returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if not is_teacher() then raise exception 'teachers_only'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object('id', u.id, 'email', u.email, 'created_at', u.created_at) order by u.created_at desc)
    from auth.users u
    where not exists (select 1 from user_roles r where r.user_id = u.id)
      and not exists (select 1 from parent_profiles pp where pp.user_id = u.id)
  ), '[]'::jsonb);
end $$;

create or replace function public.kids_approve_staff(p_user uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_teacher() then raise exception 'teachers_only'; end if;
  insert into user_roles (user_id, role) values (p_user, 'teacher')
  on conflict (user_id) do update set role = 'teacher';
end $$;

-- Permissions: public pages may call these; nothing else changes yet.
revoke all on function public.kids_register_child(text, date, text, text, text, text, text) from public;
revoke all on function public.kids_intake_lookup(text) from public;
revoke all on function public.kids_intake_submit(text, jsonb, jsonb, jsonb) from public;
revoke all on function public.kids_parent_email_matches(text, text) from public;
revoke all on function public.kids_parent_notifications(text, text) from public;
revoke all on function public.kids_parent_notifications_read(text, text, uuid[]) from public;
revoke all on function public.kids_active_alerts() from public;
revoke all on function public.kids_birthdays() from public;
revoke all on function public.kids_badge_profile(uuid) from public;
revoke all on function public.kids_vbs_register(jsonb) from public;
revoke all on function public.kids_pending_staff() from public;
revoke all on function public.kids_approve_staff(uuid) from public;

grant execute on function public.kids_register_child(text, date, text, text, text, text, text) to anon, authenticated;
grant execute on function public.kids_intake_lookup(text) to anon, authenticated;
grant execute on function public.kids_intake_submit(text, jsonb, jsonb, jsonb) to anon, authenticated;
grant execute on function public.kids_parent_email_matches(text, text) to anon, authenticated;
grant execute on function public.kids_parent_notifications(text, text) to anon, authenticated;
grant execute on function public.kids_parent_notifications_read(text, text, uuid[]) to anon, authenticated;
grant execute on function public.kids_active_alerts() to anon, authenticated;
grant execute on function public.kids_birthdays() to anon, authenticated;
grant execute on function public.kids_badge_profile(uuid) to anon, authenticated;
grant execute on function public.kids_vbs_register(jsonb) to anon, authenticated;
grant execute on function public.kids_pending_staff() to authenticated;
grant execute on function public.kids_approve_staff(uuid) to authenticated;
