-- Bunyodkor Connect: verified biography owners, opt-in messaging and moderated requests.
-- IMPORTANT: apply ONLY to the Supabase project containing public.articles for bunyodkor.com.
-- All direct thread/message mutations are denied; security-definer RPCs enforce authorization.
create table public.connect_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 80),
  verified_article_id uuid unique references public.articles(id) on delete set null,
  chat_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint connect_verified_before_chat check (not chat_enabled or verified_article_id is not null)
);

create table public.connect_claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  note text not null check (char_length(btrim(note)) between 15 and 1000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);
create unique index connect_claim_pending_unique on public.connect_claims(user_id,article_id) where status='pending';
create index connect_claims_admin_idx on public.connect_claims(status, created_at desc);

create table public.connect_threads (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  requester_name text not null,
  recipient_name text not null,
  kind text not null check(kind in ('question','collaboration')),
  status text not null default 'pending' check(status in ('pending','accepted','declined')),
  requester_read_at timestamptz not null default now(),
  recipient_read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint connect_thread_not_self check(requester_id <> recipient_id),
  constraint connect_thread_unique_pair unique(requester_id,recipient_id)
);
create index connect_threads_inbox_requester_idx on public.connect_threads(requester_id,updated_at desc);
create index connect_threads_inbox_recipient_idx on public.connect_threads(recipient_id,updated_at desc);

create table public.connect_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.connect_threads(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check(char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);
create index connect_messages_thread_idx on public.connect_messages(thread_id,created_at desc);

create table public.connect_blocks (
  blocker_id uuid not null references auth.users(id) on delete cascade,
  blocked_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(blocker_id,blocked_id),
  constraint connect_cannot_block_self check(blocker_id <> blocked_id)
);

create table public.connect_reports (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.connect_threads(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check(char_length(btrim(reason)) between 10 and 600),
  status text not null default 'pending' check(status in ('pending','reviewed')),
  created_at timestamptz not null default now()
);
create unique index connect_reports_one_per_thread on public.connect_reports(reporter_id,thread_id);
create index connect_reports_status_idx on public.connect_reports(status,created_at desc);

alter table public.connect_profiles enable row level security;
alter table public.connect_claims enable row level security;
alter table public.connect_threads enable row level security;
alter table public.connect_messages enable row level security;
alter table public.connect_blocks enable row level security;
alter table public.connect_reports enable row level security;

revoke all on public.connect_profiles,public.connect_claims,public.connect_threads,
 public.connect_messages,public.connect_blocks,public.connect_reports from anon,authenticated;
grant select on public.connect_profiles,public.connect_claims,public.connect_threads,
 public.connect_messages,public.connect_blocks,public.connect_reports to authenticated;
grant insert(user_id,display_name) on public.connect_profiles to authenticated;
grant update(display_name,chat_enabled) on public.connect_profiles to authenticated;
grant insert(user_id,article_id,note) on public.connect_claims to authenticated;
grant insert(blocker_id,blocked_id) on public.connect_blocks to authenticated;
grant delete on public.connect_blocks to authenticated;
grant insert(thread_id,reporter_id,reason) on public.connect_reports to authenticated;

create policy connect_profiles_read on public.connect_profiles for select to authenticated
using (
 user_id=(select auth.uid())
 or (chat_enabled and verified_article_id is not null)
 or exists(
   select 1 from public.connect_threads t
   where (t.requester_id=(select auth.uid()) and t.recipient_id=connect_profiles.user_id)
      or (t.recipient_id=(select auth.uid()) and t.requester_id=connect_profiles.user_id)
 )
);
create policy connect_profiles_create on public.connect_profiles for insert to authenticated
with check(user_id=(select auth.uid()));
create policy connect_profiles_edit on public.connect_profiles for update to authenticated
using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));

