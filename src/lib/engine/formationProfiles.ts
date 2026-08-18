/**
 * Formation Profiles Configuration
 * 
 * Defines all available football formations with their tactical characteristics, key position attributes,
 * and counter-formation relationships. Each formation includes role definitions for every position slot,
 * required player attributes, playstyles, strengths/weaknesses, and which formations counter it.
 */

export const FORMATIONS = [
  "4-3-3",
  "4-4-2",
  "4-2-3-1",
  "3-5-2",
  "5-3-2",
  "3-4-3",
  "4-5-1",
] as const;

export type FormationType = typeof FORMATIONS[number];

export function normalizeFormation(f: string): string {
  const map: Record<string, string> = {
    "433": "4-3-3",
    "442": "4-4-2",
    "4231": "4-2-3-1",
    "352": "3-5-2",
    "532": "5-3-2",
    "343": "3-4-3",
    "451": "4-5-1",
  };
  return map[f] ?? f;
}

export interface FormationProfile {
  id: string;
  mode: "Attacking" | "Defensive" | "Balanced";
  baseFormation?: string | null;
  description: string;

  keyAttributes: {
    [slot: string]: {
      role: string;
      attributes: string[];
    };
  };

  playstyles: string[];
  pros: string[];
  cons: string[];

  opponentCounters: {
    exploit: string[];
    suggestedFormations: string[];
  };
}


