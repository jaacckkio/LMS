-- Last Man Standing — Supabase PostgreSQL Schema
-- Run in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ─── USERS ─────────────────────────────────────────────────────────────────
create table users (
  id            uuid primary key default gen_random_uuid(),
  firebase_uid  text unique not null,
  username      text not null,
  avatar_url    text,
  push_token    text,
  longest_streak int not null default 0,
  created_at    timestamptz not null default now()
);

-- ─── GAMEWEEKS ─────────────────────────────────────────────────────────────
create table gameweeks (
  id        uuid primary key default gen_random_uuid(),
  number    int not null unique,
  deadline  timestamptz not null,  -- first kickoff = lock time
  status    text not null default 'upcoming'  -- upcoming | active | completed
    check (status in ('upcoming', 'active', 'completed'))
);

-- ─── FIXTURES ──────────────────────────────────────────────────────────────
create table fixtures (
  id            uuid primary key default gen_random_uuid(),
  gameweek_id   uuid not null references gameweeks(id),
  home_team_id  text not null,  -- 3-char team code e.g. 'LIV'
  away_team_id  text not null,
  kickoff       timestamptz not null,
  status        text not null default 'scheduled'
    check (status in ('scheduled', 'in_play', 'finished')),
  home_score    int,
  away_score    int
);

create index fixtures_gameweek_idx on fixtures(gameweek_id);

-- ─── RESULTS ───────────────────────────────────────────────────────────────
-- Derived from fixtures; tracks win/draw/loss per team per gameweek
create table results (
  id            uuid primary key default gen_random_uuid(),
  gameweek_id   uuid not null references gameweeks(id),
  team_id       text not null,
  outcome       text not null  -- 'win' | 'draw' | 'loss'
    check (outcome in ('win', 'draw', 'loss')),
  unique(gameweek_id, team_id)
);

-- ─── LEAGUES ───────────────────────────────────────────────────────────────
create table leagues (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  join_code   text unique not null,
  created_by  uuid not null references users(id),
  is_global   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Seed Global Pool
insert into leagues (name, join_code, created_by, is_global)
  select 'Global Pool', 'GLOBAL', id, true from users limit 1;
-- (Re-run after first user exists, or use a system user)

-- ─── LEAGUE MEMBERS ────────────────────────────────────────────────────────
create table league_members (
  id              uuid primary key default gen_random_uuid(),
  league_id       uuid not null references leagues(id) on delete cascade,
  user_id         uuid not null references users(id) on delete cascade,
  status          text not null default 'alive'
    check (status in ('alive', 'eliminated')),
  eliminated_week int,  -- gameweek number when eliminated
  current_streak  int not null default 0,
  longest_streak  int not null default 0,
  joined_at       timestamptz not null default now(),
  unique(league_id, user_id)
);

create index lm_league_idx on league_members(league_id);
create index lm_user_idx on league_members(user_id);

-- ─── PICKS ─────────────────────────────────────────────────────────────────
create table picks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id),
  league_id       uuid not null references leagues(id),
  gameweek_id     uuid not null references gameweeks(id),
  team_id         text not null,
  locked_at       timestamptz not null default now(),
  result          text  -- null until processed: 'survived' | 'eliminated'
    check (result is null or result in ('survived', 'eliminated')),
  unique(user_id, league_id, gameweek_id)  -- one pick per user per league per week
);

create index picks_user_idx on picks(user_id);
create index picks_league_idx on picks(league_id);
create index picks_gameweek_idx on picks(gameweek_id);

-- ─── RLS POLICIES ──────────────────────────────────────────────────────────
alter table users enable row level security;
alter table picks enable row level security;
alter table league_members enable row level security;
alter table leagues enable row level security;

-- Users can read all users (for league member lists), write only their own
create policy "users_read_all" on users for select using (true);
create policy "users_write_own" on users for all using (firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub');

-- Picks: visible to league members; insert/update own picks only
create policy "picks_read_league" on picks for select
  using (
    exists (
      select 1 from league_members lm
      where lm.league_id = picks.league_id
        and lm.user_id = (select id from users where firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub')
    )
  );

create policy "picks_insert_own" on picks for insert
  with check (
    user_id = (select id from users where firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub')
  );

-- Leagues: public read, member-only for private leagues
create policy "leagues_read_all" on leagues for select using (true);

-- League members: read members of your leagues
create policy "lm_read_own_leagues" on league_members for select
  using (
    exists (
      select 1 from league_members me
      where me.league_id = league_members.league_id
        and me.user_id = (select id from users where firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub')
    )
  );

-- ─── BUSINESS LOGIC FUNCTIONS ──────────────────────────────────────────────

-- Process results for a completed gameweek: mark survivors/eliminated + update streaks
create or replace function process_gameweek_results(p_gameweek_id uuid)
returns void language plpgsql as $$
declare
  v_gameweek_number int;
begin
  select number into v_gameweek_number from gameweeks where id = p_gameweek_id;

  -- Mark picks as survived/eliminated based on team outcome
  update picks p
  set result = case
    when r.outcome = 'win' then 'survived'
    else 'eliminated'
  end
  from results r
  where p.gameweek_id = p_gameweek_id
    and r.gameweek_id = p_gameweek_id
    and r.team_id = p.team_id
    and p.result is null;

  -- Eliminate league_members where their pick was eliminated
  update league_members lm
  set
    status = 'eliminated',
    eliminated_week = v_gameweek_number,
    current_streak = 0
  from picks p
  where lm.league_id = p.league_id
    and lm.user_id = p.user_id
    and p.gameweek_id = p_gameweek_id
    and p.result = 'eliminated'
    and lm.status = 'alive';

  -- Increment streak for survivors
  update league_members lm
  set
    current_streak = current_streak + 1,
    longest_streak = greatest(longest_streak, current_streak + 1)
  from picks p
  where lm.league_id = p.league_id
    and lm.user_id = p.user_id
    and p.gameweek_id = p_gameweek_id
    and p.result = 'survived'
    and lm.status = 'alive';

  -- Mark gameweek completed
  update gameweeks set status = 'completed' where id = p_gameweek_id;
end;
$$;

-- Validate pick: can't reuse a team within the same league/pool across all gameweeks
create or replace function validate_pick(
  p_user_id uuid, p_league_id uuid, p_team_id text
) returns boolean language plpgsql as $$
begin
  return not exists (
    select 1 from picks
    where user_id = p_user_id
      and league_id = p_league_id
      and team_id = p_team_id
  );
end;
$$;
