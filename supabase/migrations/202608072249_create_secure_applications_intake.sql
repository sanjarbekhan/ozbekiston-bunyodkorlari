create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(trim(full_name)) between 2 and 160),
  phone text not null check (char_length(trim(phone)) between 5 and 40),
  telegram text,
  gender text check (gender in ('Ayol','Erkak') or gender is null),
  age_group text,
  promo_code text,
  status text not null default 'new' check (status in ('new','reviewing','accepted','rejected')),
  admin_note text,
  source text not null default 'web',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.applications enable row level security;
revoke all on public.applications from anon, authenticated;
grant insert on public.applications to anon, authenticated;
grant select, update, delete on public.applications to authenticated;

create policy "Public submit applications" on public.applications
for insert to anon, authenticated
with check (status = 'new' and source = 'web' and admin_note is null);

create policy "Admin read applications" on public.applications
for select to authenticated
using ((select auth.uid()) = '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid);

create policy "Admin update applications" on public.applications
for update to authenticated
using ((select auth.uid()) = '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid)
with check ((select auth.uid()) = '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid);

create policy "Admin delete applications" on public.applications
for delete to authenticated
using ((select auth.uid()) = '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid);

create index if not exists applications_created_at_idx on public.applications(created_at desc);
create index if not exists applications_status_idx on public.applications(status);

create or replace function public.set_applications_updated_at()
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

create trigger set_applications_updated_at
before update on public.applications
for each row execute function public.set_applications_updated_at();
