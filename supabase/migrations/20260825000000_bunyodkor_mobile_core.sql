-- Bunyodkor Mobile core schema. Additive: existing website tables stay untouched.

create table if not exists public.app_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  article_id uuid unique references public.articles(id) on delete set null,
  username text unique,
  full_name text not null default '',
  headline text,
  avatar_url text,
  region text,
  profession text,
  bio text,
  verification_status text not null default 'unverified' check (verification_status in ('unverified','pending','verified','rejected')),
  profile_visibility text not null default 'public' check (profile_visibility in ('public','members','private')),
  profile_completion smallint not null default 0 check (profile_completion between 0 and 100),
  points integer not null default 0 check (points >= 0),
  rating numeric(5,2) not null default 0 check (rating between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_profiles_username_format check (username is null or username ~ '^[a-z0-9_]{3,30}$')
);

create table if not exists public.app_profile_claims (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  article_id uuid not null references public.articles(id) on delete cascade,
  proof_path text,
  note text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (requester_id, article_id)
);

create table if not exists public.app_submissions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  content_type text not null check (content_type in ('Yutuq','Ijodiy ish','Loyiha','Maqola','Hayotiy voqea','Sertifikat')),
  title text not null check (char_length(title) between 3 and 180),
  description text not null default '',
  occurred_on date,
  visibility text not null default 'public' check (visibility in ('public','members','private')),
  status text not null default 'draft' check (status in ('draft','submitted','changes_requested','approved','rejected','archived')),
  evidence_paths text[] not null default '{}',
  moderation_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint app_follows_not_self check (follower_id <> following_id)
);

