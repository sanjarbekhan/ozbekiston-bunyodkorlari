-- Contact button is visible only for verified and adult profile owners opting in.
create or replace function public.connect_contact_available(p_article_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select exists (
  select 1 from public.connect_profiles cp
  join public.articles a on a.id=cp.verified_article_id
  where cp.verified_article_id=p_article_id
    and cp.chat_enabled=true and a.status='published'
    and public.connect_adult_user(cp.user_id)
 );
$$;
revoke all on function public.connect_contact_available(uuid) from public,anon,authenticated;
grant execute on function public.connect_contact_available(uuid) to anon,authenticated;
