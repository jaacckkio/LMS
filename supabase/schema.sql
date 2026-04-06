-- Last Man Standing — Supabase Schema
-- Competition-agnostic. Supports League, World Cup, Euros, Copa America.
-- Run in Supabase SQL editor.
-- Safe to re-run: drops everything first then recreates.

create extension if not exists "pgcrypto";

-- ─── TEARDOWN (reverse dependency order) ──────────────────────────────────────
drop function if exists migrate_guest_to_user(text, uuid);
drop function if exists validate_pick(uuid, text, uuid, text, int);
drop function if exists process_round_results(uuid, jsonb, boolean);
drop table if exists picks          cascade;
drop table if exists league_members cascade;
drop table if exists leagues        cascade;
drop table if exists rounds         cascade;
drop table if exists competitions   cascade;
drop table if exists users          cascade;

-- ─── USERS ────────────────────────────────────────────────────────────────────
create table users (
  id                          uuid primary key default gen_random_uuid(),
  firebase_uid                text unique not null,
  display_name                text not null,
  avatar_url                  text,
  migrated_from_guest_device  text,  -- device_id that was migrated on signup
  push_token                  text,
  created_at                  timestamptz not null default now()
);

-- ─── COMPETITIONS ──────────────────────────────────────────────────────────────
-- competition_type: LEAGUE | WORLD_CUP | EUROS | COPA_AMERICA | CHAMPIONS_LEAGUE
-- reset_schedule: JSONB array of { afterPhase, beforePhase }
create table competitions (
  id               text primary key,  -- 'PL', 'WC2026', 'CL', etc.
  name             text not null,
  api_id           int not null,       -- football-data.org competition ID
  competition_type text not null,
  season           text not null,      -- '2025/26'
  status           text not null default 'UPCOMING',  -- UPCOMING | ACTIVE | COMPLETED
  current_round    int,
  reset_schedule   jsonb not null default '[]',
  created_at       timestamptz not null default now(),
  check (status in ('UPCOMING', 'ACTIVE', 'COMPLETED'))
);

-- ─── ROUNDS ───────────────────────────────────────────────────────────────────
-- One round = one matchday or knockout stage
create table rounds (
  id              uuid primary key default gen_random_uuid(),
  competition_id  text not null references competitions(id),
  round_number    int not null,
  phase           text not null,       -- GROUP_STAGE | LAST_16 | QUARTER_FINALS | SEMI_FINALS | FINAL | REGULAR_SEASON
  name            text not null,       -- "Matchday 12", "Quarter-Finals"
  deadline_at     timestamptz not null, -- first kickoff = lock time
  status          text not null default 'OPEN',
  check (status in ('OPEN', 'LOCKED', 'COMPLETE')),
  unique (competition_id, round_number)
);

create index rounds_competition_idx on rounds(competition_id);

-- ─── LEAGUES ──────────────────────────────────────────────────────────────────
create table leagues (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  competition_id  text not null references competitions(id),
  league_type     text not null default 'PRIVATE',  -- PRIVATE | GLOBAL
  invite_code     text unique,
  created_by      uuid references users(id),
  created_at      timestamptz not null default now(),
  check (league_type in ('PRIVATE', 'GLOBAL'))
);

-- One global league per competition (auto-created)
create unique index one_global_per_competition
  on leagues (competition_id)
  where league_type = 'GLOBAL';

-- ─── LEAGUE MEMBERS ───────────────────────────────────────────────────────────
create table league_members (
  id                uuid primary key default gen_random_uuid(),
  league_id         uuid not null references leagues(id) on delete cascade,
  user_id           uuid references users(id),           -- null for guests
  device_id         text,                                 -- guest device fingerprint
  status            text not null default 'ALIVE',
  eliminated_round  int,
  rounds_survived   int not null default 0,
  joined_at         timestamptz not null default now(),
  check (status in ('ALIVE', 'ELIMINATED')),
  check (user_id is not null or device_id is not null),  -- must have one
  unique (league_id, user_id),
  unique (league_id, device_id)
);

create index lm_league_idx on league_members(league_id);
create index lm_user_idx   on league_members(user_id);

-- ─── PICKS ────────────────────────────────────────────────────────────────────
-- One pick per user per league per round.
-- team_id = TLA code (e.g. 'LIV', 'MCI'). No FK — teams come from API.
create table picks (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references users(id),   -- null for guests
  device_id       text,                         -- guest device fingerprint
  league_id       uuid not null references leagues(id),
  competition_id  text not null references competitions(id),
  round_id        uuid not null references rounds(id),
  team_id         text not null,               -- TLA e.g. 'LIV'
  locked_at       timestamptz not null default now(),
  result          text,                         -- WIN | LOSS | DRAW | null=pending
  check (result is null or result in ('WIN', 'LOSS', 'DRAW')),
  check (user_id is not null or device_id is not null),
  unique (league_id, user_id, round_id),
  unique (league_id, device_id, round_id)
);

create index picks_user_idx        on picks(user_id);
create index picks_league_idx      on picks(league_id);
create index picks_round_idx       on picks(round_id);
create index picks_competition_idx on picks(competition_id);

-- ─── RLS ──────────────────────────────────────────────────────────────────────
alter table users          enable row level security;
alter table competitions   enable row level security;
alter table rounds         enable row level security;
alter table leagues        enable row level security;
alter table league_members enable row level security;
alter table picks          enable row level security;

-- Public read on competitions, rounds, leagues
create policy "competitions_public_read"  on competitions  for select using (true);
create policy "rounds_public_read"        on rounds        for select using (true);
create policy "leagues_public_read"       on leagues       for select using (true);

