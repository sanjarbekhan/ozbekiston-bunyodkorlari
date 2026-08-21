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

create index if not exists article_rankings_public_idx
  on public.article_rankings (period_type, period_key, status, total_score desc);

create index if not exists article_rankings_article_idx
  on public.article_rankings (article_id, status);

alter table public.article_rankings enable row level security;

drop policy if exists "Public read approved rankings" on public.article_rankings;
create policy "Public read approved rankings"
  on public.article_rankings
  for select
  to anon, authenticated
  using (status = 'approved' or (select auth.uid()) = '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid);

drop policy if exists "Admin insert rankings" on public.article_rankings;
create policy "Admin insert rankings"
  on public.article_rankings
  for insert
  to authenticated
  with check ((select auth.uid()) = '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid);

drop policy if exists "Admin update rankings" on public.article_rankings;
create policy "Admin update rankings"
  on public.article_rankings
  for update
  to authenticated
  using ((select auth.uid()) = '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid)
  with check ((select auth.uid()) = '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid);

drop policy if exists "Admin delete rankings" on public.article_rankings;
create policy "Admin delete rankings"
  on public.article_rankings
  for delete
  to authenticated
  using ((select auth.uid()) = '988b7d1f-4028-42a6-9a8f-be869224be6e'::uuid);