create policy connect_claims_read on public.connect_claims for select to authenticated
using(user_id=(select auth.uid()) or (select auth.uid())='988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid);
create policy connect_claims_create on public.connect_claims for insert to authenticated
with check(user_id=(select auth.uid()) and status='pending' and exists (
  select 1 from public.articles a where a.id=article_id and a.status='published'
));

create policy connect_threads_read on public.connect_threads for select to authenticated
using(requester_id=(select auth.uid()) or recipient_id=(select auth.uid()));
create policy connect_messages_read on public.connect_messages for select to authenticated
using(exists (
  select 1 from public.connect_threads t where t.id=thread_id
  and (t.requester_id=(select auth.uid()) or t.recipient_id=(select auth.uid()))
));
create policy connect_blocks_read on public.connect_blocks for select to authenticated
using(blocker_id=(select auth.uid()));
create policy connect_blocks_create on public.connect_blocks for insert to authenticated
with check(blocker_id=(select auth.uid()));
create policy connect_blocks_delete on public.connect_blocks for delete to authenticated
using(blocker_id=(select auth.uid()));
create policy connect_reports_read on public.connect_reports for select to authenticated
using(reporter_id=(select auth.uid()) or (select auth.uid())='988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid);
create policy connect_reports_create on public.connect_reports for insert to authenticated
with check(reporter_id=(select auth.uid()) and exists(
  select 1 from public.connect_threads t where t.id=thread_id
  and (t.requester_id=(select auth.uid()) or t.recipient_id=(select auth.uid()))
));

create or replace function public.connect_start_thread(
 p_article_id uuid, p_kind text, p_message text
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_user uuid:=auth.uid(); v_recipient uuid; v_name text; v_sender_name text;
 v_thread uuid; v_now timestamptz:=now();
begin
 if v_user is null then raise exception 'Tizimga kiring.'; end if;
 if p_kind not in ('question','collaboration') then raise exception 'Xabar turi noto‘g‘ri.'; end if;
 if char_length(btrim(coalesce(p_message,''))) not between 10 and 2000 then
   raise exception 'Birinchi xabar 10–2000 belgidan iborat bo‘lsin.';
 end if;
 select p.user_id,a.title into v_recipient,v_name
 from public.connect_profiles p join public.articles a on a.id=p.verified_article_id
 where p.verified_article_id=p_article_id and p.chat_enabled and a.status='published';
 if v_recipient is null then raise exception 'Ushbu nomzod xabar qabul qilmayapti.'; end if;
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
revoke all on function public.connect_start_thread(uuid,text,text) from public;
grant execute on function public.connect_start_thread(uuid,text,text) to authenticated;

create or replace function public.connect_respond(p_thread uuid,p_accept boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare v_thread public.connect_threads%rowtype;
begin
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
revoke all on function public.connect_respond(uuid,boolean) from public;
grant execute on function public.connect_respond(uuid,boolean) to authenticated;

create or replace function public.connect_send(p_thread uuid,p_body text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_t public.connect_threads%rowtype; v_msg uuid; v_actor uuid:=auth.uid();v_other uuid;
begin
 if v_actor is null then raise exception 'Tizimga kiring.'; end if;
 if char_length(btrim(coalesce(p_body,''))) not between 1 and 2000 then
  raise exception 'Xabar uzunligi 1–2000 belgi bo‘lsin.';
 end if;
 select * into v_t from public.connect_threads where id=p_thread for update;
 if not found or v_t.status<>'accepted' or v_actor not in (v_t.requester_id,v_t.recipient_id) then
   raise exception 'Ushbu suhbatga xabar yuborib bo‘lmaydi.';
 end if;
 v_other:=case when v_actor=v_t.requester_id then v_t.recipient_id else v_t.requester_id end;
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
revoke all on function public.connect_send(uuid,text) from public;
grant execute on function public.connect_send(uuid,text) to authenticated;

create or replace function public.connect_mark_read(p_thread uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
 update public.connect_threads set
 requester_read_at=case when requester_id=auth.uid() then now() else requester_read_at end,
 recipient_read_at=case when recipient_id=auth.uid() then now() else recipient_read_at end
 where id=p_thread and (requester_id=auth.uid() or recipient_id=auth.uid());
end $$;
revoke all on function public.connect_mark_read(uuid) from public;
grant execute on function public.connect_mark_read(uuid) to authenticated;

create or replace function public.connect_review_claim(p_claim uuid,p_approve boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare v_claim public.connect_claims%rowtype;
begin
 if auth.uid() is distinct from '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid then
  raise exception 'Ruxsat berilmagan.';
 end if;
 select * into v_claim from public.connect_claims where id=p_claim for update;
 if not found or v_claim.status<>'pending' then raise exception 'So‘rov ko‘rib chiqilgan.'; end if;
 if p_approve then
  if exists(select 1 from public.connect_profiles where verified_article_id=v_claim.article_id) then
    raise exception 'Maqola allaqachon tasdiqlangan hisobga biriktirilgan.';
  end if;
  update public.connect_profiles set verified_article_id=v_claim.article_id,
  chat_enabled=false,updated_at=now() where user_id=v_claim.user_id;
  if not found then raise exception 'Nomzod hisobi topilmadi.'; end if;
 end if;
 update public.connect_claims set status=case when p_approve then 'approved' else 'rejected' end,
 reviewed_by=auth.uid(),reviewed_at=now() where id=p_claim;
end $$;
revoke all on function public.connect_review_claim(uuid,boolean) from public;
grant execute on function public.connect_review_claim(uuid,boolean) to authenticated;


create or replace function public.connect_review_report(p_report uuid)
returns void language plpgsql security definer set search_path = '' as $
begin
 if auth.uid() is distinct from '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid then
  raise exception 'Ruxsat berilmagan.';
 end if;
 update public.connect_reports set status='reviewed' where id=p_report;
end $;
revoke all on function public.connect_review_report(uuid) from public;
grant execute on function public.connect_review_report(uuid) to authenticated;

-- Realtime events are still checked against SELECT/RLS.
alter publication supabase_realtime add table public.connect_threads;
alter publication supabase_realtime add table public.connect_messages;