create table if not exists public.app_connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null default 'Hamkorlik' check (char_length(purpose) between 3 and 80),
  message text check (message is null or char_length(message) <= 500),
  status text not null default 'pending' check (status in ('pending','accepted','declined','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint app_connections_not_self check (requester_id <> recipient_id)
);

create unique index if not exists app_connections_pair_unique
  on public.app_connections (least(requester_id, recipient_id), greatest(requester_id, recipient_id));

create table if not exists public.app_groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null check (char_length(name) between 3 and 80),
  description text not null default '',
  cover_url text,
  category text,
  visibility text not null default 'public' check (visibility in ('public','private','invite_only')),
  is_official boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_group_members (
  group_id uuid not null references public.app_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('member','moderator','owner')),
  status text not null default 'active' check (status in ('pending','active','blocked')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.app_conversations (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid unique not null references public.app_connections(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.app_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.app_conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

create table if not exists public.app_point_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null check (amount <> 0),
  reason text not null check (char_length(reason) between 3 and 140),
  source_type text,
  source_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.app_referrals (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references auth.users(id) on delete cascade,
  invited_id uuid unique references auth.users(id) on delete cascade,
  code text not null unique,
  status text not null default 'opened' check (status in ('opened','registered','qualified','rewarded','rejected')),
  qualified_at timestamptz,
  rewarded_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.app_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null default '',
  data jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists app_submissions_owner_idx on public.app_submissions(owner_id, created_at desc);
create index if not exists app_submissions_public_idx on public.app_submissions(status, visibility, published_at desc);
create index if not exists app_connections_recipient_idx on public.app_connections(recipient_id, status);
create index if not exists app_group_members_user_idx on public.app_group_members(user_id, status);
create index if not exists app_messages_conversation_idx on public.app_messages(conversation_id, created_at desc);
create index if not exists app_point_transactions_user_idx on public.app_point_transactions(user_id, created_at desc);
create index if not exists app_notifications_user_idx on public.app_notifications(user_id, read_at, created_at desc);

alter table public.app_profiles enable row level security;
alter table public.app_profile_claims enable row level security;
alter table public.app_submissions enable row level security;
alter table public.app_follows enable row level security;
alter table public.app_connections enable row level security;
alter table public.app_groups enable row level security;
alter table public.app_group_members enable row level security;
alter table public.app_conversations enable row level security;
alter table public.app_messages enable row level security;
alter table public.app_point_transactions enable row level security;
alter table public.app_referrals enable row level security;
alter table public.app_notifications enable row level security;

revoke all on public.app_profiles, public.app_profile_claims, public.app_submissions,
  public.app_follows, public.app_connections, public.app_groups, public.app_group_members,
  public.app_conversations, public.app_messages, public.app_point_transactions,
  public.app_referrals, public.app_notifications from anon, authenticated;

grant select on public.app_profiles, public.app_submissions, public.app_groups, public.app_group_members to anon;
grant select, insert on public.app_profiles, public.app_profile_claims, public.app_submissions,
  public.app_follows, public.app_connections, public.app_groups, public.app_group_members,
  public.app_conversations, public.app_messages, public.app_referrals to authenticated;
grant update (username, full_name, headline, avatar_url, region, profession, bio, profile_visibility, updated_at)
  on public.app_profiles to authenticated;
grant update (proof_path, note) on public.app_profile_claims to authenticated;
grant update (content_type, title, description, occurred_on, visibility, status, evidence_paths, updated_at)
  on public.app_submissions to authenticated;
grant update (name, description, cover_url, category, visibility, updated_at) on public.app_groups to authenticated;
grant update (body, edited_at, deleted_at) on public.app_messages to authenticated;
grant select on public.app_point_transactions, public.app_notifications to authenticated;
grant update (read_at) on public.app_notifications to authenticated;
grant delete on public.app_follows, public.app_group_members to authenticated;

create policy "public reads visible profiles" on public.app_profiles for select to anon, authenticated
  using (profile_visibility = 'public' or id = (select auth.uid()));
create policy "users create own profile" on public.app_profiles for insert to authenticated
  with check (id = (select auth.uid()) and article_id is null and verification_status = 'unverified' and points = 0 and rating = 0);
create policy "users update own profile" on public.app_profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "users read own claims" on public.app_profile_claims for select to authenticated using (requester_id = (select auth.uid()));
create policy "users create own claims" on public.app_profile_claims for insert to authenticated with check (requester_id = (select auth.uid()) and status = 'pending');
create policy "users update pending claims" on public.app_profile_claims for update to authenticated using (requester_id = (select auth.uid()) and status = 'pending') with check (requester_id = (select auth.uid()) and status = 'pending');

create policy "public reads approved submissions" on public.app_submissions for select to anon, authenticated using ((status = 'approved' and visibility = 'public') or owner_id = (select auth.uid()));
create policy "users create own drafts" on public.app_submissions for insert to authenticated with check (owner_id = (select auth.uid()) and status = 'draft');
create policy "users update editable submissions" on public.app_submissions for update to authenticated using (owner_id = (select auth.uid()) and status in ('draft','changes_requested')) with check (owner_id = (select auth.uid()) and status in ('draft','submitted'));

create policy "users read follows" on public.app_follows for select to authenticated using (follower_id = (select auth.uid()) or following_id = (select auth.uid()));
create policy "users follow as self" on public.app_follows for insert to authenticated with check (follower_id = (select auth.uid()));
create policy "users unfollow as self" on public.app_follows for delete to authenticated using (follower_id = (select auth.uid()));

create policy "participants read connections" on public.app_connections for select to authenticated using (requester_id = (select auth.uid()) or recipient_id = (select auth.uid()));
create policy "users request as self" on public.app_connections for insert to authenticated with check (requester_id = (select auth.uid()) and status = 'pending');

create policy "public reads public groups" on public.app_groups for select to anon, authenticated using (visibility = 'public' or owner_id = (select auth.uid()));
create policy "users create groups" on public.app_groups for insert to authenticated with check (owner_id = (select auth.uid()) and is_official = false);
create policy "owners update groups" on public.app_groups for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "public reads public group members" on public.app_group_members for select to anon, authenticated using (exists (select 1 from public.app_groups g where g.id = group_id and g.visibility = 'public') or user_id = (select auth.uid()));
create policy "users join as self" on public.app_group_members for insert to authenticated with check (user_id = (select auth.uid()) and role = 'member');
create policy "users leave as self" on public.app_group_members for delete to authenticated using (user_id = (select auth.uid()) and role = 'member');

create policy "participants read conversations" on public.app_conversations for select to authenticated using (exists (select 1 from public.app_connections c where c.id = connection_id and c.status = 'accepted' and ((select auth.uid()) in (c.requester_id, c.recipient_id))));
create policy "participants create accepted conversation" on public.app_conversations for insert to authenticated with check (exists (select 1 from public.app_connections c where c.id = connection_id and c.status = 'accepted' and ((select auth.uid()) in (c.requester_id, c.recipient_id))));
create policy "participants read messages" on public.app_messages for select to authenticated using (exists (select 1 from public.app_conversations v join public.app_connections c on c.id = v.connection_id where v.id = conversation_id and c.status = 'accepted' and ((select auth.uid()) in (c.requester_id, c.recipient_id))));
create policy "participants send as self" on public.app_messages for insert to authenticated with check (sender_id = (select auth.uid()) and exists (select 1 from public.app_conversations v join public.app_connections c on c.id = v.connection_id where v.id = conversation_id and c.status = 'accepted' and ((select auth.uid()) in (c.requester_id, c.recipient_id))));
create policy "senders edit own messages" on public.app_messages for update to authenticated using (sender_id = (select auth.uid())) with check (sender_id = (select auth.uid()));

create policy "users read own points" on public.app_point_transactions for select to authenticated using (user_id = (select auth.uid()));
create policy "users read own referrals" on public.app_referrals for select to authenticated using (inviter_id = (select auth.uid()) or invited_id = (select auth.uid()));
create policy "users create own referral" on public.app_referrals for insert to authenticated with check (inviter_id = (select auth.uid()) and invited_id is null and status = 'opened');
create policy "users read own notifications" on public.app_notifications for select to authenticated using (user_id = (select auth.uid()));
create policy "users mark own notifications read" on public.app_notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Private proof bucket. Public media continues to use the existing article-media bucket.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('app-evidence', 'app-evidence', false, 10485760, array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict (id) do nothing;

create policy "users upload own evidence" on storage.objects for insert to authenticated
  with check (bucket_id = 'app-evidence' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "users read own evidence" on storage.objects for select to authenticated
  using (bucket_id = 'app-evidence' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "users update own evidence" on storage.objects for update to authenticated
  using (bucket_id = 'app-evidence' and owner_id = (select auth.uid())::text)
  with check (bucket_id = 'app-evidence' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "users delete own evidence" on storage.objects for delete to authenticated
  using (bucket_id = 'app-evidence' and owner_id = (select auth.uid())::text);
