import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { useGuestPicks } from './useGuest';
import { getCurrentMatchday, getMatchdayFixtures, getRoundDeadline } from '../lib/api';

interface UnmadePickState {
  hasUnmadePick: boolean;
  deadlineWithin24h: boolean;
}

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

/**
 * Returns whether the user has an unmade pick for the current gameweek
 * and whether the deadline is within 24 hours.
 *
 * Used in two places:
 * 1. Tab bar red dot badge (layout.tsx)
 * 2. SignupWall trigger awareness (pick.tsx)
 *
 * Do not generalize beyond these two call sites.
 */
export function useUnmadePick(competitionApiId: number, competitionId: string): UnmadePickState {
  const { user } = useAuth();
  const { getPickForRound } = useGuestPicks(competitionId);
  const [state, setState] = useState<UnmadePickState>({
    hasUnmadePick: false,
    deadlineWithin24h: false,
  });

  const check = useCallback(async () => {
    try {
      const md = await getCurrentMatchday(competitionApiId);
      if (md === null) {
        setState({ hasUnmadePick: false, deadlineWithin24h: false });
        return;
      }

      const pick = getPickForRound(String(md));
      const hasUnmadePick = !pick;

      const fixtures = await getMatchdayFixtures(competitionApiId, md);
      const deadline = getRoundDeadline(fixtures);
      const deadlineWithin24h = deadline
        ? deadline.getTime() - Date.now() < TWENTY_FOUR_HOURS && deadline.getTime() > Date.now()
        : false;

      setState({ hasUnmadePick, deadlineWithin24h });
    } catch {
      setState({ hasUnmadePick: false, deadlineWithin24h: false });
    }
  }, [competitionApiId, getPickForRound]);

  useEffect(() => {
    check();
  }, [check, user]);

  return state;
}
