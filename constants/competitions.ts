export type CompetitionType = 'LEAGUE' | 'WORLD_CUP' | 'EUROS' | 'COPA_AMERICA' | 'CHAMPIONS_LEAGUE';

export interface PhaseReset {
  afterPhase: string;
  beforePhase: string;
}

export interface CompetitionConfig {
  id: string;
  name: string;
  shortName: string;
  apiId: number;
  type: CompetitionType;
  flag: string;
  accentColor: string;
  // Win condition for group/league stage — World Cup groups require outright win
  groupStageWinOnly: boolean;
  // Knock-out phase: advance by any method counts as a win
  knockoutAdvanceCountsAsWin: boolean;
  resets: PhaseReset[];
}

export const COMPETITIONS: CompetitionConfig[] = [
  {
    id: 'WC2026',
    name: 'World Cup 2026',
    shortName: 'WC26',
    apiId: 2000,
    type: 'WORLD_CUP',
    flag: '🌍',
    accentColor: '#FFD700',
    groupStageWinOnly: true,
    knockoutAdvanceCountsAsWin: true,
    resets: [
      { afterPhase: 'GROUP_STAGE', beforePhase: 'LAST_16' },
      { afterPhase: 'QUARTER_FINALS', beforePhase: 'SEMI_FINALS' },
    ],
  },
  {
    id: 'PL',
    name: 'Premier League',
    shortName: 'PL',
    apiId: 2021,
    type: 'LEAGUE',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    accentColor: '#380D75',
    groupStageWinOnly: false,
    knockoutAdvanceCountsAsWin: false,
    resets: [],
  },
  {
    id: 'CL',
    name: 'Champions League',
    shortName: 'UCL',
    apiId: 2001,
    type: 'CHAMPIONS_LEAGUE',
    flag: '⭐',
    accentColor: '#1B3A6B',
    groupStageWinOnly: false,
    knockoutAdvanceCountsAsWin: true,
    resets: [
      { afterPhase: 'GROUP_STAGE', beforePhase: 'LAST_16' },
    ],
  },
  {
    id: 'EC',
    name: 'UEFA Euro 2028',
    shortName: 'EURO',
    apiId: 2018,
    type: 'EUROS',
    flag: '🇪🇺',
    accentColor: '#003399',
    groupStageWinOnly: true,
    knockoutAdvanceCountsAsWin: true,
    resets: [
      { afterPhase: 'GROUP_STAGE', beforePhase: 'LAST_16' },
      { afterPhase: 'QUARTER_FINALS', beforePhase: 'SEMI_FINALS' },
    ],
  },
  {
    id: 'PD',
    name: 'La Liga',
    shortName: 'La Liga',
    apiId: 2014,
    type: 'LEAGUE',
    flag: '🇪🇸',
    accentColor: '#C60B1E',
    groupStageWinOnly: false,
    knockoutAdvanceCountsAsWin: false,
    resets: [],
  },
  {
    id: 'BL1',
    name: 'Bundesliga',
    shortName: 'BL',
    apiId: 2002,
    type: 'LEAGUE',
    flag: '🇩🇪',
    accentColor: '#D00027',
    groupStageWinOnly: false,
    knockoutAdvanceCountsAsWin: false,
    resets: [],
  },
  {
    id: 'SA',
    name: 'Serie A',
    shortName: 'SA',
    apiId: 2019,
    type: 'LEAGUE',
    flag: '🇮🇹',
    accentColor: '#0066CC',
    groupStageWinOnly: false,
    knockoutAdvanceCountsAsWin: false,
    resets: [],
  },
  {
    id: 'FL1',
    name: 'Ligue 1',
    shortName: 'L1',
    apiId: 2015,
    type: 'LEAGUE',
    flag: '🇫🇷',
    accentColor: '#003189',
    groupStageWinOnly: false,
    knockoutAdvanceCountsAsWin: false,
    resets: [],
  },
];

export const DEFAULT_COMPETITION_ID = 'PL';

export function getCompetition(id: string): CompetitionConfig {
  return COMPETITIONS.find((c) => c.id === id) ?? COMPETITIONS.find((c) => c.id === DEFAULT_COMPETITION_ID)!;
}
