import type { 
  Fixture, 
  Team, 
  LeagueTableRow, 
  MatchStats, 
  AIInsight, 
  PlayerStats,
  Competition,
  TeamStats 
} from '@/types';
import type { FilterParams } from './types';

// Mock Teams Data
const mockTeams: Team[] = [
  {
    id: 'arsenal',
    name: 'Arsenal',
    shortName: 'ARS',
    logo: '/logos/arsenal.png',
    colors: { primary: '#EF0107', secondary: '#FFFFFF' },
    form: ['W', 'W', 'D', 'W', 'L'],
    position: 2,
    founded: 1886,
    venue: 'Emirates Stadium',
    coach: 'Mikel Arteta'
  },
  {
    id: 'manchester-city',
    name: 'Manchester City',
    shortName: 'MCI',
    logo: '/logos/man-city.png',
    colors: { primary: '#6CABDD', secondary: '#FFFFFF' },
    form: ['W', 'W', 'W', 'W', 'W'],
    position: 1,
    founded: 1880,
    venue: 'Etihad Stadium',
    coach: 'Pep Guardiola'
  },
  {
    id: 'liverpool',
    name: 'Liverpool',
    shortName: 'LIV',
    logo: '/logos/liverpool.png',
    colors: { primary: '#C8102E', secondary: '#FFFFFF' },
    form: ['W', 'W', 'L', 'W', 'W'],
    position: 3,
    founded: 1892,
    venue: 'Anfield',
    coach: 'Jürgen Klopp'
  },
  {
    id: 'chelsea',
    name: 'Chelsea',
    shortName: 'CHE',
    logo: '/logos/chelsea.png',
    colors: { primary: '#034694', secondary: '#FFFFFF' },
    form: ['D', 'W', 'L', 'D', 'W'],
    position: 4,
    founded: 1905,
    venue: 'Stamford Bridge',
    coach: 'Mauricio Pochettino'
  },
  {
    id: 'manchester-united',
    name: 'Manchester United',
    shortName: 'MUN',
    logo: '/logos/man-utd.png',
    colors: { primary: '#DA020E', secondary: '#FFFFFF' },
    form: ['L', 'W', 'D', 'L', 'W'],
    position: 5,
    founded: 1878,
    venue: 'Old Trafford',
    coach: 'Erik ten Hag'
  },
  {
    id: 'tottenham',
    name: 'Tottenham Hotspur',
    shortName: 'TOT',
    logo: '/logos/tottenham.png',
    colors: { primary: '#132257', secondary: '#FFFFFF' },
    form: ['W', 'D', 'W', 'L', 'D'],
    position: 6,
    founded: 1882,
    venue: 'Tottenham Hotspur Stadium',
    coach: 'Ange Postecoglou'
  }
];

// Mock Competitions
const mockCompetitions: Competition[] = [
  {
    id: 'premier-league',
    name: 'Premier League',
    code: 'PL',
    country: 'England',
    season: '2024-25',
    logo: '/logos/premier-league.png'
  },
  {
    id: 'champions-league',
    name: 'UEFA Champions League',
    code: 'CL',
    country: 'Europe',
    season: '2024-25',
    logo: '/logos/champions-league.png'
  },
  {
    id: 'fa-cup',
    name: 'FA Cup',
    code: 'FAC',
    country: 'England',
    season: '2024-25',
    logo: '/logos/fa-cup.png'
  }
];

// Helper function to generate random date
const getRandomDate = (daysOffset: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
};

// Helper function to get random team
const getRandomTeam = (): Team => mockTeams[Math.floor(Math.random() * mockTeams.length)];

// Helper function to get random status
const getRandomStatus = (): 'scheduled' | 'live' | 'finished' | 'postponed' => {
  const statuses = ['scheduled', 'live', 'finished', 'postponed'];
  const weights = [0.6, 0.1, 0.25, 0.05]; // Probability weights
  const random = Math.random();
  let sum = 0;
  
  for (let i = 0; i < statuses.length; i++) {
    sum += weights[i];
    if (random < sum) {
      return statuses[i] as any;
    }
  }
  
  return 'scheduled';
};

