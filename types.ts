export interface Player {
  id: string;
  name: string;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  rating: number;
}

export interface TeamData {
  name: string;
  formation: string;
  averageRating: number;
  recentForm: ('W' | 'L' | 'D')[]; // Last 3 results e.g. ['W', 'W', 'L']
  homeOrAway: 'Home' | 'Away';
  keyPlayers: Player[]; // Simplified for input
}

export interface ScannedTeamData {
  teamName?: string;
  formation?: string;
  averageRating?: number;
  recentForm?: ('W' | 'L' | 'D')[];
}

export interface TacticalSettings {
  style: string;
  passing: string;
  pressing: string;
  aggression: string;
  offsideTrap: boolean;
  marking: string;
  tempo: string;
  focus: string; // e.g. Wing Play, Passing Game
}

export interface AnalysisReport {
  opponentIntel: {
    threatLevel: number; // 1-10
    keyWeakness: string;
    analysis: string;
  };
  tacticalBattlePlan: {
    recommendedFormation: string;
    winProbability: number; // 0-100
    settings: TacticalSettings;
    rationale: string;
    lineTactics: {
      forwards: string;
      midfielders: string;
      defenders: string;
    };
  };
  gameManagement: {
    substitutionStrategy: string;
    formationChangeTriggers: string;
    criticalThreats: string[];
  };
  prediction: {
    mostLikelyScore: string;
    keyToVictory: string;
  };
}

// Coach Alpha Types
export interface TutorialStep {
  title: string;
  instruction: string;
  location: string; // e.g., "Settings > Attack"
  reason: string;
}

export interface TutorialGuide {
  formationSteps: string[];
  formationVisualCheck: string;
  settingsSteps: TutorialStep[];
  substitutionPlan: {
    scenario: string;
    action: string;
  }[];
  commonMistakes: {
    mistake: string;
    fix: string;
  }[];
  coachEncouragement: string;
}

// DocMaster Types
export interface DocumentInsight {
  id: string;
  filename: string;
  type: string;
  keyInsights: string[];
  tacticalRules: string[];
  timestamp: number;
}

// Simulation Engine Types
export interface SimulationResult {
  coherence: {
    structural: number;
    behavioural: number;
    intensity: number;
    defensive: number;
    overall: number;
    feedback: string;
  };
  strengthAnalysis: {
    myPower: number;
    opponentPower: number;
    ratio: number;
    contextModifier: string;
  };
  prediction: {
    winChance: number;
    drawChance: number;
    lossChance: number;
    score: string;
  };
  scenarios: {
    name: string;
    winChance: number;
    coherence: number;
    impact: string;
  }[];
}
