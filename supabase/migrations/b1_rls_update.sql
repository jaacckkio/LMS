-- Phase B1: RLS migration — sub claim is now users.id (UUID), not firebase_uid
-- Run this in the Supabase SQL editor against the production database.
-- Safe to re-run (uses DROP IF EXISTS).

-- 1. users_write_own
DROP POLICY IF EXISTS "users_write_own" ON users;
CREATE POLICY "users_write_own" ON users FOR ALL
  USING (id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

-- 2. picks_read_post_deadline
DROP POLICY IF EXISTS "picks_read_post_deadline" ON picks;
CREATE POLICY "picks_read_post_deadline" ON picks FOR SELECT
  USING (
    exists (
      select 1 from rounds r
      where r.id = picks.round_id
        and r.status = 'COMPLETE'
    )
    or
    picks.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  );

-- 3. picks_insert_own
DROP POLICY IF EXISTS "picks_insert_own" ON picks;
CREATE POLICY "picks_insert_own" ON picks FOR INSERT
  WITH CHECK (
    user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  );

-- 4. lm_read_own_leagues
DROP POLICY IF EXISTS "lm_read_own_leagues" ON league_members;
CREATE POLICY "lm_read_own_leagues" ON league_members FOR SELECT
  USING (
    exists (
      select 1 from league_members me
      where me.league_id = league_members.league_id
        and me.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
    )
    or
    exists (select 1 from leagues l where l.id = league_members.league_id and l.league_type = 'GLOBAL')
  );
