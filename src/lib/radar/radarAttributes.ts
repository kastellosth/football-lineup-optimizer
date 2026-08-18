/**
 * Radar Chart Configuration
 * 
 * Defines the axes and attribute groupings for player radar charts, including separate
 * configurations for outfield players and goalkeepers, plus detailed attribute breakdowns.
 */

export const OUTFIELD_AXES = [
  "pace",
  "shooting",
  "passing",
  "dribbling",
  "defending",
  "physicality",
];

export const GOALKEEPER_AXES = [
  "gkdiving",
  "gkhandling",
 "gkreflexes",
   "gkkicking",
  "gkpositioning",
];

export const ABOVE_RADAR_GROUPS: { title: string; keys: string[] }[] = [
  {
    title: "Pace detail",
    keys: ["acceleration", "sprintSpeed"],
  },
  {
    title: "Shooting detail",
    keys: ["positioning", "finishing", "shotPower", "longShots", "volleys", "penalties"],
  },
  {
    title: "Passing detail",
    keys: ["vision", "crossing", "freeKickAccuracy", "shortPassing", "longPassing", "curve"],
  },
  {
    title: "Dribbling/Technique",
    keys: ["agility", "reactions", "balance", "dribbling", "ballControl", "composure"],
  },
  {
    title: "Defending detail",
    keys: ["interceptions", "headingAccuracy", "defensiveAwareness", "standingTackle", "slidingTackle"],
  },
  {
    title: "Physical detail",
    keys: ["jumping", "stamina", "strength", "aggression"],
  },
  {
    title: "Goalkeeping detail",
    keys: ["gkDiving", "gkHandling", "gkKicking", "gkPositioning", "gkreflexes"],
  },
];

// Converts attribute keys to human-readable labels for display
export const axisLabel = (key: string): string => {
  const nice: Record<string, string> = {
    overall: "Overall",
    paceAvg: "Pace",
    shootingAvg: "Shooting",
    passingAvg: "Passing",
    dribblingAvg: "Dribbling",
    defendingAvg: "Defending",
    physicalityAvg: "Physicality",
    goalkeepingAvg: "Goalkeeping",
    
  };
  return nice[key] ?? (key.charAt(0).toUpperCase() + key.slice(1));
};

export const RADAR_AXES: Record<string, string[]> = {
  DEFAULT: OUTFIELD_AXES,
  GK: GOALKEEPER_AXES,
};