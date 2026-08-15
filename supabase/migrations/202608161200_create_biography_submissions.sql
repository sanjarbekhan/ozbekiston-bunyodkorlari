create table if not exists public.biography_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(trim(full_name)) between 2 and 180),
  telegram text not null check (telegram ~ '^[A-Za-z][A-Za-z0-9_]{4,31}$'),
  phone text,
  instagram text not null check (instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  answers jsonb not null check (
    jsonb_typeof(answers) = 'object'
    and answers ?& array['q1','q2','q3','q4','q5','q6','q7','q8','q9','q10','q11','q12','q13','q14','q15']
    and octet_length(answers::text) <= 60000
  ),
  files jsonb not null default '[]'::jsonb check (
    jsonb_typeof(files) = 'array'
    and jsonb_array_length(files) between 1 and 3
    and octet_length(files::text) <= 10000
  ),
  status text not null default 'new' check (
    status in ('new','reviewing','drafting','needs_changes','published','rejected')
  ),
  admin_note text,
  source text not null default 'crm_form' check (source = 'crm_form'),
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.biography_submissions enable row level security;

revoke all on public.biography_submissions from anon, authenticated;
grant insert on public.biography_submissions to anon, authenticated;
grant select, update, delete on public.biography_submissions to authenticated;

drop policy if exists "Public submit biographies" on public.biography_submissions;
create policy "Public submit biographies" on public.biography_submissions
for insert to anon, authenticated
with check (
  status = 'new'
  and source = 'crm_form'
  and admin_note is null
  and jsonb_array_length(files) between 1 and 3
);

drop policy if exists "Admin read biographies" on public.biography_submissions;
create policy "Admin read biographies" on public.biography_submissions
for select to authenticated
using ((select auth.uid()) = '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid);

drop policy if exists "Admin update biographies" on public.biography_submissions;
create policy "Admin update biographies" on public.biography_submissions
for update to authenticated
using ((select auth.uid()) = '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid)
with check ((select auth.uid()) = '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid);

drop policy if exists "Admin delete biographies" on public.biography_submissions;
create policy "Admin delete biographies" on public.biography_submissions
for delete to authenticated
using ((select auth.uid()) = '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid);

create index if not exists biography_submissions_created_at_idx
  on public.biography_submissions(created_at desc);
create index if not exists biography_submissions_status_idx
  on public.biography_submissions(status, created_at desc);
create index if not exists biography_submissions_telegram_idx
  on public.biography_submissions(lower(telegram));

create or replace function public.set_biography_submissions_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_biography_submissions_updated_at on public.biography_submissions;
create trigger set_biography_submissions_updated_at
before update on public.biography_submissions
for each row execute function public.set_biography_submissions_updated_at();