export const getMockFixtures = (filters: FilterParams = {}): Fixture[] => {
  const fixtures: Fixture[] = [];
  const fixtureCount = 20;

  for (let i = 0; i < fixtureCount; i++) {
    const homeTeam = getRandomTeam();
    let awayTeam = getRandomTeam();
    
    // Ensure home and away teams are different
    while (awayTeam.id === homeTeam.id) {
      awayTeam = getRandomTeam();
    }

    const status = getRandomStatus();
    const daysOffset = Math.floor(Math.random() * 14) - 7; // -7 to +7 days

    const fixture: Fixture = {
      id: `fixture-${i + 1}`,
      homeTeam,
      awayTeam,
      competition: mockCompetitions[0], // Premier League
      dateTime: getRandomDate(daysOffset),
      venue: homeTeam.venue || 'Stadium',
      status,
      ...(status === 'finished' && {
        homeScore: Math.floor(Math.random() * 4),
        awayScore: Math.floor(Math.random() * 4)
      }),
      ...(status === 'live' && {
        homeScore: Math.floor(Math.random() * 3),
        awayScore: Math.floor(Math.random() * 3)
      }),
      aiInsight: {
        id: `insight-${i + 1}`,
        title: 'Over 2.5 Goals',
        description: `Based on recent form, expect an entertaining match with ${Math.floor(Math.random() * 3) + 2}.5+ goals.`,
        confidence: Math.random() > 0.5 ? 'high' : Math.random() > 0.3 ? 'medium' : 'low',
        market: 'Goals',
        odds: +(2.1 + Math.random() * 2).toFixed(2),
        supportingData: [
          `${homeTeam.shortName} averaging ${(Math.random() * 2 + 1).toFixed(1)} goals per game`,
          `${awayTeam.shortName} conceding ${(Math.random() * 1.5 + 0.5).toFixed(1)} goals per game`
        ]
      }
    };

    fixtures.push(fixture);
  }

  // Apply filters
  let filteredFixtures = fixtures;

  if (filters.status) {
    filteredFixtures = filteredFixtures.filter(f => f.status === filters.status);
  }

  if (filters.team) {
    filteredFixtures = filteredFixtures.filter(f => 
      f.homeTeam.id === filters.team || f.awayTeam.id === filters.team
    );
  }

  if (filters.dateFrom || filters.dateTo) {
    filteredFixtures = filteredFixtures.filter(f => {
      const fixtureDate = new Date(f.dateTime);
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : new Date('2020-01-01');
      const toDate = filters.dateTo ? new Date(filters.dateTo) : new Date('2030-12-31');
      
      return fixtureDate >= fromDate && fixtureDate <= toDate;
    });
  }

  return filteredFixtures;
};

export const getMockFixtureById = (id: string): Fixture | null => {
  const fixtures = getMockFixtures();
  return fixtures.find(f => f.id === id) || null;
};

export const getMockTeams = (): Team[] => mockTeams;

export const getMockTeamById = (id: string): Team | null => {
  return mockTeams.find(t => t.id === id) || null;
};

export const getMockCompetitions = (): Competition[] => mockCompetitions;

export const getMockLeagueTable = (): LeagueTableRow[] => {
  return mockTeams.map((team, index) => ({
    position: index + 1,
    team,
    played: 38,
    won: 25 - index * 2,
    drawn: 8,
    lost: 5 + index * 2,
    goalsFor: 80 - index * 3,
    goalsAgainst: 25 + index * 2,
    goalDifference: 55 - index * 5,
    points: 83 - index * 6,
    form: team.form,
    lastUpdated: new Date().toISOString()
  }));
};

export const getMockMatchStats = (fixtureId: string): MatchStats => {
  const generateTeamStats = (): TeamStats => ({
    shotsOnTarget: Math.floor(Math.random() * 8) + 2,
    totalShots: Math.floor(Math.random() * 12) + 8,
    corners: Math.floor(Math.random() * 8) + 2,
    fouls: Math.floor(Math.random() * 8) + 8,
    yellowCards: Math.floor(Math.random() * 3),
    redCards: Math.random() > 0.9 ? 1 : 0,
    possession: Math.floor(Math.random() * 40) + 30,
    passAccuracy: Math.floor(Math.random() * 20) + 75,
    offsides: Math.floor(Math.random() * 4),
    passesCompleted: Math.floor(Math.random() * 200) + 300,
    passesAttempted: Math.floor(Math.random() * 250) + 350,
    crossesCompleted: Math.floor(Math.random() * 5) + 2,
    crossesAttempted: Math.floor(Math.random() * 8) + 5,
    tacklesWon: Math.floor(Math.random() * 8) + 5,
    tacklesAttempted: Math.floor(Math.random() * 12) + 8,
    interceptions: Math.floor(Math.random() * 6) + 3,
    saves: Math.floor(Math.random() * 4) + 2,
    blocks: Math.floor(Math.random() * 3) + 1,
    clearances: Math.floor(Math.random() * 8) + 5
  });

  const homeStats = generateTeamStats();
  const awayStats = generateTeamStats();
  
  // Ensure possession adds up to 100
  const totalPossession = homeStats.possession + awayStats.possession;
  homeStats.possession = Math.round((homeStats.possession / totalPossession) * 100);
  awayStats.possession = 100 - homeStats.possession;

  return {
    fixtureId,
    homeTeamStats: homeStats,
    awayTeamStats: awayStats,
    leagueAverages: {
      shotsOnTarget: 5.2,
      totalShots: 13.1,
      corners: 5.8,
      fouls: 11.4,
      yellowCards: 2.1,
      redCards: 0.1,
      possession: 50,
      passAccuracy: 82.5,
      offsides: 2.3,
      passesCompleted: 450,
      passesAttempted: 520,
      crossesCompleted: 3.5,
      crossesAttempted: 8.2,
      tacklesWon: 7.8,
      tacklesAttempted: 12.3,
      interceptions: 4.6,
      saves: 3.2,
      blocks: 1.8,
      clearances: 7.5
    },
    lastUpdated: new Date().toISOString(),
    timeline: [], // Could be expanded with match events
    playerRatings: [] // Could be expanded with player ratings
  };
};

