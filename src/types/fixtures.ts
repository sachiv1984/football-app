export interface Team {
  id: number;
  name: string;
  shortName: string;
  logo: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface Fixture {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  competition: {
    id: number;
    name: string;
    logo: string;
  };
  date: string;
  time: string;
  status: 'scheduled' | 'live' | 'finished' | 'postponed';
  venue?: string;
  round?: string;
}

export interface MatchStats {
  fixtureId: number;
  homeStats: TeamStats;
  awayStats: TeamStats;
  leagueAverages: TeamStats;
}

export interface TeamStats {
  shotsOnTarget: number;
  corners: number;
  foulsCommitted: number;
  yellowCards: number;
  redCards: number;
  goalsScored: number;
  possession: number;
  passes: number;
  passAccuracy: number;
}
