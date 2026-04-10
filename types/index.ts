// ─── API types from football-data.org ────────────────────────────────────────

export interface ApiTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export type ApiMatchStatus =
  | 'SCHEDULED'
  | 'TIMED'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'SUSPENDED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'AWARDED';

export type ApiWinner = 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null;

export interface ApiMatch {
  id: number;
  utcDate: string;
  status: ApiMatchStatus;
  matchday: number | null;
  stage: string;
  group: string | null;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  score: {
    winner: ApiWinner;
    duration: string;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
}

export interface ApiMatchday {
  matches: ApiMatch[];
  competition: {
    id: number;
    name: string;
    code: string;
  };
  season: {
    id: number;
    currentMatchday: number | null;
  };
}

export interface ApiStandingsEntry {
  position: number;
  team: ApiTeam;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
}

// ─── App domain types ─────────────────────────────────────────────────────────

export type PickResult = 'WIN' | 'LOSS' | 'DRAW' | 'PENDING';

export interface GuestPick {
  competitionId: string;
  roundId: string;   // matchday number as string e.g. "31"
  teamId: string;    // team TLA code e.g. "LIV"
  teamName: string;
  teamCrest: string;
  result: PickResult;
  savedAt: string;   // ISO
}

export type LeagueType = 'PRIVATE' | 'GLOBAL';
export type MemberStatus = 'ALIVE' | 'ELIMINATED';

export interface League {
  id: string;
  name: string;
  competitionId: string;
  type: LeagueType;
  inviteCode: string;
  createdBy: string;
  createdAt: string;
  totalMembers: number;
  aliveMembers: number;
  stake?: string;
}

export interface LeagueMember {
  id: string;
  leagueId: string;
  userId: string | null;
  deviceId: string | null;
  displayName: string;
  avatarUrl?: string;
  status: MemberStatus;
  eliminatedRound?: number;
  roundsSurvived: number;
  joinedAt: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  migratedFromGuestDeviceId?: string;
}

export interface CompetitionStats {
  competitionId: string;
  competitionName: string;
  roundsSurvived: number;
  status: MemberStatus;
  eliminatedRound?: number;
  teamsUsed: UsedTeam[];
}

export interface UsedTeam {
  teamId: string;     // TLA
  teamName: string;
  teamCrest: string;
  roundId: string;
  result: PickResult;
  resetAvailable: boolean; // true if team can be used again after a reset
}

// ─── UI state helpers ─────────────────────────────────────────────────────────

export interface RoundInfo {
  matchday: number;
  phase: string;
  name: string;     // "Matchday 31", "Quarter-Finals", etc.
  deadline: Date;   // first kickoff of the round
  isLocked: boolean;
}