export const getMockAIInsights = (fixtureId: string): AIInsight[] => {
  const insights: AIInsight[] = [
    {
      id: `${fixtureId}-insight-1`,
      title: 'Over 2.5 Goals',
      description: 'Both teams have strong attacking records and leaky defenses. Expect an open, high-scoring encounter.',
      confidence: 'high',
      market: 'Goals',
      odds: 1.85,
      supportingData: [
        'Home team averaging 2.3 goals per game',
        'Away team conceding 1.8 goals per game',
        'Last 5 meetings produced 3.2 goals per game'
      ]
    },
    {
      id: `${fixtureId}-insight-2`,
      title: 'Both Teams to Score',
      description: 'Both sides have reliable goal-scorers and have found the net in recent matches.',
      confidence: 'medium',
      market: 'Both Teams to Score',
      odds: 1.65,
      supportingData: [
        'Home team scored in 8/10 last games',
        'Away team scored in 7/10 last games',
        'Both teams scored in 4/5 recent H2H meetings'
      ]
    },
    {
      id: `${fixtureId}-insight-3`,
      title: 'Over 9.5 Corners',
      description: 'Expect plenty of attacking play down the flanks leading to corner opportunities.',
      confidence: 'medium',
      market: 'Corners',
      odds: 1.90,
      supportingData: [
        'Home team averaging 6.2 corners per game',
        'Away team averaging 5.8 corners per game',
        'Both teams prefer wide attacking play'
      ]
    },
    {
      id: `${fixtureId}-insight-4`,
      title: 'Home Team -1 Handicap',
      description: 'Home advantage and superior form make them strong favorites.',
      confidence: 'low',
      market: 'Handicap',
      odds: 2.45,
      supportingData: [
        'Home team won last 4 home games',
        'Away team lost 3/5 recent away games',
        'Home team has better squad depth'
      ]
    }
  ];

  return insights;
};

export const getMockPlayerStats = (fixtureId: string): PlayerStats[] => {
  const playerNames = [
    'John Smith', 'Mike Johnson', 'David Wilson', 'Chris Brown',
    'James Davis', 'Robert Miller', 'William Garcia', 'Thomas Anderson'
  ];

  return playerNames.map((name, index) => ({
    id: `${fixtureId}-player-${index + 1}`,
    name,
    position: ['GK', 'DF', 'DF', 'MF', 'MF', 'MF', 'FW', 'FW'][index],
    team: index < 4 ? 'home' : 'away',
    minutesPlayed: Math.floor(Math.random() * 90) + 45,
    goals: Math.random() > 0.8 ? 1 : 0,
    assists: Math.random() > 0.85 ? 1 : 0,
    shots: Math.floor(Math.random() * 4),
    shotsOnTarget: Math.floor(Math.random() * 2),
    passes: Math.floor(Math.random() * 50) + 20,
    passAccuracy: Math.floor(Math.random() * 20) + 75,
    tackles: Math.floor(Math.random() * 4),
    interceptions: Math.floor(Math.random() * 3),
    fouls: Math.floor(Math.random() * 3),
    yellowCards: Math.random() > 0.9 ? 1 : 0,
    redCards: 0,
    rating: +(Math.random() * 3 + 6).toFixed(1)
  }));
};

export const searchMockTeams = (query: string): Team[] => {
  if (!query.trim()) return [];
  
  const searchTerm = query.toLowerCase();
  return mockTeams.filter(team => 
    team.name.toLowerCase().includes(searchTerm) ||
    team.shortName.toLowerCase().includes(searchTerm)
  );
};
