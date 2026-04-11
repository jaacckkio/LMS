/**
 * football-data.org API client
 * - Live matches cached for 60 seconds
 * - All other responses cached for 5 minutes
 * - All times in UTC from API; format with toLondonTime() for display
 */

import { ApiMatch, ApiMatchday } from '../types';

const API_BASE = 'https://api.football-data.org/v4';

const LIVE_TTL = 60_000;       // 60 seconds
const DEFAULT_TTL = 5 * 60_000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  ts: number;
  ttl: number;
}

// In-memory cache — survives hot reloads, reset on full app restart
const cache = new Map<string, CacheEntry<unknown>>();

function isFresh<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.ts < entry.ttl;
}

async function fetchApi<T>(path: string, ttl = DEFAULT_TTL): Promise<T> {
  const key = path;
  const cached = cache.get(key);
  if (cached && isFresh(cached)) return cached.data as T;

  const apiKey = process.env.EXPO_PUBLIC_FOOTBALL_API_KEY ?? '';
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'X-Auth-Token': apiKey },
  });

  if (!res.ok) {
    // If rate limited, return cached stale data if available
    if (res.status === 429 && cached) return cached.data as T;
    throw new Error(`API ${res.status}: ${path}`);
  }

  const data = (await res.json()) as T;
  cache.set(key, { data, ts: Date.now(), ttl });
  return data;
}

/** Returns current matchday number for a competition */
export async function getCurrentMatchday(apiId: number): Promise<number | null> {
  try {
    const data = await fetchApi<ApiMatchday>(
      `/competitions/${apiId}/matches?status=SCHEDULED&limit=1`
    );
    // v4 API nests season under each match, not at the top level
    const md = data.matches?.[0]?.season?.currentMatchday
      ?? data.matches?.[0]?.matchday
      ?? null;
    if (md === null) {
      console.warn('[api] getCurrentMatchday: no matchday in response', Object.keys(data));
    }
    return md;
  } catch {
    return null;
  }
}

/** Fetches all matches for a given matchday */
export async function getMatchdayFixtures(
  apiId: number,
  matchday: number
): Promise<ApiMatch[]> {
  const hasLive = await hasLiveMatches(apiId, matchday);
  const ttl = hasLive ? LIVE_TTL : DEFAULT_TTL;

  const data = await fetchApi<ApiMatchday>(
    `/competitions/${apiId}/matches?matchday=${matchday}`,
    ttl
  );
  return data.matches ?? [];
}

/** Fetches in-play matches for a competition (60s cache) */
export async function getLiveMatches(apiId: number): Promise<ApiMatch[]> {
  try {
    const data = await fetchApi<ApiMatchday>(
      `/competitions/${apiId}/matches?status=IN_PLAY`,
      LIVE_TTL
    );
    return data.matches ?? [];
  } catch {
    return [];
  }
}

async function hasLiveMatches(apiId: number, matchday: number): Promise<boolean> {
  const live = await getLiveMatches(apiId);
  return live.some((m) => m.matchday === matchday);
}

/** Fetches recent completed matches for a competition (for activity feed) */
export async function getRecentResults(apiId: number): Promise<ApiMatch[]> {
  try {
    const data = await fetchApi<ApiMatchday>(
      `/competitions/${apiId}/matches?status=FINISHED&limit=10`,
      DEFAULT_TTL
    );
    return data.matches ?? [];
  } catch {
    return [];
  }
}

// ─── Time helpers ─────────────────────────────────────────────────────────────

/**
 * Convert UTC ISO string to Europe/London display string
 * Format: "Sat 12 Apr · 14:00"
 */
export function toLondonTime(utcDate: string): string {
  const date = new Date(utcDate);
  const weekday = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'short',
  }).format(date);

  const dayMonth = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    day: 'numeric',
    month: 'short',
  }).format(date);

  const time = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);

  return `${weekday} ${dayMonth} · ${time}`;
}

/** Returns only the time part "14:00" in London timezone */
export function toLondonTimeShort(utcDate: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(utcDate));
}

/** Check if a match has kicked off (locked for picking) */
export function isMatchLocked(utcDate: string): boolean {
  return new Date(utcDate) <= new Date();
}

/** First kickoff in a list of matches = the round deadline */
export function getRoundDeadline(matches: ApiMatch[]): Date | null {
  const scheduled = matches
    .filter((m) => m.status === 'SCHEDULED' || m.status === 'TIMED')
    .map((m) => new Date(m.utcDate))
    .sort((a, b) => a.getTime() - b.getTime());
  return scheduled[0] ?? null;
}

/** Determine a human-readable round name from stage/matchday */
export function getRoundName(stage: string, matchday: number | null): string {
  const stageMap: Record<string, string> = {
    GROUP_STAGE: matchday ? `Matchday ${matchday}` : 'Group Stage',
    LAST_32: 'Round of 32',
    LAST_16: 'Round of 16',
    QUARTER_FINALS: 'Quarter-Finals',
    SEMI_FINALS: 'Semi-Finals',
    FINAL: 'The Final',
    REGULAR_SEASON: matchday ? `Gameweek ${matchday}` : 'Regular Season',
  };
  return stageMap[stage] ?? (matchday ? `Round ${matchday}` : stage);
}
