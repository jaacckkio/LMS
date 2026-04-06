/**
 * Football Data API client (football-data.org)
 * API key stored in EXPO_PUBLIC_FOOTBALL_API_KEY
 */

const API_BASE = 'https://api.football-data.org/v4';
const PL_COMPETITION_ID = 'PL';

const headers = {
  'X-Auth-Token': process.env.EXPO_PUBLIC_FOOTBALL_API_KEY ?? '',
};

async function fetchApi<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers });
  if (!res.ok) {
    throw new Error(`Football API error: ${res.status} ${path}`);
  }
  return res.json() as Promise<T>;
}

export interface ApiMatch {
  id: number;
  utcDate: string;
  status: string;
  matchday: number;
  homeTeam: { id: number; shortName: string; tla: string; crest: string };
  awayTeam: { id: number; shortName: string; tla: string; crest: string };
  score: {
    winner: string | null;
    fullTime: { home: number | null; away: number | null };
  };
}

export async function getCurrentGameweekFixtures(): Promise<ApiMatch[]> {
  const data = await fetchApi<{ matches: ApiMatch[] }>(
    `/competitions/${PL_COMPETITION_ID}/matches?status=SCHEDULED&matchday=current`
  );
  return data.matches;
}

export async function getTeamForm(teamId: number, lastN = 3): Promise<string[]> {
  const data = await fetchApi<{ matches: ApiMatch[] }>(
    `/teams/${teamId}/matches?status=FINISHED&limit=${lastN}`
  );
  return data.matches.reverse().map((m) => {
    if (!m.score.winner) return 'D';
    const isHome = m.homeTeam.id === teamId;
    if (m.score.winner === 'DRAW') return 'D';
    if (
      (m.score.winner === 'HOME_TEAM' && isHome) ||
      (m.score.winner === 'AWAY_TEAM' && !isHome)
    )
      return 'W';
    return 'L';
  });
}
