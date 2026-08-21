create table if not exists public.article_rankings (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  period_type text not null default 'all_time' check (period_type in ('month', 'year', 'all_time')),
  period_key text not null default 'all',
  achievement_score numeric(5,2) not null default 0 check (achievement_score >= 0 and achievement_score <= 60),
  activity_score numeric(5,2) not null default 0 check (activity_score >= 0 and activity_score <= 20),
  leadership_score numeric(5,2) not null default 0 check (leadership_score >= 0 and leadership_score <= 15),
  evidence_score numeric(5,2) not null default 0 check (evidence_score >= 0 and evidence_score <= 5),
  total_score numeric(5,2) generated always as (achievement_score + activity_score + leadership_score + evidence_score) stored,
  achievements jsonb not null default '[]'::jsonb check (jsonb_typeof(achievements) = 'array'),
  ai_summary text,
  ai_confidence numeric(4,3) check (ai_confidence is null or (ai_confidence >= 0 and ai_confidence <= 1)),
  scoring_source text not null default 'rules' check (scoring_source in ('ai', 'rules', 'manual')),
  scoring_version text not null default 'v1',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  computed_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (article_id, period_type, period_key)
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists article_rankings_public_idx
  on public.article_rankings (period_type, period_key, status, total_score desc);

create index if not exists article_rankings_article_idx
  on public.article_rankings (article_id, status);

create index if not exists article_rankings_approved_by_idx
  on public.article_rankings (approved_by);

alter table public.article_rankings enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Admin users can read own membership" on public.admin_users;
create policy "Admin users can read own membership"
  on public.admin_users
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Public read approved rankings" on public.article_rankings;
create policy "Public read approved rankings"
  on public.article_rankings
  for select
  to anon, authenticated
  using (
    status = 'approved'
    or exists (
      select 1 from public.admin_users
      where admin_users.user_id = (select auth.uid())
    )
  );

drop policy if exists "Registered admin insert rankings" on public.article_rankings;
create policy "Registered admin insert rankings"
  on public.article_rankings
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = (select auth.uid())
    )
  );

drop policy if exists "Registered admin update rankings" on public.article_rankings;
create policy "Registered admin update rankings"
  on public.article_rankings
  for update
  to authenticated
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = (select auth.uid())
    )
  );

drop policy if exists "Registered admin delete rankings" on public.article_rankings;
create policy "Registered admin delete rankings"
  on public.article_rankings
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.user_id = (select auth.uid())
    )
  );

-- Existing project admins can be bootstrapped from article ownership without
-- hardcoding generated user IDs into the migration.
insert into public.admin_users (user_id)
select created_by
from public.articles
where created_by is not null
group by created_by
having count(*) >= 10
on conflict (user_id) do nothing;
