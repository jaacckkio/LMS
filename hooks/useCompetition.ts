import { useCallback, useEffect, useState } from 'react';
import { COMPETITIONS, CompetitionConfig, DEFAULT_COMPETITION_ID } from '../constants/competitions';
import { getActiveCompetitionId, setActiveCompetitionId } from '../lib/storage';

export function useCompetition() {
  const [activeId, setActiveId] = useState<string>(DEFAULT_COMPETITION_ID);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveCompetitionId().then((id) => {
      if (id) setActiveId(id);
      setLoading(false);
    });
  }, []);

  const setCompetition = useCallback((id: string) => {
    setActiveId(id);
    setActiveCompetitionId(id);
  }, []);

  const competition: CompetitionConfig =
    COMPETITIONS.find((c) => c.id === activeId) ??
    COMPETITIONS.find((c) => c.id === DEFAULT_COMPETITION_ID)!;

  return { competition, competitions: COMPETITIONS, setCompetition, loading };
}
