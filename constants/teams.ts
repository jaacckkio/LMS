export interface Team {
  id: string;
  name: string;
  shortName: string;
  crest: string; // URL or local asset
  color: string;
}

// 20 Premier League teams for 2024/25 season
export const PL_TEAMS: Team[] = [
  { id: 'ARS', name: 'Arsenal', shortName: 'ARS', crest: 'https://crests.football-data.org/57.png', color: '#EF0107' },
  { id: 'AVL', name: 'Aston Villa', shortName: 'AVL', crest: 'https://crests.football-data.org/58.png', color: '#670E36' },
  { id: 'BOU', name: 'Bournemouth', shortName: 'BOU', crest: 'https://crests.football-data.org/1044.png', color: '#DA291C' },
  { id: 'BRE', name: 'Brentford', shortName: 'BRE', crest: 'https://crests.football-data.org/402.png', color: '#E30613' },
  { id: 'BHA', name: 'Brighton', shortName: 'BHA', crest: 'https://crests.football-data.org/397.png', color: '#0057B8' },
  { id: 'CHE', name: 'Chelsea', shortName: 'CHE', crest: 'https://crests.football-data.org/61.png', color: '#034694' },
  { id: 'CRY', name: 'Crystal Palace', shortName: 'CRY', crest: 'https://crests.football-data.org/354.png', color: '#1B458F' },
  { id: 'EVE', name: 'Everton', shortName: 'EVE', crest: 'https://crests.football-data.org/62.png', color: '#003399' },
  { id: 'FUL', name: 'Fulham', shortName: 'FUL', crest: 'https://crests.football-data.org/63.png', color: '#FFFFFF' },
  { id: 'IPS', name: 'Ipswich Town', shortName: 'IPS', crest: 'https://crests.football-data.org/678.png', color: '#0044A9' },
  { id: 'LEI', name: 'Leicester City', shortName: 'LEI', crest: 'https://crests.football-data.org/338.png', color: '#003090' },
  { id: 'LIV', name: 'Liverpool', shortName: 'LIV', crest: 'https://crests.football-data.org/64.png', color: '#C8102E' },
  { id: 'MCI', name: 'Manchester City', shortName: 'MCI', crest: 'https://crests.football-data.org/65.png', color: '#6CABDD' },
  { id: 'MNU', name: 'Manchester United', shortName: 'MNU', crest: 'https://crests.football-data.org/66.png', color: '#DA291C' },
  { id: 'NEW', name: 'Newcastle Utd', shortName: 'NEW', crest: 'https://crests.football-data.org/67.png', color: '#241F20' },
  { id: 'NFO', name: "Nott'm Forest", shortName: 'NFO', crest: 'https://crests.football-data.org/351.png', color: '#E53233' },
  { id: 'SOU', name: 'Southampton', shortName: 'SOU', crest: 'https://crests.football-data.org/340.png', color: '#D71920' },
  { id: 'TOT', name: 'Tottenham', shortName: 'TOT', crest: 'https://crests.football-data.org/73.png', color: '#132257' },
  { id: 'WHU', name: 'West Ham', shortName: 'WHU', crest: 'https://crests.football-data.org/563.png', color: '#7A263A' },
  { id: 'WOL', name: 'Wolves', shortName: 'WOL', crest: 'https://crests.football-data.org/76.png', color: '#FDB913' },
];

export const getTeamById = (id: string): Team | undefined =>
  PL_TEAMS.find((t) => t.id === id);
