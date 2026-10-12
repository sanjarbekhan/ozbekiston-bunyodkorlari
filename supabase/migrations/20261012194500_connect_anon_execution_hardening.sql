-- Hardening: Supabase can have explicit EXECUTE grants to anon in addition to PUBLIC.
-- Do not change or revoke unrelated application routines.
revoke all on function public.connect_start_thread(uuid,text,text) from public, anon;
revoke all on function public.connect_respond(uuid,boolean) from public, anon;
revoke all on function public.connect_send(uuid,text) from public, anon;
revoke all on function public.connect_mark_read(uuid) from public, anon;
revoke all on function public.connect_review_claim(uuid,boolean) from public, anon;
revoke all on function public.connect_review_report(uuid) from public, anon;
grant execute on function public.connect_start_thread(uuid,text,text) to authenticated;
grant execute on function public.connect_respond(uuid,boolean) to authenticated;
grant execute on function public.connect_send(uuid,text) to authenticated;
grant execute on function public.connect_mark_read(uuid) to authenticated;
grant execute on function public.connect_review_claim(uuid,boolean) to authenticated;
grant execute on function public.connect_review_report(uuid) to authenticated;

-- Keep per-account settings editable only by the actual owner (column grants).
revoke all on public.connect_threads, public.connect_messages from anon;
