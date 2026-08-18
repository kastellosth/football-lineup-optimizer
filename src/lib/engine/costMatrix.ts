import {
  findOpponentForSlotAdvanced,
  computeAdvancedMatchupScore,
  normalizeKey,
} from "@/lib/engine/advancedLogic";

// Configuration interface for controlling optimization weights and penalties
export interface OptimizerConfig {
  attributeWeight: number;
  matchupWeight: number;
  fitPenaltyMultiplier: number;
  debug: boolean;
}

// Default configuration: 60% attributes, 40% matchups, 15x fit penalty multiplier
export const DEFAULT_CONFIG: OptimizerConfig = {
  attributeWeight: 0.6,
  matchupWeight: 0.4,
  fitPenaltyMultiplier: 15,
  debug: false
};

// Calculates penalty for playing a player on their weak foot  
function calculateFootPenalty(player: any, slot: string, debug: boolean = false): number {
  const slotUpper = slot.toUpperCase();

   const isLeftSide = slotUpper.includes('L') && !slotUpper.includes('C');
  const isRightSide = slotUpper.includes('R') && !slotUpper.includes('C');

  if (!isLeftSide && !isRightSide) return 0;

   const foot = player.preferredfoot || player.foot || player.preferedfoot ||
    player.preferred_foot || player.weakfoot;

   if (!foot) {
    if (slotUpper.includes('W')) return 8;  
    if (slotUpper.includes('WB')) return 6;  
    if (slotUpper.includes('B')) return 4;  
    if (slotUpper.includes('AM')) return 3;  
    return 2;  
  }

   let normalizedFoot: 'Right' | 'Left' | 'Both';

  if (typeof foot === 'number') {
    if (foot === 1) normalizedFoot = 'Right';
    else if (foot === 2) normalizedFoot = 'Left';
    else normalizedFoot = 'Both';
  } else {
    const footStr = foot.toString().toLowerCase();
    if (footStr.includes('left')) normalizedFoot = 'Left';
    else if (footStr.includes('right')) normalizedFoot = 'Right';
    else normalizedFoot = 'Both';
  }

   if (normalizedFoot === 'Both') return 0;

  let penalty = 0;

   if (isLeftSide && normalizedFoot === 'Right') {
    if (slotUpper.includes('LW')) penalty = 18;  
    else if (slotUpper.includes('LWB')) penalty = 12;
    else if (slotUpper.includes('LB')) penalty = 10;
    else if (slotUpper.includes('LAM')) penalty = 6;
    else if (slotUpper.includes('LM')) penalty = 10;

     if (penalty > 0 && debug) {
      const playerName = player.firstname
        ? `${player.firstname} ${player.lastname}`
        : player.name;
      console.log(`${playerName} (Right-footed) on ${slot}: -${penalty} foot penalty`);
    }
  }

   if (isRightSide && normalizedFoot === 'Left') {
    if (slotUpper.includes('RW')) penalty = 18;
    else if (slotUpper.includes('RWB')) penalty = 12;
    else if (slotUpper.includes('RB')) penalty = 10;
    else if (slotUpper.includes('RAM')) penalty = 6;
    else if (slotUpper.includes('RM')) penalty = 10;

     if (penalty > 0 && debug) {
      const playerName = player.firstname
        ? `${player.firstname} ${player.lastname}`
        : player.name;
      console.log(`${playerName} (Left-footed) on ${slot}: -${penalty} foot penalty`);
    }
  }

  return penalty;
}

