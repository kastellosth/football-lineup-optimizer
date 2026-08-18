import type { OppRow, Lane,WeaknessLevel,Rule ,WeaknessAnalysis,WeaknessBreakdown } from "../types";

const THRESHOLDS = {
  critical: 30, 
  poor: 40,    
  weak: 55,     
  average: 70,  
};

export function getWeaknessLevel(value: number): WeaknessLevel {
  if (value <= THRESHOLDS.critical) return "critical";
  if (value <= THRESHOLDS.poor) return "poor";
  if (value <= THRESHOLDS.weak) return "weak";
  if (value <= THRESHOLDS.average) return "average";
  return "good";
}
const readAttr = (p: OppRow, key: string): number => {
  const val = p.attributes?.[key.toLowerCase()];
  if (val === undefined || val === null) return 100; 
  
  return val <= 1 ? val * 100 : val;
};

export const OPP_RULES: Rule[] = [
  // ----- DEFENDERS  -----
  {
    id: "df-press-first-touch",
    lane: "DF",
    priority: 1,
    uses: ["firstTouch", "composure"],
    when: (p) => {
      const firstTouch = readAttr(p, "firstTouch");
      const composure = readAttr(p, "composure");
      return firstTouch < THRESHOLDS.poor && composure < THRESHOLDS.poor;
    },
    tip: () => "Press tight on first touch; set a sideline trap and jump the square/back pass.",
    tags: ["pressing", "turnover"],
  },
  {
    id: "df-run-in-behind",
    lane: "DF",
    priority: 1,
    uses: ["pace", "acceleration"],
    when: (p) => {
      const pace = readAttr(p, "pace");
      const acceleration = readAttr(p, "acceleration");
      return pace < THRESHOLDS.weak || acceleration < THRESHOLDS.weak;
    },
    tip: () => "Target his channel with depth runs and 3rd-man through balls.",
    tags: ["pace", "runs"],
  },
  {
    id: "df-aerial-weakness",
    lane: "DF",
    priority: 2,
    uses: ["jumping", "heading"],
    when: (p) => {
      const jumping = readAttr(p, "jumping");
      const heading = readAttr(p, "heading");
      return Math.min(jumping, heading) < THRESHOLDS.weak;
    },
    tip: () => "Attack far-post crosses and second balls on his side; load the back post.",
    tags: ["aerial", "crosses"],
  },
  {
    id: "df-positioning",
    lane: "DF",
    priority: 2,
    uses: ["positioning", "anticipation"],
    when: (p) => {
      const positioning = readAttr(p, "positioning");
      const anticipation = readAttr(p, "anticipation");
      return positioning < THRESHOLDS.poor || anticipation < THRESHOLDS.poor;
    },
    tip: () => "Exploit space behind with early through balls; isolate 1v1 situations.",
    tags: ["positioning", "space"],
  },

  // ----- MIDFIELDERS -----
  {
    id: "mf-central-trap",
    lane: "MF",
    priority: 1,
    uses: ["composure", "firstTouch"],
    when: (p) => {
      const composure = readAttr(p, "composure");
      const firstTouch = readAttr(p, "firstTouch");
      return composure < THRESHOLDS.poor || firstTouch < THRESHOLDS.poor;
    },
    tip: () => "Jump as he receives; close inside shoulder; force him back or long.",
    tags: ["pressing", "turnover"],
  },
  {
    id: "mf-progression-limited",
    lane: "MF",
    priority: 2,
    uses: ["vision", "passing"],
    when: (p) => {
      const vision = readAttr(p, "vision");
      const passing = readAttr(p, "passing");
      return Math.min(vision, passing) < THRESHOLDS.poor;
    },
    tip: () => "Screen central lanes; overplay touchline; remove wall-pass options.",
    tags: ["interception", "positioning"],
  },
  {
    id: "mf-fatigue-press",
    lane: "MF",
    priority: 2,
    uses: ["stamina", "workRate"],
    when: (p) => {
      const stamina = readAttr(p, "stamina");
      const workRate = readAttr(p, "workRate");
      return stamina < THRESHOLDS.poor || workRate < THRESHOLDS.weak;
    },
    tip: () => "Keep tempo high; rotate runners to re-press him late.",
    tags: ["fatigue", "pressing"],
  },
  {
    id: "mf-defensive-awareness",
    lane: "MF",
    priority: 2,
    uses: ["positioning", "marking"],
    when: (p) => {
      const positioning = readAttr(p, "positioning");
      const marking = readAttr(p, "marking");
      return positioning < THRESHOLDS.weak || marking < THRESHOLDS.weak;
    },
    tip: () => "Exploit gaps between lines; third-man runs will find space.",
    tags: ["space", "runs"],
  },

  // ----- FORWARDS -----
  {
    id: "fw-deny-turn",
    lane: "FW",
    priority: 2,
    uses: ["firstTouch", "technique"],
    when: (p) => {
      const firstTouch = readAttr(p, "firstTouch");
      const technique = readAttr(p, "technique");
      return firstTouch < THRESHOLDS.poor || technique < THRESHOLDS.weak;
    },
    tip: () => "Crowd first touch; show to weaker side; deny the turn in the box.",
    tags: ["pressing", "defending"],
  },
  {
    id: "fw-shot-quality",
    lane: "FW",
    priority: 1,
    uses: ["finishing", "composure"],
    when: (p) => {
      const finishing = readAttr(p, "finishing");
      const composure = readAttr(p, "composure");
      return finishing < THRESHOLDS.poor || composure < THRESHOLDS.weak;
    },
    tip: () => "Force tight angles; delay to allow cover; contest second phase.",
    tags: ["defending", "positioning"],
  },
  {
    id: "fw-movement-static",
    lane: "FW",
    priority: 2,
    uses: ["offTheBall", "anticipation"],
    when: (p) => {
      const offTheBall = readAttr(p, "offTheBall");
      const anticipation = readAttr(p, "anticipation");
      return offTheBall < THRESHOLDS.poor || anticipation < THRESHOLDS.weak;
    },
    tip: () => "Hold a higher line; compress space so he receives to feet.",
    tags: ["defending", "line"],
  },
  {
    id: "fw-aerial-cutback",
    lane: "FW",
    priority: 3,
    uses: ["jumping", "heading"],
    when: (p) => {
      const jumping = readAttr(p, "jumping");
      const heading = readAttr(p, "heading");
      return Math.min(jumping, heading) < THRESHOLDS.weak;
    },
    tip: () => "Prefer cutbacks over floated crosses; arrive late to penalty spot.",
    tags: ["attacking", "crosses"],
  },
  {
    id: "fw-pace-exploit",
    lane: "FW",
    priority: 2,
    uses: ["pace", "acceleration"],
    when: (p) => {
      const pace = readAttr(p, "pace");
      const acceleration = readAttr(p, "acceleration");
      return pace < THRESHOLDS.weak || acceleration < THRESHOLDS.weak;
    },
    tip: () => "Press aggressively; force him deep; he won't run in behind.",
    tags: ["pressing", "defending"],
  },
];

