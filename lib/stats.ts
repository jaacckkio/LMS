/**
 * Pure stat-derivation functions. No React, no state, no async.
 * Where real data isn't available, functions are prefixed "mock" and
 * return realistic fakes — easy to swap when the backend lands.
 */

import { ApiMatch } from '../types';

// ─── Stubbed: pick distribution ──────────────────────────────────────────────
// Uses simplified team-strength tiers to generate plausible pick percentages.
// Replace with a real Supabase RPC when backend is ready.

/** Tier weights — higher = more "survivors would pick this team". */
const TIER: Record<string, number> = {
  // Premier League heavyweights
  ARS: 9, MCI: 9, LIV: 9, CHE: 7, MUN: 6, TOT: 6, NEW: 5, AVL: 5,
  // La Liga
  RMA: 9, BAR: 9, ATM: 6, RSO: 4, VIL: 4,
  // Bundesliga
  FCB: 9, BVB: 6, LEV: 6, RBL: 5,
  // Serie A
  JUV: 7, MIL: 6, INT: 7, NAP: 6,
  // Ligue 1
  PSG: 9, MON: 5, LYO: 4,
};

function teamWeight(tla: string): number {
  return TIER[tla] ?? 3; // unknown teams get a baseline weight
}

function addNoise(value: number, maxPct: number): number {
  const noise = (Math.random() - 0.5) * 2 * maxPct;
  return Math.max(1, value * (1 + noise));
}

export interface PickDistribution {
  teamTla: string;
  percentage: number;
}

/**
 * Mock pick distribution for a single fixture.
 * Returns percentages that roughly sum to a fixture's share of total picks
 * (they're normalised across a full matchday by the caller if needed).
 *
 * @param homeTeamTla  Home team TLA
 * @param awayTeamTla  Away team TLA
 * @param _survivorsCount  Total survivors (unused in mock, will shape real distribution)
 */
export function mockPickDistribution(
  homeTeamTla: string,
  awayTeamTla: string,
  _survivorsCount: number,
): { home: PickDistribution; away: PickDistribution } {
  const hw = addNoise(teamWeight(homeTeamTla), 0.2);
  const aw = addNoise(teamWeight(awayTeamTla), 0.2);
  const total = hw + aw;

  return {
    home: { teamTla: homeTeamTla, percentage: Math.round((hw / total) * 100) },
    away: { teamTla: awayTeamTla, percentage: Math.round((aw / total) * 100) },
  };
}

/**
 * Given a full matchday of fixtures, returns normalised pick distributions
 * so percentages across all teams sum to 100%.
 */
export function mockMatchdayDistribution(
  matches: ApiMatch[],
  survivorsCount: number,
): Map<string, number> {
  const raw = new Map<string, number>();
  for (const m of matches) {
    const dist = mockPickDistribution(m.homeTeam.tla, m.awayTeam.tla, survivorsCount);
    raw.set(dist.home.teamTla, (raw.get(dist.home.teamTla) ?? 0) + dist.home.percentage);
    raw.set(dist.away.teamTla, (raw.get(dist.away.teamTla) ?? 0) + dist.away.percentage);
  }

  // Normalise to 100%
  const sum = Array.from(raw.values()).reduce((a, b) => a + b, 0);
  const normalised = new Map<string, number>();
  for (const [tla, val] of raw) {
    normalised.set(tla, Math.round((val / sum) * 100));
  }
  return normalised;
}

// ─── Real data derivations ───────────────────────────────────────────────────
// These use actual match results from lib/api.ts — no stubbing needed.

/**
 * "If you'd picked X, you'd be out." Derives the hypothetical from real results.
 * Returns teams from the given matches that lost (or drew, depending on rules).
 */
export function hypotheticalEliminations(
  matches: ApiMatch[],
  winOnly: boolean,
): Array<{ tla: string; shortName: string }> {
  const eliminated: Array<{ tla: string; shortName: string }> = [];

  for (const m of matches) {
    if (m.status !== 'FINISHED') continue;
    const { winner } = m.score;

    if (winner === 'HOME_TEAM') {
      eliminated.push({ tla: m.awayTeam.tla, shortName: m.awayTeam.shortName });
      if (winOnly) {
        // Draw also eliminates in winOnly mode — but winner=HOME_TEAM means no draw here
      }
    } else if (winner === 'AWAY_TEAM') {
      eliminated.push({ tla: m.homeTeam.tla, shortName: m.homeTeam.shortName });
    } else if (winner === 'DRAW') {
      if (winOnly) {
        // In win-only mode, draws eliminate both sides
        eliminated.push({ tla: m.homeTeam.tla, shortName: m.homeTeam.shortName });
        eliminated.push({ tla: m.awayTeam.tla, shortName: m.awayTeam.shortName });
      }
    }
  }

  return eliminated;
}

/**
 * Top 3 most-picked teams from a matchday distribution.
 */
export function topPicks(
  distribution: Map<string, number>,
  limit = 3,
): Array<{ tla: string; percentage: number }> {
  return Array.from(distribution.entries())
    .map(([tla, percentage]) => ({ tla, percentage }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, limit);
}
