import { useCallback, useEffect, useState } from 'react';
import { GuestPick } from '../types';
import {
  getGuestPicks,
  getGuestPickForRound,
  saveGuestPick,
  getOrCreateDeviceId,
} from '../lib/storage';

export function useGuestPicks(competitionId: string) {
  const [picks, setPicks] = useState<GuestPick[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getGuestPicks(competitionId),
      getOrCreateDeviceId(),
    ]).then(([p, id]) => {
      if (cancelled) return;
      setPicks(p);
      setDeviceId(id);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [competitionId]);

  const savePick = useCallback(
    async (pick: GuestPick) => {
      await saveGuestPick(pick);
      setPicks(await getGuestPicks(pick.competitionId));
    },
    []
  );

  const getPickForRound = useCallback(
    (roundId: string): GuestPick | undefined =>
      picks.find((p) => p.roundId === roundId),
    [picks]
  );

  const usedTeamTlas = picks.map((p) => p.teamId);

  return { picks, deviceId, loading, savePick, getPickForRound, usedTeamTlas };
}
