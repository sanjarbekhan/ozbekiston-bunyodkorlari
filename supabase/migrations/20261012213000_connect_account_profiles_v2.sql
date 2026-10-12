-- Bunyodkor Connect 2.0: owner-only account details and scoped profile photo uploads.
-- Additive migration; articles and existing conversations remain unchanged.
create table if not exists public.connect_account_details (
 user_id uuid primary key references auth.users(id) on delete cascade,
 first_name text not null check(char_length(btrim(first_name)) between 2 and 60),
 last_name text not null check(char_length(btrim(last_name)) between 2 and 60),
 age smallint not null check(age between 13 and 100),
 updated_at timestamptz not null default now()
);
alter table public.connect_account_details enable row level security;
revoke all on public.connect_account_details from anon,authenticated;
grant select,insert,update on public.connect_account_details to authenticated;
create policy connect_account_details_read_self on public.connect_account_details for select to authenticated using(user_id=(select auth.uid()));
create policy connect_account_details_insert_self on public.connect_account_details for insert to authenticated with check(user_id=(select auth.uid()));
create policy connect_account_details_update_self on public.connect_account_details for update to authenticated
 using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

alter table public.connect_profiles add column if not exists avatar_path text;
-- Own-user updates must be scoped to own folder: e.g. uuid/avatar.webp.
alter table public.connect_profiles add constraint connect_profiles_avatar_scope
 check(avatar_path is null or (
  avatar_path like user_id::text || '/%'
  and char_length(avatar_path) between 40 and 240
  and avatar_path !~ '[[:space:]]'
 ));
grant select(avatar_path) on public.connect_profiles to authenticated;
grant update(avatar_path) on public.connect_profiles to authenticated;

-- Only adult owners can choose to receive unsolicited conversation requests.
drop policy if exists connect_profiles_edit on public.connect_profiles;
create policy connect_profiles_edit on public.connect_profiles for update to authenticated
using(user_id=(select auth.uid()))
with check(
 user_id=(select auth.uid())
 and (not chat_enabled or exists(
  select 1 from public.connect_account_details d
  where d.user_id=(select auth.uid()) and d.age>=18
 ))
);

