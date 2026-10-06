create table if not exists public.nazun_matches (
  id text primary key,
  blue text[] not null default '{}',
  red text[] not null default '{}',
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

alter table public.nazun_matches enable row level security;
alter table public.nazun_match_comments enable row level security;
alter table public.nazun_tier_posts enable row level security;
alter table public.nazun_tier_comments enable row level security;
alter table public.nazun_match_comment_reactions enable row level security;
alter table public.nazun_tier_post_reactions enable row level security;
alter table public.nazun_tier_comment_reactions enable row level security;

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

alter table public.nazun_matches replica identity full;
alter table public.nazun_match_comments replica identity full;
alter table public.nazun_tier_posts replica identity full;
alter table public.nazun_tier_comments replica identity full;
alter table public.nazun_match_comment_reactions replica identity full;
alter table public.nazun_tier_post_reactions replica identity full;
alter table public.nazun_tier_comment_reactions replica identity full;

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
end $$;
