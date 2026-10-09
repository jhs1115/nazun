create table if not exists public.nazun_matches (
  id text primary key,
  blue text[] not null default '{}',
  red text[] not null default '{}',
  blue_picks text[] not null default '{}',
  red_picks text[] not null default '{}',
  blue_bans text[] not null default '{}',
  red_bans text[] not null default '{}',
  damage_mvp text not null default '',
  winner text not null check (winner in ('blue', 'red')),
  memo text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.nazun_match_comments (
  id text primary key,
  match_id text not null references public.nazun_matches(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author text not null default '익명',
  message text not null check (char_length(message) between 1 and 160),
  created_at timestamptz not null default now()
);

create table if not exists public.nazun_tier_posts (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  author text not null default '익명',
  note text not null default '',
  placements jsonb not null default '{}'::jsonb,
  stats jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.nazun_tier_comments (
  id text primary key,
  post_id text not null references public.nazun_tier_posts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  author text not null default '익명',
  message text not null check (char_length(message) between 1 and 160),
  created_at timestamptz not null default now()
);

create table if not exists public.nazun_match_comment_reactions (
  comment_id text not null references public.nazun_match_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null check (reaction in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create table if not exists public.nazun_tier_post_reactions (
  post_id text not null references public.nazun_tier_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null check (reaction in ('agree', 'hmm', 'disagree')),
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.nazun_tier_comment_reactions (
  comment_id text not null references public.nazun_tier_comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction text not null check (reaction in ('like', 'dislike')),
  created_at timestamptz not null default now(),
  primary key (comment_id, user_id)
);

create table if not exists public.nazun_user_points (
  user_id uuid primary key references auth.users(id) on delete cascade,
  points integer not null default 0 check (points >= 0),
  redeemed_codes text[] not null default array[]::text[],
  owned_titles text[] not null default array[]::text[],
  equipped_title text not null default '',
  items jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.nazun_match_point_mails (
  id text primary key,
  match_id text not null references public.nazun_matches(id) on delete cascade,
  player_name text not null,
  result text not null check (result in ('win', 'loss')),
  amount integer not null check (amount > 0),
  claimed_by uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.nazun_user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null default '',
  tier text not null default '아이언',
  lane text not null default '상관없음',
  equipped_title text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nazun_title_mails (
  id text primary key,
  player_name text not null,
  champion text not null,
  title_id text not null,
  title_name text not null,
  claimed_by uuid references auth.users(id) on delete set null,
  claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.nazun_inquiries (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  author text not null default '익명',
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.nazun_prediction_state (
  id text primary key default 'current',
  active boolean not null default false,
  locked boolean not null default false,
  max_points integer not null default 0,
  winner text not null default '',
  round_id text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.nazun_prediction_bets (
  id text primary key,
  round_id text not null,
  user_id uuid references auth.users(id) on delete cascade,
  author text not null default '익명',
  team text not null check (team in ('blue', 'red')),
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now()
);

alter table public.nazun_matches add column if not exists blue_picks text[] not null default '{}';
alter table public.nazun_matches add column if not exists red_picks text[] not null default '{}';
alter table public.nazun_matches add column if not exists blue_bans text[] not null default '{}';
alter table public.nazun_matches add column if not exists red_bans text[] not null default '{}';
alter table public.nazun_matches add column if not exists damage_mvp text not null default '';
alter table public.nazun_user_profiles add column if not exists equipped_title text not null default '';

alter table public.nazun_user_points
add column if not exists owned_titles text[] not null default array[]::text[];

alter table public.nazun_user_points
add column if not exists equipped_title text not null default '';

alter table public.nazun_user_points
add column if not exists items jsonb not null default '{}'::jsonb;

create index if not exists nazun_matches_created_at_idx
on public.nazun_matches(created_at desc);

create index if not exists nazun_match_comments_match_created_idx
on public.nazun_match_comments(match_id, created_at asc);

create index if not exists nazun_tier_posts_created_at_idx
on public.nazun_tier_posts(created_at desc);

create index if not exists nazun_tier_comments_post_created_idx
on public.nazun_tier_comments(post_id, created_at asc);

create index if not exists nazun_match_comment_reactions_comment_idx
on public.nazun_match_comment_reactions(comment_id);

create index if not exists nazun_tier_post_reactions_post_idx
on public.nazun_tier_post_reactions(post_id);

create index if not exists nazun_tier_comment_reactions_comment_idx
on public.nazun_tier_comment_reactions(comment_id);

create index if not exists nazun_match_point_mails_player_claimed_idx
on public.nazun_match_point_mails(player_name, claimed_at);

create index if not exists nazun_user_profiles_nickname_idx
on public.nazun_user_profiles(nickname);

alter table public.nazun_matches enable row level security;
alter table public.nazun_match_comments enable row level security;
alter table public.nazun_tier_posts enable row level security;
alter table public.nazun_tier_comments enable row level security;
alter table public.nazun_match_comment_reactions enable row level security;
alter table public.nazun_tier_post_reactions enable row level security;
alter table public.nazun_tier_comment_reactions enable row level security;
alter table public.nazun_user_points enable row level security;
alter table public.nazun_match_point_mails enable row level security;
alter table public.nazun_user_profiles enable row level security;
alter table public.nazun_title_mails enable row level security;
alter table public.nazun_inquiries enable row level security;
alter table public.nazun_prediction_state enable row level security;
alter table public.nazun_prediction_bets enable row level security;

drop policy if exists "nazun matches visible" on public.nazun_matches;
create policy "nazun matches visible"
on public.nazun_matches for select
to anon, authenticated
using (true);

drop policy if exists "nazun matches writable by logged in users" on public.nazun_matches;
create policy "nazun matches writable by logged in users"
on public.nazun_matches for insert
to authenticated
with check (true);

drop policy if exists "nazun matches updatable by logged in users" on public.nazun_matches;
create policy "nazun matches updatable by logged in users"
on public.nazun_matches for update
to authenticated
using (true)
with check (true);

drop policy if exists "nazun matches deletable by logged in users" on public.nazun_matches;
create policy "nazun matches deletable by logged in users"
on public.nazun_matches for delete
to authenticated
using (true);

drop policy if exists "nazun comments visible" on public.nazun_match_comments;
create policy "nazun comments visible"
on public.nazun_match_comments for select
to anon, authenticated
using (true);

drop policy if exists "nazun comments writable by logged in users" on public.nazun_match_comments;
create policy "nazun comments writable by logged in users"
on public.nazun_match_comments for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "nazun comments deletable by logged in users" on public.nazun_match_comments;
create policy "nazun comments deletable by logged in users"
on public.nazun_match_comments for delete
to authenticated
using (true);

drop policy if exists "nazun tier posts visible" on public.nazun_tier_posts;
create policy "nazun tier posts visible"
on public.nazun_tier_posts for select
to anon, authenticated
using (true);

drop policy if exists "nazun tier posts writable by logged in users" on public.nazun_tier_posts;
create policy "nazun tier posts writable by logged in users"
on public.nazun_tier_posts for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "nazun tier posts deletable by logged in users" on public.nazun_tier_posts;
create policy "nazun tier posts deletable by logged in users"
on public.nazun_tier_posts for delete
to authenticated
using (true);

drop policy if exists "nazun tier comments visible" on public.nazun_tier_comments;
create policy "nazun tier comments visible"
on public.nazun_tier_comments for select
to anon, authenticated
using (true);

drop policy if exists "nazun tier comments writable by logged in users" on public.nazun_tier_comments;
create policy "nazun tier comments writable by logged in users"
on public.nazun_tier_comments for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "nazun tier comments deletable by logged in users" on public.nazun_tier_comments;
create policy "nazun tier comments deletable by logged in users"
on public.nazun_tier_comments for delete
to authenticated
using (true);

drop policy if exists "nazun match comment reactions visible" on public.nazun_match_comment_reactions;
create policy "nazun match comment reactions visible"
on public.nazun_match_comment_reactions for select
to anon, authenticated
using (true);

drop policy if exists "nazun match comment reactions writable by owner" on public.nazun_match_comment_reactions;
create policy "nazun match comment reactions writable by owner"
on public.nazun_match_comment_reactions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "nazun match comment reactions updatable by owner" on public.nazun_match_comment_reactions;
create policy "nazun match comment reactions updatable by owner"
on public.nazun_match_comment_reactions for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "nazun match comment reactions deletable by owner" on public.nazun_match_comment_reactions;
create policy "nazun match comment reactions deletable by owner"
on public.nazun_match_comment_reactions for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "nazun tier post reactions visible" on public.nazun_tier_post_reactions;
create policy "nazun tier post reactions visible"
on public.nazun_tier_post_reactions for select
to anon, authenticated
using (true);

drop policy if exists "nazun tier post reactions writable by owner" on public.nazun_tier_post_reactions;
create policy "nazun tier post reactions writable by owner"
on public.nazun_tier_post_reactions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "nazun tier post reactions updatable by owner" on public.nazun_tier_post_reactions;
create policy "nazun tier post reactions updatable by owner"
on public.nazun_tier_post_reactions for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "nazun tier post reactions deletable by owner" on public.nazun_tier_post_reactions;
create policy "nazun tier post reactions deletable by owner"
on public.nazun_tier_post_reactions for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "nazun tier comment reactions visible" on public.nazun_tier_comment_reactions;
create policy "nazun tier comment reactions visible"
on public.nazun_tier_comment_reactions for select
to anon, authenticated
using (true);

drop policy if exists "nazun tier comment reactions writable by owner" on public.nazun_tier_comment_reactions;
create policy "nazun tier comment reactions writable by owner"
on public.nazun_tier_comment_reactions for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "nazun tier comment reactions updatable by owner" on public.nazun_tier_comment_reactions;
create policy "nazun tier comment reactions updatable by owner"
on public.nazun_tier_comment_reactions for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "nazun tier comment reactions deletable by owner" on public.nazun_tier_comment_reactions;
create policy "nazun tier comment reactions deletable by owner"
on public.nazun_tier_comment_reactions for delete
to authenticated
using (auth.uid() = user_id);

drop policy if exists "nazun user points visible by owner" on public.nazun_user_points;
create policy "nazun user points visible by owner"
on public.nazun_user_points for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "nazun user points writable by owner" on public.nazun_user_points;
create policy "nazun user points writable by owner"
on public.nazun_user_points for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "nazun user points updatable by owner" on public.nazun_user_points;
create policy "nazun user points updatable by owner"
on public.nazun_user_points for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "nazun match point mails visible" on public.nazun_match_point_mails;
create policy "nazun match point mails visible"
on public.nazun_match_point_mails for select
to anon, authenticated
using (true);

drop policy if exists "nazun match point mails writable by logged in users" on public.nazun_match_point_mails;
create policy "nazun match point mails writable by logged in users"
on public.nazun_match_point_mails for insert
to authenticated
with check (true);

drop policy if exists "nazun match point mails claimable by logged in users" on public.nazun_match_point_mails;
create policy "nazun match point mails claimable by logged in users"
on public.nazun_match_point_mails for update
to authenticated
using (claimed_by is null or auth.uid() = claimed_by)
with check (auth.uid() = claimed_by);

drop policy if exists "nazun user profiles visible" on public.nazun_user_profiles;
create policy "nazun user profiles visible"
on public.nazun_user_profiles for select
to anon, authenticated
using (true);

drop policy if exists "nazun user profiles writable by owner" on public.nazun_user_profiles;
create policy "nazun user profiles writable by owner"
on public.nazun_user_profiles for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "nazun user profiles updatable by logged in users" on public.nazun_user_profiles;
create policy "nazun user profiles updatable by logged in users"
on public.nazun_user_profiles for update
to authenticated
using (true)
with check (true);

drop policy if exists "nazun user profiles deletable by logged in users" on public.nazun_user_profiles;
create policy "nazun user profiles deletable by logged in users"
on public.nazun_user_profiles for delete
to authenticated
using (true);

drop policy if exists "nazun title mails visible" on public.nazun_title_mails;
create policy "nazun title mails visible"
on public.nazun_title_mails for select
to anon, authenticated
using (true);

drop policy if exists "nazun title mails writable by logged in users" on public.nazun_title_mails;
create policy "nazun title mails writable by logged in users"
on public.nazun_title_mails for insert
to authenticated
with check (true);

drop policy if exists "nazun title mails claimable by logged in users" on public.nazun_title_mails;
create policy "nazun title mails claimable by logged in users"
on public.nazun_title_mails for update
to authenticated
using (claimed_by is null or auth.uid() = claimed_by)
with check (auth.uid() = claimed_by);

drop policy if exists "nazun inquiries visible" on public.nazun_inquiries;
create policy "nazun inquiries visible"
on public.nazun_inquiries for select
to anon, authenticated
using (true);

drop policy if exists "nazun inquiries writable by logged in users" on public.nazun_inquiries;
create policy "nazun inquiries writable by logged in users"
on public.nazun_inquiries for insert
to authenticated
with check (true);

drop policy if exists "nazun inquiries deletable by logged in users" on public.nazun_inquiries;
create policy "nazun inquiries deletable by logged in users"
on public.nazun_inquiries for delete
to authenticated
using (true);

drop policy if exists "nazun prediction state visible" on public.nazun_prediction_state;
create policy "nazun prediction state visible"
on public.nazun_prediction_state for select
to anon, authenticated
using (true);

drop policy if exists "nazun prediction state writable" on public.nazun_prediction_state;
create policy "nazun prediction state writable"
on public.nazun_prediction_state for all
to authenticated
using (true)
with check (true);

drop policy if exists "nazun prediction bets visible" on public.nazun_prediction_bets;
create policy "nazun prediction bets visible"
on public.nazun_prediction_bets for select
to anon, authenticated
using (true);

drop policy if exists "nazun prediction bets writable" on public.nazun_prediction_bets;
create policy "nazun prediction bets writable"
on public.nazun_prediction_bets for all
to authenticated
using (true)
with check (true);

alter table public.nazun_matches replica identity full;
alter table public.nazun_match_comments replica identity full;
alter table public.nazun_tier_posts replica identity full;
alter table public.nazun_tier_comments replica identity full;
alter table public.nazun_match_comment_reactions replica identity full;
alter table public.nazun_tier_post_reactions replica identity full;
alter table public.nazun_tier_comment_reactions replica identity full;
alter table public.nazun_user_points replica identity full;
alter table public.nazun_match_point_mails replica identity full;
alter table public.nazun_user_profiles replica identity full;
alter table public.nazun_title_mails replica identity full;
alter table public.nazun_inquiries replica identity full;
alter table public.nazun_prediction_state replica identity full;
alter table public.nazun_prediction_bets replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'nazun_matches'
  ) then
    alter publication supabase_realtime add table public.nazun_matches;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'nazun_match_comments'
  ) then
    alter publication supabase_realtime add table public.nazun_match_comments;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'nazun_tier_posts'
  ) then
    alter publication supabase_realtime add table public.nazun_tier_posts;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'nazun_tier_comments'
  ) then
    alter publication supabase_realtime add table public.nazun_tier_comments;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'nazun_match_comment_reactions'
  ) then
    alter publication supabase_realtime add table public.nazun_match_comment_reactions;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'nazun_tier_post_reactions'
  ) then
    alter publication supabase_realtime add table public.nazun_tier_post_reactions;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'nazun_tier_comment_reactions'
  ) then
    alter publication supabase_realtime add table public.nazun_tier_comment_reactions;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'nazun_user_profiles'
  ) then
    alter publication supabase_realtime add table public.nazun_user_profiles;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'nazun_title_mails'
  ) then
    alter publication supabase_realtime add table public.nazun_title_mails;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'nazun_inquiries'
  ) then
    alter publication supabase_realtime add table public.nazun_inquiries;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'nazun_prediction_state'
  ) then
    alter publication supabase_realtime add table public.nazun_prediction_state;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'nazun_prediction_bets'
  ) then
    alter publication supabase_realtime add table public.nazun_prediction_bets;
  end if;
end $$;
