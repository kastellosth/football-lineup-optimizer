export type Foot = "Left" | "Right" | "Both" | "";

 export type Lane = "DF" | "MF" | "FW";
export type WeaknessLevel = "critical" | "poor" | "weak" | "average" | "good";
export type WeaknessSeverity = "high" | "medium" | "low";

export interface WeaknessBreakdown {
  rule: string;
  weight: number;
  triggered: boolean;
}

export interface WeaknessAnalysis {
  score: number;
  breakdown: WeaknessBreakdown[];
  severity: WeaknessSeverity;
  level: WeaknessLevel;
}

export interface Rule {
  id: string;
  lane: Lane | "ANY";
  priority: number;  
  when: (p: OppRow, read: (p: OppRow, k: string) => number) => boolean;
  tip: (p: OppRow) => string;
  tags?: string[];
  uses: string[];
}

export interface Attributes {
  [key: string]: number; 
}

export type OppRow = {
  name: string;
  position: string;
  slot?: string;
  bestFoot?: "Left" | "Right";
  overall?: number;
  attributes: Attributes;
  team?: string;
};

export interface Player {
  name: string;
  shirtNumber: number;
  nationality: string;
  position: string;
  height: number;
  weight: number;
  slot?: string;  
  bestFoot?: "Left" | "Right";
  overall: number;
  formation: string;
  team?: string;
  attributes: Attributes;
}

export interface ParseResult {
  players: Player[];
  stats: {
    importedCount: number;
    playersWithMissingAttrsCount: number;
    hadMissingAttrs: boolean;
  };
  playersWithMissingAttrs: string[];
  extraColumns?: string[];
}

 export interface OpponentInsights {
  backlinePace: number;
  backlineAerial: number;
  midfieldStamina: number;
  midfieldPress: number;
  attackSpeed: number;
  attackFinishing: number;
  weakFullbackSide?: "L" | "R" | null;
   weaknesses?: {
    DF?: WeaknessAnalysis;
    MF?: WeaknessAnalysis;
    FW?: WeaknessAnalysis;
  };
}

export interface Assignment {
  my: Player;
  position: string;
  cost?: number;
}

export interface PitchPlayer {
  name: string;
  number: number;
}

export interface Squad {
  gk: PitchPlayer | null;
  df: PitchPlayer[];
  cdm: PitchPlayer[];
  cm: PitchPlayer[];
  cam: PitchPlayer[];
  fw: PitchPlayer[];
}

export interface TeamData {
  style: { color: string; numberColor: string; nameColor: string };
  squad: Squad;
}

export interface OptimizationResult {
  formation: string;
  assignment: Assignment[];
  totalCost: number;
  homeTeam: TeamData;
  awayTeam: TeamData;
  opponentFormation: string;
  opponentAnalysis: OpponentInsights;
  finalSuggestion: string;
}

export interface LineupResult {
  formation: string;
  assignments: Assignment[];
  totalCost: number;
}

export interface OptimizerProps {
  onOptimization?: (homeTeam: TeamData, awayTeam: TeamData) => void;
}

export interface WeakEntry {
  p: OppRow;
  score: number;
  flags: string[];
  analysis?: WeaknessAnalysis;
}

export interface LaneAnalysis {
  ranked: WeakEntry[];
  weakest?: WeakEntry;
}

export type OpponentAnalysisByLane = Record<Lane, LaneAnalysis>;

export type PositionFilter = "All" | "GK" | "DF" | "MF" | "FW";

export interface PlayerCardData {
  name: string;
  position: string;
  slot?: string;
  overall: number;
  attributes: Attributes;
  weaknessAnalysis?: WeaknessAnalysis;
}