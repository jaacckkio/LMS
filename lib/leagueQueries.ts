/**
 * League data access layer. Mock-first with realistic data.
 * Swap the body of each function with a single Supabase call when ready.
 *
 * Every function is async so the call-site contract doesn't change on swap.
 */

import { League, LeagueMember, MemberStatus } from '../types';

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_LEAGUES: League[] = [
  {
    id: 'gl-pl-2025',
    name: 'Premier League Global Pool',
    competitionId: 'PL',
    type: 'GLOBAL',
    inviteCode: 'PLGLOB',
    createdBy: 'system',
    createdAt: '2025-08-01T00:00:00Z',
    totalMembers: 18420,
    aliveMembers: 1203,
  },
  {
    id: 'gl-wc-2026',
    name: 'World Cup 2026 Global Pool',
    competitionId: 'WC2026',
    type: 'GLOBAL',
    inviteCode: 'WC26GL',
    createdBy: 'system',
    createdAt: '2026-06-01T00:00:00Z',
    totalMembers: 42100,
    aliveMembers: 8740,
  },
  {
    id: 'priv-office',
    name: 'The Office Pool',
    competitionId: 'PL',
    type: 'PRIVATE',
    inviteCode: 'OFF1CE',
    createdBy: 'user-1',
    createdAt: '2025-08-15T09:30:00Z',
    totalMembers: 14,
    aliveMembers: 4,
  },
  {
    id: 'priv-sunday',
    name: 'Sunday League Survivors',
    competitionId: 'PL',
    type: 'PRIVATE',
    inviteCode: 'SUNLGS',
    createdBy: 'user-2',
    createdAt: '2025-09-01T12:00:00Z',
    totalMembers: 23,
    aliveMembers: 7,
  },
  {
    id: 'priv-workmates',
    name: 'Workmates',
    competitionId: 'CL',
    type: 'PRIVATE',
    inviteCode: 'WRK8TS',
    createdBy: 'user-1',
    createdAt: '2025-09-10T08:00:00Z',
    totalMembers: 8,
    aliveMembers: 3,
  },
];

const MOCK_STAKES: Record<string, string> = {
  'priv-office': 'Loser buys drinks',
  'priv-sunday': 'Bragging rights',
  'priv-workmates': '\u00A320 each',
};

const MOCK_USER_STATUS: Record<string, MemberStatus | 'GUEST'> = {
  'gl-pl-2025': 'ALIVE',
  'gl-wc-2026': 'ALIVE',
  'priv-office': 'ALIVE',
  'priv-sunday': 'ELIMINATED',
  'priv-workmates': 'ALIVE',
};

const MOCK_MEMBERS: LeagueMember[] = [
  { id: 'm1', leagueId: 'priv-office', userId: 'user-1', deviceId: null, displayName: 'Jack', status: 'ALIVE', roundsSurvived: 12, joinedAt: '2025-08-15T09:30:00Z' },
  { id: 'm2', leagueId: 'priv-office', userId: 'user-3', deviceId: null, displayName: 'Emily', status: 'ALIVE', roundsSurvived: 12, joinedAt: '2025-08-15T10:00:00Z' },
  { id: 'm3', leagueId: 'priv-office', userId: 'user-4', deviceId: null, displayName: 'Tom', status: 'ALIVE', roundsSurvived: 12, joinedAt: '2025-08-15T11:00:00Z' },
  { id: 'm4', leagueId: 'priv-office', userId: 'user-5', deviceId: null, displayName: 'Sarah', status: 'ALIVE', roundsSurvived: 12, joinedAt: '2025-08-16T08:00:00Z' },
  { id: 'm5', leagueId: 'priv-office', userId: 'user-6', deviceId: null, displayName: 'Dan', status: 'ELIMINATED', eliminatedRound: 8, roundsSurvived: 8, joinedAt: '2025-08-15T12:00:00Z' },
  { id: 'm6', leagueId: 'priv-office', userId: 'user-7', deviceId: null, displayName: 'Priya', status: 'ELIMINATED', eliminatedRound: 11, roundsSurvived: 11, joinedAt: '2025-08-16T09:00:00Z' },
];

// ─── Public API ──────────────────────────────────────────────────────────────

/** All leagues the current user/guest belongs to. */
export async function getUserLeagues(
  _userId: string | null,
  _deviceId: string | null,
): Promise<League[]> {
  // TODO: swap with supabase.from('league_members').select('leagues(*)').eq(...)
  return MOCK_LEAGUES;
}

/** Leagues filtered by competition. */
export async function getLeaguesByCompetition(
  competitionId: string,
  _userId: string | null,
  _deviceId: string | null,
): Promise<League[]> {
  return MOCK_LEAGUES.filter((l) => l.competitionId === competitionId);
}

/** User's status in a given league. */
export async function getUserStatus(
  leagueId: string,
  _userId: string | null,
  _deviceId: string | null,
): Promise<MemberStatus | 'GUEST' | null> {
  return MOCK_USER_STATUS[leagueId] ?? null;
}

/** Stake text for a league (optional, user-provided on creation). */
export async function getLeagueStake(leagueId: string): Promise<string | null> {
  return MOCK_STAKES[leagueId] ?? null;
}

/** Members of a league, sorted by status (alive first) then rounds survived. */
export async function getLeagueMembers(leagueId: string): Promise<LeagueMember[]> {
  // TODO: swap with supabase.from('league_members').select('*').eq('league_id', leagueId)
  return MOCK_MEMBERS.filter((m) => m.leagueId === leagueId)
    .sort((a, b) => {
      if (a.status === 'ALIVE' && b.status !== 'ALIVE') return -1;
      if (a.status !== 'ALIVE' && b.status === 'ALIVE') return 1;
      return b.roundsSurvived - a.roundsSurvived;
    });
}

/** Create a new league. Returns the created league. */
export async function createLeague(params: {
  name: string;
  competitionId: string;
  stake?: string;
  startingMatchday?: number;
  userId: string;
}): Promise<League> {
  // TODO: swap with supabase RPC or insert
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const league: League = {
    id: `priv-${code.toLowerCase()}`,
    name: params.name,
    competitionId: params.competitionId,
    type: 'PRIVATE',
    inviteCode: code,
    createdBy: params.userId,
    createdAt: new Date().toISOString(),
    totalMembers: 1,
    aliveMembers: 1,
  };
  return league;
}

/** Join a league by invite code. */
export async function joinLeague(
  _inviteCode: string,
  _userId: string | null,
  _deviceId: string | null,
): Promise<League | null> {
  // TODO: swap with supabase RPC
  return null;
}

/** Global survivor / eliminated counts for a competition. */
export async function getGlobalStats(competitionId: string): Promise<{
  survivors: number;
  eliminated: number;
  totalPlayers: number;
  currentGameweek: number;
}> {
  // TODO: swap with supabase RPC
  if (competitionId === 'WC2026') {
    return { survivors: 8740, eliminated: 33360, totalPlayers: 42100, currentGameweek: 3 };
  }
  return { survivors: 1203, eliminated: 17217, totalPlayers: 18420, currentGameweek: 12 };
}
