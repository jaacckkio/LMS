# Backend Gaps

Every stub, mock, and hardcoded value introduced in Phases 1–3 that needs real backend wiring.

---

## 1. Global stats (`lib/leagueQueries.ts` → `getGlobalStats`)

**Where stubbed:** `lib/leagueQueries.ts:getGlobalStats()`
**Currently returns:** Hardcoded `{ survivors: 14219, eliminated: 5781, totalPlayers: 20000, currentGameweek: 31 }`
**Expected RPC:** `rpc get_global_stats(competition_id uuid)`
**Expected return:** `{ survivors: int, eliminated: int, total_players: int, current_gameweek: int }`
**Used by:** Home screen (`index.tsx`), Pick screen (`pick.tsx`), LiveTicker (`lib/ticker.ts`)

---

## 2. User leagues (`lib/leagueQueries.ts` → `getUserLeagues`)

**Where stubbed:** `lib/leagueQueries.ts:getUserLeagues()`
**Currently returns:** 5 hardcoded mock leagues (Global Pool, private leagues with stakes)
**Expected RPC:** `rpc get_user_leagues(user_id uuid, device_id text)`
**Expected return:** `League[]` — as defined in `types/index.ts`
**Used by:** Home screen (`index.tsx`), Leagues screen (`leagues.tsx`)

---

## 3. User status in league (`lib/leagueQueries.ts` → `getUserStatus`)

**Where stubbed:** `lib/leagueQueries.ts:getUserStatus()`
**Currently returns:** `'ALIVE'` for all leagues
**Expected RPC:** `rpc get_user_status(league_id uuid, user_id uuid, device_id text)`
**Expected return:** `'ALIVE' | 'ELIMINATED' | null`
**Used by:** Home screen, Leagues screen (LeagueCard status pill)

---

## 4. League members (`lib/leagueQueries.ts` → `getLeagueMembers`)

**Where stubbed:** `lib/leagueQueries.ts:getLeagueMembers()`
**Currently returns:** 8 hardcoded mock members
**Expected RPC:** `rpc get_league_members(league_id uuid)`
**Expected return:** `LeagueMember[]` — as defined in `types/index.ts`
**Used by:** Leagues screen detail modal

---

## 5. Create league (`lib/leagueQueries.ts` → `createLeague`)

**Where stubbed:** `lib/leagueQueries.ts:createLeague()`
**Currently returns:** Fake league with random invite code
**Expected RPC:** `rpc create_league(name text, competition_id uuid, stake text, user_id uuid)`
**Expected return:** `League` (newly created, with invite code)
**Used by:** Leagues screen create flow

---

## 6. Join league (`lib/leagueQueries.ts` → `joinLeague`)

**Where stubbed:** `lib/leagueQueries.ts:joinLeague()`
**Currently returns:** First mock league regardless of code
**Expected RPC:** `rpc join_league(invite_code text, user_id uuid, device_id text)`
**Expected return:** `League | null`
**Used by:** Leagues screen join modal

---

## 7. Pick distribution (`lib/stats.ts` → `mockMatchdayDistribution`)

**Where stubbed:** `lib/stats.ts:mockMatchdayDistribution()`
**Currently returns:** Fake distribution based on team-strength tiers + noise
**Expected RPC:** `rpc get_pick_distribution(competition_id uuid, matchday int)`
**Expected return:** `Map<string, number>` (team TLA → pick count)
**Used by:** Pick screen (FixtureCard "X% picked" labels), Home screen (TopPicksMini)

---

## 8. Most-picked team in ticker (`lib/ticker.ts`)

**Where stubbed:** `lib/ticker.ts` line 44 — hardcoded `"Most-picked team: Arsenal (32%)"`
**Expected source:** Derived from pick distribution RPC above
**Used by:** Home screen LiveTicker

---

## 9. Profile stats: longest survival streak

**Where stubbed:** `app/(tabs)/profile.tsx` — `longestStreak = roundsSurvived` (current count used as proxy)
**Expected RPC:** `rpc get_user_profile_stats(user_id uuid, competition_id uuid)`
**Expected return:** `{ longest_streak: int, leagues_won: int, total_picks: int, win_rate: float }`
**Used by:** Profile screen stats grid

---

## 10. Profile stats: leagues won

**Where stubbed:** `app/(tabs)/profile.tsx` — `leaguesWon = 0`
**Expected source:** Same RPC as #9
**Used by:** Profile screen stats grid

---

## 11. Red dot badge: unmade pick detection

**Status:** RESOLVED in Phase 4 — `useUnmadePick` hook now derives this from `getCurrentMatchday()` + `getPickForRound()` + `getRoundDeadline()`.
**Where wired:** `hooks/useUnmadePick.ts` → `app/(tabs)/_layout.tsx`
**Remaining gap:** None — works with existing API data. Badge shows when user has no pick and deadline is <24h.

---

## 12. Guest pick migration on signup

**Where stubbed:** `app/(tabs)/pick.tsx:handleSignupComplete` — `console.log('[migration] would migrate guest pick:', pendingGuestPick)`
**Needs:** Firebase↔Supabase JWT bridging, then call `migrate_guest_picks` RPC
**Expected RPC:** `rpc migrate_guest_picks(user_id uuid, picks jsonb)`
**Expected input:** All picks from `getAllGuestPicks()` in `lib/storage.ts`
**Used by:** Post-signup flow in pick screen
