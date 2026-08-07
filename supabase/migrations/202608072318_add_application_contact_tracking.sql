alter table public.applications
  add column if not exists ip_address text,
  add column if not exists contacted boolean not null default false,
  add column if not exists contacted_at timestamptz;

create index if not exists applications_contacted_idx on public.applications(contacted, created_at desc);

-- Keep public submissions unable to pre-mark themselves as contacted.
drop policy if exists "Public submit applications" on public.applications;
create policy "Public submit applications" on public.applications
for insert to anon, authenticated
with check (
  status = 'new'
  and source = 'web'
  and admin_note is null
  and contacted = false
  and contacted_at is null
);
