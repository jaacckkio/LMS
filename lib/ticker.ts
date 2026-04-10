/**
 * Builds the rotating ticker items for the Home screen LiveTicker.
 * Derives what it can from real data, stubs the rest from leagueQueries.
 * Pure function — no React, no state.
 */

import { getGlobalStats } from './leagueQueries';
import { getRoundDeadline } from './api';
import { ApiMatch } from '../types';

function formatCountdown(deadline: Date): string {
  const ms = deadline.getTime() - Date.now();
  if (ms <= 0) return 'Picks are locked';
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `Picks lock in ${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `Picks lock in ${hours}h ${mins}m`;
  return `Picks lock in ${mins}m`;
}

/**
 * Returns an array of ticker strings for the LiveTicker component.
 * At least one item is derived from real data (the deadline countdown).
 */
export async function getTickerItems(
  competitionId: string,
  matches: ApiMatch[],
): Promise<string[]> {
  const items: string[] = [];

  // Real data: deadline countdown
  const deadline = getRoundDeadline(matches);
  if (deadline) {
    items.push(`\u23F1 ${formatCountdown(deadline)}`);
  }

  // From leagueQueries (mock-first, swappable)
  const stats = await getGlobalStats(competitionId);
  items.push(`\uD83D\uDD25 ${stats.eliminated.toLocaleString()} eliminated this gameweek`);
  items.push(`\u2694\uFE0F ${stats.survivors.toLocaleString()} survivors remaining`);

  // Stubbed rotator — replace with real "most-picked" data when backend lands
  items.push(`\uD83D\uDCA0 Most-picked team: Arsenal (32%)`);

  return items;
}