export const PRESS_TRIGGERS = [
  "Poor first touch under pressure",
  "Back pass or square pass in build-up",
  "Full-back receiving isolated near the touchline",
  "Midfielder receiving facing own goal",
  "Long aerial into an insecure receiver",
];


export function calculateWeaknessScore(player: OppRow, lane: Lane): WeaknessAnalysis {
  const applicableRules = OPP_RULES.filter((r) => r.lane === lane || r.lane === "ANY");
  
  const breakdown: WeaknessBreakdown[] = applicableRules.map((rule) => {
    const triggered = rule.when(player, readAttr);
    const weight = triggered ? (4 - rule.priority) * 10 : 0;
    
    return {
      rule: rule.id,
      weight,
      triggered,
    };
  });

  const totalScore = breakdown.reduce((sum, b) => sum + b.weight, 0);
  const maxPossibleScore = applicableRules.length * 30; 
  const normalizedScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

  let severity: "high" | "medium" | "low" = "low";
  if (normalizedScore >= 50) severity = "high";
  else if (normalizedScore >= 25) severity = "medium";

  const relevantAttrs = new Set(applicableRules.flatMap((r) => r.uses));
  const attrValues = Array.from(relevantAttrs).map((attr) => readAttr(player, attr));
  const avgAttr = attrValues.length > 0 
    ? attrValues.reduce((sum, val) => sum + val, 0) / attrValues.length 
    : 50;
  const level = getWeaknessLevel(avgAttr);

  return {
    score: normalizedScore,
    breakdown: breakdown.filter((b) => b.triggered),
    severity,
    level,
  };
}


export function weaknessScore(player: OppRow, lane: Lane): number {
  return calculateWeaknessScore(player, lane).score;
}


export function flagsForPlayer(player: OppRow, lane: Lane): string[] {
  return OPP_RULES.filter((r) => (r.lane === lane || r.lane === "ANY") && r.when(player, readAttr))
    .map((r) => r.tip(player));
}


export function coachTip(player: OppRow, lane: Lane): string {
  const triggered = OPP_RULES.filter(
    (r) => (r.lane === lane || r.lane === "ANY") && r.when(player, readAttr)
  ).sort((a, b) => a.priority - b.priority); 

  return triggered.length > 0 ? triggered[0].tip(player) : "No significant weaknesses detected.";
}


export function validateAttributes(player: OppRow, requiredAttrs: string[]): boolean {
  return requiredAttrs.every((attr) => player.attributes?.[attr.toLowerCase()] !== undefined);
}


export function getPressTriggersForPlayer(player: OppRow, lane: Lane): string[] {
  const analysis = calculateWeaknessScore(player, lane);
  const triggers: string[] = [];


  if (analysis.breakdown.some((b) => b.rule.includes("first-touch"))) {
    triggers.push(PRESS_TRIGGERS[0]); 
  }
  if (analysis.breakdown.some((b) => b.rule.includes("press") || b.rule.includes("central-trap"))) {
    triggers.push(PRESS_TRIGGERS[1]); 
  }
  if (lane === "DF" && analysis.breakdown.some((b) => b.rule.includes("positioning"))) {
    triggers.push(PRESS_TRIGGERS[2]); 
  }
  if (lane === "MF" && analysis.breakdown.some((b) => b.rule.includes("central"))) {
    triggers.push(PRESS_TRIGGERS[3]); 
  }
  if (analysis.breakdown.some((b) => b.rule.includes("aerial"))) {
    triggers.push(PRESS_TRIGGERS[4]); 
  }

  return [...new Set(triggers)]; 
}