-- Users: read all, write own
create policy "users_read_all"  on users for select using (true);
create policy "users_write_own" on users for all
  using (firebase_uid = (current_setting('request.jwt.claims', true)::json->>'sub'));

-- Picks: visible only within the same league after the round is COMPLETE (hidden until deadline)
-- On insert/update: must be own pick
create policy "picks_read_post_deadline" on picks for select
  using (
    exists (
      select 1 from rounds r
      where r.id = picks.round_id
        and r.status = 'COMPLETE'
    )
    or
    -- Own picks always visible
    picks.user_id = (
      select id from users
      where firebase_uid = (current_setting('request.jwt.claims', true)::json->>'sub')
    )
  );

create policy "picks_insert_own" on picks for insert
  with check (
    user_id = (
      select id from users
      where firebase_uid = (current_setting('request.jwt.claims', true)::json->>'sub')
    )
  );

create policy "lm_read_own_leagues" on league_members for select
  using (
    exists (
      select 1 from league_members me
      where me.league_id = league_members.league_id
        and me.user_id = (
          select id from users
          where firebase_uid = (current_setting('request.jwt.claims', true)::json->>'sub')
        )
    )
    or
    exists (select 1 from leagues l where l.id = league_members.league_id and l.league_type = 'GLOBAL')
  );

-- ─── PROCESS ROUND RESULTS ────────────────────────────────────────────────────
-- Call this function after match results are fetched from the API.
-- Pass a JSON array of {teamId, outcome} where outcome is 'WIN'|'LOSS'|'DRAW'
-- and knock_out_mode=true if advancing = winning (penalties, extra time count).

create or replace function process_round_results(
  p_round_id      uuid,
  p_results       jsonb,       -- [{"team_id":"LIV","outcome":"WIN"}, ...]
  p_knock_out     boolean default false
)
returns void language plpgsql as $$
declare
  v_round         rounds%rowtype;
  v_comp          competitions%rowtype;
  v_pick          picks%rowtype;
  v_outcome       text;
  v_survived      boolean;
  v_reset_applies boolean;
begin
  select * into v_round from rounds where id = p_round_id;
  select * into v_comp  from competitions where id = v_round.competition_id;

  -- Mark round locked first
  update rounds set status = 'LOCKED' where id = p_round_id;

  -- Evaluate each pick
  for v_pick in
    select * from picks where round_id = p_round_id and result is null
  loop
    -- Find outcome for this pick's team
    select elem->>'outcome'
    into v_outcome
    from jsonb_array_elements(p_results) as elem
    where elem->>'team_id' = v_pick.team_id
    limit 1;

    if v_outcome is null then
      -- No result found yet, skip
      continue;
    end if;

    -- In knockout mode, advancing by any means = WIN
    if p_knock_out and v_outcome in ('WIN', 'DRAW') then
      v_outcome := 'WIN';
    end if;

    -- Draws in group stage = elimination per spec
    -- (unless competition allows draws — controlled by app-level logic)
    v_survived := (v_outcome = 'WIN') or (v_outcome = 'DRAW' and not p_knock_out);

    -- Update pick result
    update picks
    set result = case
      when v_outcome = 'WIN'  then 'WIN'
      when v_outcome = 'DRAW' then 'DRAW'
      else 'LOSS'
    end
    where id = v_pick.id;

    -- Update league member status
    if not v_survived then
      update league_members
      set status = 'ELIMINATED',
          eliminated_round = v_round.round_number
      where league_id = v_pick.league_id
        and (
          (user_id  is not null and user_id  = v_pick.user_id)
          or
          (device_id is not null and device_id = v_pick.device_id)
        )
        and status = 'ALIVE';
    else
      -- Increment rounds survived
      update league_members
      set rounds_survived = rounds_survived + 1
      where league_id = v_pick.league_id
        and (
          (user_id  is not null and user_id  = v_pick.user_id)
          or
          (device_id is not null and device_id = v_pick.device_id)
        )
        and status = 'ALIVE';
    end if;
  end loop;

  -- Mark round complete
  update rounds set status = 'COMPLETE' where id = p_round_id;
end;
$$;

-- ─── VALIDATE PICK ────────────────────────────────────────────────────────────
-- Returns true if the team hasn't been used in this league since last reset.
-- reset_schedule is checked by the app layer — here we validate no duplicates
-- within the current phase's allowed team pool.

create or replace function validate_pick(
  p_user_id     uuid,
  p_device_id   text,
  p_league_id   uuid,
  p_team_id     text,
  p_since_round int default 1  -- picks since this round number are considered (for resets)
) returns boolean language plpgsql as $$
begin
  return not exists (
    select 1
    from picks p
    join rounds r on r.id = p.round_id
    where p.league_id = p_league_id
      and p.team_id   = p_team_id
      and r.round_number >= p_since_round
      and (
        (p.user_id   is not null and p.user_id   = p_user_id)
        or
        (p.device_id is not null and p.device_id = p_device_id)
      )
  );
end;
$$;

-- ─── GUEST MIGRATION ─────────────────────────────────────────────────────────
-- Call when a guest signs up: migrate their device picks to their new user account.
create or replace function migrate_guest_to_user(
  p_device_id text,
  p_user_id   uuid
) returns int language plpgsql as $$
declare
  v_migrated int := 0;
begin
  -- Update picks
  update picks
  set user_id   = p_user_id,
      device_id = null
  where device_id = p_device_id
    and user_id is null;
  get diagnostics v_migrated = row_count;

  -- Update league memberships
  update league_members
  set user_id   = p_user_id,
      device_id = null
  where device_id = p_device_id
    and user_id is null;

  -- Record migration on user
  update users
  set migrated_from_guest_device = p_device_id
  where id = p_user_id;

  return v_migrated;
end;
$$;