-- Enforce age-gating on the message RPCs as well as the UI (not only on settings).
create or replace function public.connect_adult_user(p_user uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
 select exists(
  select 1 from public.connect_account_details d
  where d.user_id=p_user and d.age>=18
 );
$$;
revoke all on function public.connect_adult_user(uuid) from public,anon,authenticated;

-- A user's avatar is optional; uploaded through a public-bucket dedicated to portraits.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('connect-avatars','connect-avatars',true,2097152,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set
 public=true,file_size_limit=2097152,allowed_mime_types=excluded.allowed_mime_types;

create policy connect_avatars_upload_own on storage.objects for insert to authenticated
with check(
 bucket_id='connect-avatars'
 and (storage.foldername(name))[1]=(select auth.uid())::text
 and lower(storage.extension(name)) in ('jpg','jpeg','png','webp')
);
create policy connect_avatars_update_own on storage.objects for update to authenticated
using(bucket_id='connect-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text)
with check(bucket_id='connect-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy connect_avatars_delete_own on storage.objects for delete to authenticated
using(bucket_id='connect-avatars' and (storage.foldername(name))[1]=(select auth.uid())::text);

-- Existing security-definer functions are replaced to add adulthood guards without
-- trusting or granting UPDATE on the verification columns.
create or replace function public.connect_start_thread(
 p_article_id uuid, p_kind text, p_message text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid:=auth.uid(); v_recipient uuid; v_name text; v_sender_name text;
 v_thread uuid; v_now timestamptz:=now();
begin
 if v_user is null then raise exception 'Tizimga kiring.'; end if;
 if not public.connect_adult_user(v_user) then raise exception 'Shaxsiy chat hozircha 18 yoshdan kattalar uchun.'; end if;
 if p_kind not in ('question','collaboration') then raise exception 'Xabar turi noto‘g‘ri.'; end if;
 if char_length(btrim(coalesce(p_message,''))) not between 10 and 2000 then
   raise exception 'Birinchi xabar 10–2000 belgidan iborat bo‘lsin.';
 end if;
 select p.user_id,a.title into v_recipient,v_name
 from public.connect_profiles p join public.articles a on a.id=p.verified_article_id
 where p.verified_article_id=p_article_id and p.chat_enabled and a.status='published';
 if v_recipient is null then raise exception 'Ushbu nomzod xabar qabul qilmayapti.'; end if;
 if not public.connect_adult_user(v_recipient) then raise exception 'Ushbu profil chat uchun mavjud emas.'; end if;
 if v_recipient=v_user then raise exception 'O‘zingizga xabar yubora olmaysiz.'; end if;
 select display_name into v_sender_name from public.connect_profiles where user_id=v_user;
 if v_sender_name is null then raise exception 'Avval shaxsiy profilingizni yarating.'; end if;
 if exists(select 1 from public.connect_blocks b
  where (b.blocker_id=v_user and b.blocked_id=v_recipient)
     or (b.blocker_id=v_recipient and b.blocked_id=v_user)) then
   raise exception 'Ushbu foydalanuvchiga yozib bo‘lmaydi.';
 end if;
 select id into v_thread from public.connect_threads
 where requester_id=v_user and recipient_id=v_recipient;
 if v_thread is not null then return v_thread; end if;
 if (select count(*) from public.connect_threads
   where requester_id=v_user and created_at>v_now-interval '24 hours')>=6
   or (select count(*) from public.connect_threads
   where requester_id=v_user and created_at>v_now-interval '2 minutes')>=1 then
    raise exception 'Yangi suhbatlar chegarasi. Birozdan so‘ng urinib ko‘ring.';
 end if;
 insert into public.connect_threads(requester_id,recipient_id,article_id,requester_name,recipient_name,kind)
 values(v_user,v_recipient,p_article_id,v_sender_name,v_name,p_kind)
 returning id into v_thread;
 insert into public.connect_messages(thread_id,sender_id,body)
 values(v_thread,v_user,btrim(p_message));
 return v_thread;
end $$;

create or replace function public.connect_respond(p_thread uuid,p_accept boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare v_thread public.connect_threads%rowtype;
begin
 if not public.connect_adult_user(auth.uid()) then raise exception 'Chat hozircha 18 yoshdan kattalar uchun.'; end if;
 select * into v_thread from public.connect_threads where id=p_thread for update;
 if not found or v_thread.recipient_id is distinct from auth.uid() then
  raise exception 'Ruxsat berilmagan.';
 end if;
 if v_thread.status <> 'pending' then raise exception 'So‘rov allaqachon ko‘rib chiqilgan.'; end if;
 if p_accept and not exists(select 1 from public.connect_profiles p where p.user_id=auth.uid() and p.chat_enabled) then
  raise exception 'Xabarlarni qabul qilishni yoqing.';
 end if;
 update public.connect_threads set status=case when p_accept then 'accepted' else 'declined' end,
 updated_at=now(),recipient_read_at=now() where id=p_thread;
end $$;

create or replace function public.connect_send(p_thread uuid,p_body text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_t public.connect_threads%rowtype; v_msg uuid; v_actor uuid:=auth.uid();v_other uuid;
begin
 if v_actor is null then raise exception 'Tizimga kiring.'; end if;
 if not public.connect_adult_user(v_actor) then raise exception 'Chat hozircha 18 yoshdan kattalar uchun.'; end if;
 if char_length(btrim(coalesce(p_body,''))) not between 1 and 2000 then
  raise exception 'Xabar uzunligi 1–2000 belgi bo‘lsin.';
 end if;
 select * into v_t from public.connect_threads where id=p_thread for update;
 if not found or v_t.status<>'accepted' or v_actor not in (v_t.requester_id,v_t.recipient_id) then
   raise exception 'Ushbu suhbatga xabar yuborib bo‘lmaydi.';
 end if;
 v_other:=case when v_actor=v_t.requester_id then v_t.recipient_id else v_t.requester_id end;
 if not public.connect_adult_user(v_other) then raise exception 'Suhbat mavjud emas.'; end if;
 if exists(select 1 from public.connect_blocks b where
  (b.blocker_id=v_actor and b.blocked_id=v_other)
  or (b.blocker_id=v_other and b.blocked_id=v_actor)) then
   raise exception 'Suhbat bloklangan.';
 end if;
 if (select count(*) from public.connect_messages where sender_id=v_actor and created_at>now()-interval '1 minute')>=12 then
  raise exception 'Xabarlar soni chegarasiga yetdingiz.';
 end if;
 insert into public.connect_messages(thread_id,sender_id,body)
 values(p_thread,v_actor,btrim(p_body)) returning id into v_msg;
 update public.connect_threads set updated_at=now() where id=p_thread;
 return v_msg;
end $$;
-- No anonymous EXECUTE for chat functions (Supabase may grant anon by default).
revoke all on function public.connect_start_thread(uuid,text,text) from public,anon;
revoke all on function public.connect_respond(uuid,boolean) from public,anon;
revoke all on function public.connect_send(uuid,text) from public,anon;
grant execute on function public.connect_start_thread(uuid,text,text) to authenticated;
grant execute on function public.connect_respond(uuid,boolean) to authenticated;
grant execute on function public.connect_send(uuid,text) to authenticated;
