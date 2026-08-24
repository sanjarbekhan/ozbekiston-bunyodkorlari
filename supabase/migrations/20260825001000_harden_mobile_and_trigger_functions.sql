-- Keep trigger-only functions out of the Data API.
revoke execute on function public.queue_article_ranking_for_bunyodkor_ai() from anon, authenticated;
revoke execute on function public.sync_periodic_rankings_from_all_time() from public, anon, authenticated;

-- Cover every mobile foreign key used for joins, moderation and cascade checks.
create index if not exists app_connections_requester_idx on public.app_connections(requester_id, status);
create index if not exists app_follows_following_idx on public.app_follows(following_id, created_at desc);
create index if not exists app_groups_owner_idx on public.app_groups(owner_id, created_at desc);
create index if not exists app_messages_sender_idx on public.app_messages(sender_id, created_at desc);
create index if not exists app_profile_claims_article_idx on public.app_profile_claims(article_id, status);
create index if not exists app_profile_claims_reviewed_by_idx on public.app_profile_claims(reviewed_by) where reviewed_by is not null;
create index if not exists app_referrals_inviter_idx on public.app_referrals(inviter_id, created_at desc);
create index if not exists app_submissions_reviewed_by_idx on public.app_submissions(reviewed_by) where reviewed_by is not null;