// Builds the cost matrix for the Hungarian algorithm to find optimal player-to-position assignments
export function buildCostMatrix(
  myPlayers: any[],
  formation: any,
  oppPlayers: any[],
  config: OptimizerConfig = DEFAULT_CONFIG
): { costMatrix: number[][]; slots: string[]; bestGKIndex: number } {

   if (!formation.keyAttributes) {
    console.warn(`Formation ${formation.id} missing keyAttributes`);
    return { costMatrix: [], slots: [], bestGKIndex: -1 };
  }

  // Extract all position slots from the formation
  const slots = Object.keys(formation.keyAttributes);
  if (config.debug) {
    console.log(`Formation ${formation.id} loaded with ${slots.length} positions`);
    console.log(`Config: Attr=${config.attributeWeight * 100}%, Matchup=${config.matchupWeight * 100}%`);
  }

  // Find all goalkeepers in the squad
  const goalkeepers = myPlayers.filter((p) =>
    ["GK", "GOALKEEPER"].includes(p.position?.toUpperCase() || p.primaryposition?.toUpperCase())
  );

  // Select the best goalkeeper  
  const bestGKIndex = goalkeepers.length
    ? myPlayers.indexOf(
      goalkeepers.reduce((best, p) => {
        const bestGKScore = calculateGKScore(best);
        const currentGKScore = calculateGKScore(p);
        return currentGKScore > bestGKScore ? p : best;
      })
    )
    : -1;

  
  if (bestGKIndex >= 0) {
    const gkName = myPlayers[bestGKIndex].firstname
      ? `${myPlayers[bestGKIndex].firstname} ${myPlayers[bestGKIndex].lastname}`
      : myPlayers[bestGKIndex].name;
    console.log(`Best GK: ${gkName} (Score: ${calculateGKScore(myPlayers[bestGKIndex]).toFixed(1)})`);
  } else {
    console.warn("No goalkeeper found!");
  }

  // Build cost matrix where each cell represents the "cost" of assigning a player to a slot 
  const costMatrix = myPlayers.map((player, i) =>
    slots.map((slot) => {
      const { role, attributes } = formation.keyAttributes[slot];
      const pos = (player.position || player.primaryposition || "").toUpperCase();

       
      if (slot.toUpperCase().includes("GK")) {
        if (i === bestGKIndex) return -150;  
        if (pos.includes("GK")) return -(calculateGKScore(player) * 0.8);  
        return 9999;  
      }

       if (pos.includes("GK") && !slot.toUpperCase().includes("GK")) return 9999;

       const roleMismatchPenalty = computeRoleMismatch(pos, role);

       if (!Array.isArray(attributes) || !attributes.length) {
        console.warn(`Slot ${slot} has no attributes defined`);
        return 9999;
      }

       const attrScore = calculateAttributeScore(player, attributes);
       const fitPenalty = computePositionalFit(pos, role);
       const footPenalty = calculateFootPenalty(player, slot, config.debug);

       let matchupBonus = 0.5;  
      if (oppPlayers.length === 11) {
        const opp = findOpponentForSlotAdvanced(slot, oppPlayers);
        if (opp) matchupBonus = computeAdvancedMatchupScore(player, opp, role);
      } else if (oppPlayers.length > 0) {
        console.warn(`Expected 11 opponents, got ${oppPlayers.length}`);
      }

       const normalizedAttrScore = Math.min(100, Math.max(0, attrScore));
      const normalizedMatchupScore = matchupBonus * 100;

       const totalScore =
        (normalizedAttrScore * config.attributeWeight) +
        (normalizedMatchupScore * config.matchupWeight) -
        (fitPenalty * config.fitPenaltyMultiplier) -
        roleMismatchPenalty -
        footPenalty;

       if (config.debug && i < 3) {
        const playerName = player.firstname
          ? `${player.firstname} ${player.lastname}`
          : player.name;
        console.log(`${playerName} -> ${slot}:`, {
          attr: normalizedAttrScore.toFixed(1),
          matchup: normalizedMatchupScore.toFixed(1),
          fit: (fitPenalty * config.fitPenaltyMultiplier).toFixed(1),
          role: roleMismatchPenalty,
          foot: footPenalty,
          total: totalScore.toFixed(2)
        });
      }

       return -totalScore;
    })
  );

  console.log(`Cost matrix: ${costMatrix.length} players × ${slots.length} slots`);

  return { costMatrix, slots, bestGKIndex };
}