export const formationProfiles: FormationProfile[] = [
  {
    id: "3-5-2",
    mode: "Balanced",
    description:
      "The 3-5-2 uses three central defenders, two wing-backs, three central midfielders, and two strikers. It provides balance between defense and attack, strong midfield presence, and width from wing-backs.",
    keyAttributes: {
      GK: { role: "goalkeeper", attributes: ["GKReflexes", "GKPositioning", "GKHandling", "GKDiving", "GKKicking"] },
      ST1: { role: "striker", attributes: ["Finishing", "ShotPower", "Composure", "Pace"] },
      ST2: { role: "striker", attributes: ["Finishing", "ShotPower", "Composure", "Pace"] },
      CAM: { role: "creator", attributes: ["Passing", "BallControl"] },
      LWB: { role: "wing-back", attributes: ["Stamina", "Pace", "ShortPassing", "LongPassing"] },
      RWB: { role: "wing-back", attributes: ["Stamina", "Pace", "ShortPassing", "LongPassing"] },
      CM1: { role: "midfield", attributes: ["Passing", "StandingTackle"] },
      CM2: { role: "midfield", attributes: ["Passing", "StandingTackle"] },
      CM3: { role: "midfield", attributes: ["Passing", "StandingTackle"] },
      CB1: { role: "defender", attributes: ["Strength", "Balance", "StandingTackle", "SlidingTackle", "DefensiveAwareness", "Interceptions"] },
      CB2: { role: "defender", attributes: ["Strength", "Balance", "StandingTackle", "SlidingTackle", "DefensiveAwareness", "Interceptions"] },
      CB3: { role: "defender", attributes: ["Strength", "Balance", "StandingTackle", "SlidingTackle", "DefensiveAwareness", "Interceptions"] }
    },
    playstyles: ["possession", "quick build-up", "counter"],
    pros: ["strong midfield control", "dual striker threat", "flexible build-up"],
    cons: [
      "requires disciplined wing-backs",
      "can be stretched wide",
      "vulnerable to overloads on flanks"
    ],
    opponentCounters: {
      exploit: ["attack wide areas", "force wing-backs deep"],
      suggestedFormations: ["4-3-3", "4-2-3-1"]
    }
  },
  {
    id: "4-3-3",
    mode: "Attacking",
    description:
      "The 4-3-3 formation emphasizes attacking width with wingers, a lone striker, and three central midfielders. Strong at stretching defenses and creating chances from wide areas.",
    keyAttributes: {
      GK: { role: "goalkeeper", attributes: ["GKReflexes", "GKPositioning", "GKHandling", "GKDiving", "GKKicking"] },
      ST: { role: "striker", attributes: ["Finishing", "ShotPower", "Composure", "Positioning", "Reactions", "Pace"] },
      LW: { role: "winger", attributes: ["Pace", "Agility", "Balance", "Finishing"] },
      RW: { role: "winger", attributes: ["Pace", "Agility", "Balance", "Finishing"] },
      CM1: { role: "midfield", attributes: ["Passing", "Composure"] },
      CM2: { role: "midfield", attributes: ["Passing", "StandingTackle"] },
      CM3: { role: "midfield", attributes: ["Passing", "Stamina"] },
      LB: { role: "full-back", attributes: ["Stamina", "Pace", "StandingTackle", "SlidingTackle"] },
      RB: { role: "full-back", attributes: ["Stamina", "Pace", "StandingTackle", "SlidingTackle"] },
      CB1: { role: "defender", attributes: ["Strength", "Balance", "HeadingAccuracy", "Jumping", "StandingTackle", "SlidingTackle"] },
      CB2: { role: "defender", attributes: ["Strength", "Balance", "HeadingAccuracy", "Jumping", "StandingTackle", "SlidingTackle"] }
    },
    playstyles: ["wing-play", "possession", "pressing"],
    pros: ["attacking width", "good pressing options", "clear midfield balance"],
    cons: [
      "lone striker can be isolated",
      "requires strong wingers",
      "can be outnumbered in midfield"
    ],
    opponentCounters: {
      exploit: ["overload midfield", "deny service to wingers"],
      suggestedFormations: ["4-4-2", "3-5-2"]
    }
  },
  {
    id: "4-4-2",
    mode: "Balanced",
    description:
      "The 4-4-2 formation uses two banks of four and two strikers, offering balanced defense and attack. Strong in transitions and compact defensively.",
    keyAttributes: {
      GK: { role: "goalkeeper", attributes: ["GKReflexes", "GKPositioning", "GKHandling", "GKDiving", "GKKicking"] },
      ST1: { role: "striker", attributes: ["Finishing", "ShotPower", "Composure", "Positioning", "Reactions", "Pace"] },
      ST2: { role: "striker", attributes: ["Finishing", "ShotPower", "Composure", "Positioning", "Reactions", "Strength"] },
      LM: { role: "wide-mid", attributes: ["Stamina", "Pace", "ShortPassing", "LongPassing"] },
      RM: { role: "wide-mid", attributes: ["Stamina", "Pace", "ShortPassing", "LongPassing"] },
      CM1: { role: "midfield", attributes: ["StandingTackle", "SlidingTackle", "DefensiveAwareness", "Interceptions", "ShortPassing", "LongPassing"] },
      CM2: { role: "midfield", attributes: ["StandingTackle", "SlidingTackle", "DefensiveAwareness", "Interceptions", "ShortPassing", "LongPassing"] },
      LB: { role: "full-back", attributes: ["Stamina", "StandingTackle", "SlidingTackle", "DefensiveAwareness", "Interceptions", "Pace"] },
      RB: { role: "full-back", attributes: ["Stamina", "StandingTackle", "SlidingTackle", "DefensiveAwareness", "Interceptions", "Pace"] },
      CB1: { role: "defender", attributes: ["Strength", "Balance", "HeadingAccuracy", "Jumping", "StandingTackle", "SlidingTackle"] },
      CB2: { role: "defender", attributes: ["Strength", "Balance", "HeadingAccuracy", "Jumping", "StandingTackle", "SlidingTackle"] }
    },
    playstyles: ["counter", "direct", "balanced"],
    pros: ["compact defensively", "two strikers create threat", "simple structure"],
    cons: [
      "midfield can be outnumbered",
      "predictable build-up",
      "requires disciplined wingers"
    ],
    opponentCounters: {
      exploit: ["overload midfield", "dominate possession centrally"],
      suggestedFormations: ["4-3-3", "3-5-2"]
    }
  },
  {
    id: "4-2-3-1",
    mode: "Balanced",
    description:
      "The 4-2-3-1 formation uses two defensive midfielders, three attacking midfielders, and one striker. Offers defensive solidity and attacking flexibility through the midfield line of three.",
    keyAttributes: {
      GK: { role: "goalkeeper", attributes: ["GKReflexes", "GKPositioning", "GKHandling", "GKDiving", "GKKicking"] },
      ST: { role: "striker", attributes: ["Finishing", "ShotPower", "Composure", "Positioning", "Reactions", "Pace"] },
      CAM: { role: "creator", attributes: ["Passing", "BallControl"] },
      LAM: { role: "attacking-mid", attributes: ["Pace", "Agility", "Balance", "Finishing"] },
      RAM: { role: "attacking-mid", attributes: ["Pace", "Agility", "Balance", "Finishing"] },
      CDM1: { role: "defensive-mid", attributes: ["StandingTackle", "SlidingTackle", "DefensiveAwareness", "Interceptions", "Positioning", "Reactions"] },
      CDM2: { role: "defensive-mid", attributes: ["StandingTackle", "SlidingTackle", "DefensiveAwareness", "Interceptions", "Positioning", "Reactions"] },
      LB: { role: "full-back", attributes: ["Stamina", "Pace", "StandingTackle", "SlidingTackle"] },
      RB: { role: "full-back", attributes: ["Stamina", "Pace", "StandingTackle", "SlidingTackle"] },
      CB1: { role: "defender", attributes: ["Strength", "Balance", "HeadingAccuracy", "Jumping", "StandingTackle", "SlidingTackle"] },
      CB2: { role: "defender", attributes: ["Strength", "Balance", "HeadingAccuracy", "Jumping", "StandingTackle", "SlidingTackle"] }
    },
    playstyles: ["possession", "pressing", "counter"],
    pros: ["defensive solidity", "flexible attack options", "good central coverage"],
    cons: [
      "lone striker can be isolated",
      "wide players must work hard",
      "relies on CAM creativity"
    ],
    opponentCounters: {
      exploit: ["overload lone striker", "exploit flanks if wide AMs stay high"],
      suggestedFormations: ["4-4-2", "3-5-2"]
    }
  },
  {
    id: "3-4-3",
    mode: "Attacking",
    description:
      "The 3-4-3 is one of the most attacking formations, using three defenders, four midfielders with dynamic wing-backs, and three forwards to maximize width and attacking pressure. It overwhelms defenses with width and forward runs but is vulnerable centrally.",
    keyAttributes: {
      GK: { role: "goalkeeper", attributes: ["GKReflexes", "GKPositioning", "GKHandling", "GKDiving", "GKKicking"] },
      ST: { role: "central striker", attributes: ["Finishing", "ShotPower", "Composure", "Positioning", "Reactions", "Strength"] },
      LW: { role: "wide forward", attributes: ["Pace", "Agility", "Balance", "Finishing"] },
      RW: { role: "wide forward", attributes: ["Pace", "Agility", "Balance", "Finishing"] },
      LWB: { role: "wing-back", attributes: ["Stamina", "Pace", "ShortPassing", "LongPassing"] },
      RWB: { role: "wing-back", attributes: ["Stamina", "Pace", "ShortPassing", "LongPassing"] },
      CM1: { role: "midfield", attributes: ["Passing", "StandingTackle", "SlidingTackle"] },
      CM2: { role: "midfield", attributes: ["Passing", "StandingTackle", "SlidingTackle"] },
      CB1: { role: "defender", attributes: ["Pace", "Positioning", "Reactions", "HeadingAccuracy"] },
      CB2: { role: "defender", attributes: ["Pace", "Positioning", "Reactions", "HeadingAccuracy"] },
      CB3: { role: "defender", attributes: ["Pace", "Positioning", "Reactions", "HeadingAccuracy"] }
    },
    playstyles: ["high press", "possession", "counter"],
    pros: [
      "relentless attacking pressure",
      "strong width",
      "multiple goal-scoring threats"
    ],
    cons: [
      "vulnerable to quick counters centrally",
      "heavy reliance on wing-backs",
      "defensive exposure if possession is lost"
    ],
    opponentCounters: {
      exploit: [
        "overload central midfield",
        "switch play quickly to expose wing-backs"
      ],
      suggestedFormations: ["4-2-3-1", "4-3-3", "4-4-2"]
    }
  },
  {
    id: "4-5-1",
    mode: "Defensive",
    baseFormation: null,
    description:
      "The 4-5-1 is compact and defensive, using four defenders, five midfielders, and a lone striker. It emphasizes midfield control and defensive solidity, frustrating opponents while enabling quick counters.",
    keyAttributes: {
      GK: { role: "goalkeeper", attributes: ["GKReflexes", "GKPositioning", "GKHandling", "GKDiving", "GKKicking"] },
      ST: { role: "striker", attributes: ["Strength", "Balance", "Finishing", "ShotPower", "Composure", "Positioning"] },
      LM: { role: "wide-mid", attributes: ["Pace", "Stamina", "ShortPassing", "LongPassing"] },
      RM: { role: "wide-mid", attributes: ["Pace", "Stamina", "ShortPassing", "LongPassing"] },
      CM1: { role: "midfield", attributes: ["Passing", "Stamina"] },
      CM2: { role: "midfield", attributes: ["StandingTackle", "SlidingTackle", "DefensiveAwareness", "Interceptions", "Positioning", "Reactions"] },
      CM3: { role: "playmaker", attributes: ["Passing", "Composure"] },
      LB: { role: "full-back", attributes: ["Stamina", "StandingTackle", "SlidingTackle", "DefensiveAwareness", "Interceptions", "Pace"] },
      RB: { role: "full-back", attributes: ["Stamina", "StandingTackle", "SlidingTackle", "DefensiveAwareness", "Interceptions", "Pace"] },
      CB1: { role: "defender", attributes: ["Strength", "Balance", "Positioning", "Reactions", "HeadingAccuracy", "Jumping"] },
      CB2: { role: "defender", attributes: ["Strength", "Balance", "Positioning", "Reactions", "HeadingAccuracy", "Jumping"] }
    },
    playstyles: ["possession", "defensive", "counter"],
    pros: [
      "strong midfield control",
      "compact defensive structure",
      "effective for counter-attacks"
    ],
    cons: [
      "striker isolation",
      "limited attacking numbers",
      "requires high work rate from midfielders"
    ],
    opponentCounters: {
      exploit: [
        "stretch defensive block with wide play",
        "overload flanks with overlaps"
      ],
      suggestedFormations: ["4-3-3", "3-5-2", "4-2-3-1"]
    }
  },
  {
    id: "5-3-2",
    mode: "Defensive",
    baseFormation: null,
    description:
      "The 5-3-2 formation emphasizes defensive solidity with three central defenders and two attacking wing-backs, supported by three central midfielders and two forwards. It allows for controlled buildup, counter-attacks, and width through the wing-backs while maintaining a compact defensive structure.",
    keyAttributes: {
      GK: { role: "goalkeeper", attributes: ["GKReflexes", "GKPositioning", "GKHandling", "GKDiving", "GKKicking"] },
      ST1: { role: "striker", attributes: ["Finishing", "ShotPower", "Composure", "Strength", "Balance", "Positioning"] },
      ST2: { role: "striker", attributes: ["Finishing", "ShotPower", "Composure", "Pace"] },
      LWB: { role: "wing-back", attributes: ["Stamina", "Pace", "Positioning", "Reactions"] },
      RWB: { role: "wing-back", attributes: ["Stamina", "Pace", "Positioning", "Reactions"] },
      CM1: { role: "midfield", attributes: ["StandingTackle", "SlidingTackle", "DefensiveAwareness", "Interceptions", "ShortPassing", "LongPassing"] },
      CM2: { role: "midfield", attributes: ["Positioning", "Reactions", "Passing"] },
      CM3: { role: "midfield", attributes: ["StandingTackle", "SlidingTackle", "DefensiveAwareness", "Interceptions", "ShortPassing", "LongPassing"] },
      CB1: { role: "defender", attributes: ["Strength", "Balance", "HeadingAccuracy", "Jumping", "Positioning", "Reactions"] },
      CB2: { role: "defender", attributes: ["Strength", "Balance", "HeadingAccuracy", "Jumping", "Positioning", "Reactions"] },
      CB3: { role: "defender", attributes: ["Strength", "Balance", "HeadingAccuracy", "Jumping", "Positioning", "Reactions"] }
    },
    playstyles: ["defensive", "counter", "possession"],
    pros: [
      "strong defensive base",
      "natural width from wing-backs",
      "effective striker partnership"
    ],
    cons: [
      "reliance on wing-backs",
      "midfield can be overloaded by four-man setups",
      "vulnerable if caught in transitions"
    ],
    opponentCounters: {
      exploit: [
        "stretch the pitch with wide overloads",
        "quick transitions through midfield"
      ],
      suggestedFormations: ["4-2-3-1", "4-3-3"]
    }
  }
];