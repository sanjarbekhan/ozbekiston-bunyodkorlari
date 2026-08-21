create table if not exists public.article_comments (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  author_name text not null check (char_length(trim(author_name)) between 2 and 80),
  body text not null check (char_length(trim(body)) between 2 and 1200),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  ip_hash text null check (ip_hash is null or char_length(ip_hash) = 64),
  created_at timestamptz not null default now(),
  moderated_at timestamptz null,
  moderated_by uuid null references auth.users(id)
);

create index if not exists article_comments_article_status_created_idx
  on public.article_comments(article_id, status, created_at desc);
create index if not exists article_comments_ip_created_idx
  on public.article_comments(ip_hash, created_at desc)
  where ip_hash is not null;

alter table public.article_comments enable row level security;

revoke all on public.article_comments from anon, authenticated;
grant select on public.article_comments to anon, authenticated;
grant update, delete on public.article_comments to authenticated;

drop policy if exists "Public read approved comments" on public.article_comments;
create policy "Public read approved comments"
  on public.article_comments
  for select
  to anon, authenticated
  using (status = 'approved');

drop policy if exists "Admin read comments" on public.article_comments;
create policy "Admin read comments"
  on public.article_comments
  for select
  to authenticated
  using ((select auth.uid()) = '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid);

drop policy if exists "Admin update comments" on public.article_comments;
create policy "Admin update comments"
  on public.article_comments
  for update
  to authenticated
  using ((select auth.uid()) = '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid)
  with check ((select auth.uid()) = '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid);

drop policy if exists "Admin delete comments" on public.article_comments;
create policy "Admin delete comments"
  on public.article_comments
  for delete
  to authenticated
  using ((select auth.uid()) = '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid);

create or replace function public.submit_article_comment(
  p_article_id uuid,
  p_author_name text,
  p_body text,
  p_ip_hash text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_name text := trim(coalesce(p_author_name, ''));
  v_body text := trim(coalesce(p_body, ''));
  v_recent_count integer;
begin
  if char_length(v_name) < 2 or char_length(v_name) > 80 then
    raise exception 'Ism 2–80 ta belgidan iborat bo‘lishi kerak.';
  end if;

  if char_length(v_body) < 2 or char_length(v_body) > 1200 then
    raise exception 'Kommentariya 2–1200 ta belgidan iborat bo‘lishi kerak.';
  end if;

  if p_ip_hash is not null and char_length(p_ip_hash) <> 64 then
    raise exception 'Noto‘g‘ri so‘rov.';
  end if;

  if not exists (
    select 1 from public.articles
    where id = p_article_id and status = 'published'
  ) then
    raise exception 'Maqola topilmadi.';
  end if;

  if p_ip_hash is not null then
    select count(*)::integer into v_recent_count
    from public.article_comments
    where ip_hash = p_ip_hash
      and created_at > now() - interval '10 minutes';

    if v_recent_count >= 3 then
      raise exception 'Juda ko‘p kommentariya yuborildi. Birozdan so‘ng qayta urinib ko‘ring.';
    end if;
  end if;

  insert into public.article_comments(article_id, author_name, body, status, ip_hash)
  values (p_article_id, v_name, v_body, 'pending', p_ip_hash)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_article_comment(uuid, text, text, text) from public;
grant execute on function public.submit_article_comment(uuid, text, text, text) to anon, authenticated;