// Calculates goalkeeper score  
function calculateGKScore(player: any): number {
  const attrs = player.attributes || {};

   const gkDiving = attrs.gk_diving || attrs.gkdiving || 0;
  const gkHandling = attrs.gk_handling || attrs.gkhandling || 0;
  const gkKicking = attrs.gk_kicking || attrs.gkkicking || 0;
  const gkPositioning = attrs.gk_positioning || attrs.gkpositioning || 0;
  const gkReflexes = attrs.gk_reflexes || attrs.gkreflexes || 0;

   return (
    gkReflexes * 0.25 +
    gkPositioning * 0.25 +
    gkDiving * 0.2 +
    gkHandling * 0.2 +
    gkKicking * 0.1
  );
}

// Calculates average score across all required attributes for a position
function calculateAttributeScore(player: any, requiredAttributes: string[]): number {
  const attrs = player.attributes || {};

   if (Object.keys(attrs).length === 0) return player.overall || 70;

  let totalScore = 0;
  let validCount = 0;

   for (const attr of requiredAttributes) {
    const normalizedAttr = normalizeKey(attr);
    let value = attrs[normalizedAttr];

     if (value === undefined && normalizedAttr === 'dribbling') {
      value = attrs.dribblingattr || attrs.dribbling;
    }

     if (value !== undefined && value !== null) {
       const normalized = value > 1 ? value : value * 100;
      totalScore += Math.min(100, Math.max(0, normalized));
      validCount++;
    }
  }

   if (validCount === 0) return player.overall || 70;

  // Return average score
  return totalScore / validCount;
}

// Computes severe penalties for role mismatches 
function computeRoleMismatch(position: string, role: string): number {
   if (position.includes("GK") && !role.includes("goalkeeper")) return 999;

   if ((position.startsWith("ST") || position.startsWith("CF")) &&
    (role.includes("defender") || role.includes("full-back") || role.includes("wing-back"))) {
    return 100;
  }

   if (position.startsWith("CB") || position.startsWith("LB") || position.startsWith("RB") && (role.includes("striker") || role.includes("winger"))) {
    return 100;
  }

   if (position.startsWith("CB") && role.includes("attacking")) return 80;

   if ((position.includes("LW") || position.includes("RW") ||
    position.includes("LM") || position.includes("RM")) &&
    (role.includes("defender") || role.includes("full-back") || role.includes("wing-back"))) {
    return 150;
  }

   if ((position.startsWith("LB") || position.startsWith("RB")) &&
    role.includes("winger")) {
    return 100;
  }

   if (position.startsWith("CM") && role.includes("striker")) {
    return 60;
  }

   if ((position.includes("LW") || position.includes("RW") ||
    position.includes("LM") || position.includes("RM")) &&
    role.includes("striker")) {
    return 40;
  }

   if ((position.startsWith("RB") || position.startsWith("LB")) && role.includes("striker")) {
    return 60;
  }

   if ((position.startsWith("RB") || position.startsWith("LB")) && role.includes("attacking-mid")) {
    return 40;
  }

   if (position.startsWith("CAM") && (role.includes("defender") || role.includes("full-back"))) {
    return 100;
  }

   if (position.startsWith("CDM") && role.includes("striker")) {
    return 80;
  }

   if (position.startsWith("CDM") && role.includes("winger")) {
    return 50;
  }

   if ((position.includes("WB") && role.includes("full-back")) ||
    (position.includes("LB") || position.includes("RB")) && role.includes("wing-back")) {
    return 5;
  }

   return 0;
}

// Computes minor positional fit penalties for less severe mismatches
function computePositionalFit(position: string, role: string): number {
  let penalty = 0;

  if (role.includes("striker") && position.includes("CB")) penalty += 0.4;
  if (role.includes("defender") && position.includes("ST")) penalty += 0.4;
  if (role.includes("midfield") && position.includes("ST")) penalty += 0.2;
  if ((position.includes("LW") || position.includes("RW")) && role.includes("full-back")) {
    penalty += 0.15;
  }

  return penalty;
}