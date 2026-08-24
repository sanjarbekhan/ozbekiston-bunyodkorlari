-- From this point forward, article changes are queued for Bunyodkor AI.
-- The old keyword/rule trigger is intentionally disabled so it cannot overwrite AI scores.
drop trigger if exists articles_refresh_ranking_v2 on public.articles;

create or replace function public.queue_article_ranking_for_bunyodkor_ai()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status <> 'published' then
    delete from public.article_rankings
    where article_id = new.id;
    return new;
  end if;

  insert into public.article_rankings (
    article_id,
    period_type,
    period_key,
    achievement_score,
    activity_score,
    leadership_score,
    evidence_score,
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
    new.id,
    'all_time',
    'all',
    0,
    0,
    0,
    0,
    '[]'::jsonb,
    'Bunyodkor AI biografiyani tahlil qilish navbatiga oldi.',
    null,
    'ai',
    'v3-bunyodkor-ai-pending',
    'pending',
    now(),
    null,
    null,
    now()
  )
  on conflict (article_id, period_type, period_key) do update set
    ai_summary = 'Bunyodkor AI biografiyani qayta tahlil qilish navbatiga oldi.',
    ai_confidence = null,
    scoring_source = 'ai',
    scoring_version = 'v3-bunyodkor-ai-pending',
    status = 'pending',
    approved_at = null,
    approved_by = null,
    updated_at = now();

  return new;
end;
$$;

revoke all on function public.queue_article_ranking_for_bunyodkor_ai() from public;

-- Recalculate only when ranking-relevant biography content changes.
drop trigger if exists articles_queue_bunyodkor_ai_ranking on public.articles;
create trigger articles_queue_bunyodkor_ai_ranking
after insert or update of status, description, content, content_blocks, attachments, source_url
on public.articles
for each row
execute function public.queue_article_ranking_for_bunyodkor_ai();
