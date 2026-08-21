create or replace function public.refresh_article_ranking_v2()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  d text;
  attachment_count integer;
  achievement numeric := 0;
  activity numeric := 0;
  initiative numeric := 0;
  evidence numeric := 0;
begin
  if new.status <> 'published' then
    delete from public.article_rankings
      where article_id = new.id and period_type = 'all_time' and period_key = 'all';
    return new;
  end if;

  d := lower(coalesce(new.description, ''));
  attachment_count := coalesce(jsonb_array_length(new.attachments), 0);

  achievement := least(60,
    (case when d ~ 'g.olib|sovrindor|mukofot|ko.krak nishon|1-o.rin|2-o.rin|3-o.rin|grand prix' then 12 else 0 end) +
    (case when d ~ 'xalqaro|international|turkiya|koreya|rossiya|qozog|xitoy|germaniya|fransiya|global' then 10 else 0 end) +
    (case when d ~ 'respublika|milliy|o.zbekiston miqyos' then 7 else 0 end) +
    (case when d ~ 'olimpiada|tanlov|musobaqa|finalist' then 8 else 0 end) +
    (case when d ~ 'maqola|jurnal|kitob|muallif|nashr|konferensiya' then 8 else 0 end) +
    (case when d ~ 'loyiha|startup|startap|tashabbus' then 7 else 0 end) +
    (case when d ~ 'grant|stipendiya' then 7 else 0 end) +
    (case when d ~ 'sertifikat|ielts|efset|diplom' then 4 else 0 end)
  );

  activity := least(20,
    (case when d ~ 'loyiha|startup|startap|tashabbus' then 6 else 0 end) +
    (case when d ~ 'volontyor|ko.ngilli' then 5 else 0 end) +
    (case when d ~ 'maqola|jurnal|kitob|konferensiya' then 4 else 0 end) +
    (case when d ~ 'tanlov|olimpiada|musobaqa|zakovat' then 3 else 0 end) +
    (case when d ~ 'faol|ishtirokchi' then 2 else 0 end)
  );

  initiative := least(15,
    (case when d ~ 'asoschi|rahbar|yetakchi|koordinator|mentor|menejer|direktor|tashkilotchi' then 10 else 0 end) +
    (case when d ~ 'tashabbus|jamoa|klub|tashkilot' then 5 else 0 end)
  );

  evidence := least(5,
    (case when attachment_count > 0 then least(4, 2 + attachment_count) else 0 end) +
    (case when new.source_url is not null and length(trim(new.source_url)) > 0 then 1 else 0 end)
  );

  insert into public.article_rankings (
    article_id, period_type, period_key,
    achievement_score, activity_score, leadership_score, evidence_score,
    achievements, ai_summary, ai_confidence, scoring_source, scoring_version,
    status, computed_at, approved_at, approved_by, updated_at
  ) values (
    new.id, 'all_time', 'all',
    achievement, activity, initiative, evidence,
    '[]'::jsonb,
    'Maqolaning qisqa tavsifi avtomatik tahlil qilinib, yutuqlar, faollik, tashabbuskorlik va tasdiqlovchi dalillar bo‘yicha dastlabki ball hisoblandi.',
    0.72, 'rules', 'v2-auto',
    'approved', now(), now(), null, now()
  )
  on conflict (article_id, period_type, period_key) do update set
    achievement_score = excluded.achievement_score,
    activity_score = excluded.activity_score,
    leadership_score = excluded.leadership_score,
    evidence_score = excluded.evidence_score,
    ai_summary = excluded.ai_summary,
    ai_confidence = excluded.ai_confidence,
    scoring_source = excluded.scoring_source,
    scoring_version = excluded.scoring_version,
    status = 'approved',
    computed_at = now(),
    approved_at = now(),
    approved_by = null,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists articles_refresh_ranking_v2 on public.articles;
create trigger articles_refresh_ranking_v2
after insert or update of status, description, attachments, source_url
on public.articles
for each row
execute function public.refresh_article_ranking_v2();
