alter table public.article_rankings
  drop constraint if exists article_rankings_period_type_check;

alter table public.article_rankings
  add constraint article_rankings_period_type_check
  check (period_type in ('week', 'month', 'year', 'all_time'));

alter table public.article_rankings
  add column if not exists baseline_achievement_score numeric(5,2) not null default 0,
  add column if not exists baseline_activity_score numeric(5,2) not null default 0,
  add column if not exists baseline_leadership_score numeric(5,2) not null default 0,
  add column if not exists baseline_evidence_score numeric(5,2) not null default 0;

create or replace function public.current_ranking_period_key(p_period_type text)
returns text
language sql
stable
set search_path = public
as $$
  select case p_period_type
    when 'week' then to_char(current_date, 'IYYY-"W"IW')
    when 'month' then to_char(current_date, 'YYYY-MM')
    when 'year' then to_char(current_date, 'YYYY')
    else 'all'
  end;
$$;

create or replace function public.ensure_current_ranking_periods()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  p text;
  k text;
begin
  foreach p in array array['week', 'month', 'year'] loop
    k := public.current_ranking_period_key(p);

    insert into public.article_rankings (
      article_id,
      period_type,
      period_key,
      achievement_score,
      activity_score,
      leadership_score,
      evidence_score,
      baseline_achievement_score,
      baseline_activity_score,
      baseline_leadership_score,
      baseline_evidence_score,
      achievements,
      ai_summary,
      ai_confidence,
      scoring_source,
      scoring_version,
      status,
      computed_at,
      approved_at,
      approved_by,
      updated_at
    )
    select
      r.article_id,
      p,
      k,
      0,
      0,
      0,
      0,
      r.achievement_score,
      r.activity_score,
      r.leadership_score,
      r.evidence_score,
      '[]'::jsonb,
      case p
        when 'week' then 'Haftalik reyting uchun davr boshidagi bazaviy holat.'
        when 'month' then 'Oylik reyting uchun davr boshidagi bazaviy holat.'
        else 'Yillik reyting uchun davr boshidagi bazaviy holat.'
      end,
      r.ai_confidence,
      r.scoring_source,
      'v3-periodic',
      'approved',
      now(),
      now(),
      null,
      now()
    from public.article_rankings r
    where r.period_type = 'all_time'
      and r.period_key = 'all'
      and r.status = 'approved'
    on conflict (article_id, period_type, period_key) do nothing;
  end loop;
end;
$$;

revoke all on function public.ensure_current_ranking_periods() from public;
grant execute on function public.ensure_current_ranking_periods() to anon, authenticated;

create or replace function public.sync_periodic_rankings_from_all_time()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p text;
  k text;
begin
  if new.period_type <> 'all_time' or new.period_key <> 'all' or new.status <> 'approved' then
    return new;
  end if;

  foreach p in array array['week', 'month', 'year'] loop
    k := public.current_ranking_period_key(p);

    insert into public.article_rankings (
      article_id,
      period_type,
      period_key,
      achievement_score,
      activity_score,
      leadership_score,
      evidence_score,
      baseline_achievement_score,
      baseline_activity_score,
      baseline_leadership_score,
      baseline_evidence_score,
      achievements,
      ai_summary,
      ai_confidence,
      scoring_source,
      scoring_version,
      status,
      computed_at,
      approved_at,
      approved_by,
      updated_at
    ) values (
      new.article_id,
      p,
      k,
      0,
      0,
      0,
      0,
      new.achievement_score,
      new.activity_score,
      new.leadership_score,
      new.evidence_score,
      '[]'::jsonb,
      case p
        when 'week' then 'Haftalik reyting uchun davr boshidagi bazaviy holat.'
        when 'month' then 'Oylik reyting uchun davr boshidagi bazaviy holat.'
        else 'Yillik reyting uchun davr boshidagi bazaviy holat.'
      end,
      new.ai_confidence,
      new.scoring_source,
      'v3-periodic',
      'approved',
      now(),
      now(),
      null,
      now()
    )
    on conflict (article_id, period_type, period_key) do nothing;

    update public.article_rankings r
    set
      achievement_score = greatest(0, new.achievement_score - r.baseline_achievement_score),
      activity_score = greatest(0, new.activity_score - r.baseline_activity_score),
      leadership_score = greatest(0, new.leadership_score - r.baseline_leadership_score),
      evidence_score = greatest(0, new.evidence_score - r.baseline_evidence_score),
      achievements = new.achievements,
      ai_summary = new.ai_summary,
      ai_confidence = new.ai_confidence,
      scoring_source = new.scoring_source,
      scoring_version = 'v3-periodic',
      status = 'approved',
      computed_at = now(),
      approved_at = now(),
      approved_by = null,
      updated_at = now()
    where r.article_id = new.article_id
      and r.period_type = p
      and r.period_key = k;
  end loop;

  return new;
end;
$$;

drop trigger if exists article_rankings_sync_periods on public.article_rankings;
create trigger article_rankings_sync_periods
after insert or update of achievement_score, activity_score, leadership_score, evidence_score, achievements, ai_summary, ai_confidence, scoring_source, status
on public.article_rankings
for each row
execute function public.sync_periodic_rankings_from_all_time();

-- Launch seed: keep the current week/month/year useful immediately by copying
-- the current approved all-time scores once. Future periods start from zero and
-- show score growth within that period.
do $$
declare
  p text;
  k text;
begin
  foreach p in array array['week', 'month', 'year'] loop
    k := public.current_ranking_period_key(p);

    insert into public.article_rankings (
      article_id,
      period_type,
      period_key,
      achievement_score,
      activity_score,
      leadership_score,
      evidence_score,
      baseline_achievement_score,
      baseline_activity_score,
      baseline_leadership_score,
      baseline_evidence_score,
      achievements,
      ai_summary,
      ai_confidence,
      scoring_source,
      scoring_version,
      status,
      computed_at,
      approved_at,
      approved_by,
      updated_at
    )
    select
      r.article_id,
      p,
      k,
      r.achievement_score,
      r.activity_score,
      r.leadership_score,
      r.evidence_score,
      0,
      0,
      0,
      0,
      r.achievements,
      r.ai_summary,
      r.ai_confidence,
      r.scoring_source,
      'v3-periodic-launch',
      'approved',
      now(),
      now(),
      null,
      now()
    from public.article_rankings r
    where r.period_type = 'all_time'
      and r.period_key = 'all'
      and r.status = 'approved'
    on conflict (article_id, period_type, period_key) do nothing;
  end loop;
end;
$$;

create index if not exists article_rankings_period_lookup_idx
  on public.article_rankings (period_type, period_key, status, total_score desc, article_id);
