export type FormResult = 'W' | 'D' | 'L';

export interface Fixture {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  kickoff: string; // ISO datetime
  gameweek: number;
  status: 'scheduled' | 'in_play' | 'finished';
  homeScore?: number;
  awayScore?: number;
  homeForm?: FormResult[];
  awayForm?: FormResult[];
}

export interface Pick {
  id: string;
  userId: string;
  leagueId: string;
  gameweek: number;
  teamId: string;
  lockedAt: string;
  result?: 'survived' | 'eliminated' | 'pending';
}

export interface League {
  id: string;
  name: string;
  joinCode: string;
  createdBy: string;
  createdAt: string;
  isGlobal: boolean;
  totalMembers: number;
  aliveMembers: number;
}

export interface LeagueMember {
  id: string;
  userId: string;
  leagueId: string;
  username: string;
  avatarUrl?: string;
  status: 'alive' | 'eliminated';
  eliminatedWeek?: number;
  currentStreak: number;
  longestStreak: number;
  joinedAt: string;
}

export interface Gameweek {
  id: string;
  number: number;
  deadline: string; // ISO datetime — first kickoff of the week
  status: 'upcoming' | 'active' | 'completed';
}

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl?: string;
  longestStreak: number;
  teamsUsed: string[]; // team IDs
}

export interface SeasonHistory {
  leagueId: string;
  leagueName: string;
  eliminatedWeek?: number;
  eliminatedByTeamId?: string;
  position?: number;
  totalPlayers: number;
}
