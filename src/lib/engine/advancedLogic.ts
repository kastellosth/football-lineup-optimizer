import type { Player, Attributes } from "@/lib/types";
import type { FormationProfile } from "@/lib/engine/formationProfiles";

// Normalizes a string key by trimming, converting to lowercase, and removing spaces/underscores
export const normalizeKey = (s: string) =>
  s?.toString().trim().toLowerCase().replace(/[\s_]+/g, "") ?? "";

// Determines the zone (attack, midfield, defense, etc.) based on the player's position abbreviation
export function getZoneForPosition(pos: string): string {
  const p = pos?.toUpperCase() || "";
  if (["ST", "CF", "LF", "RF"].some(x => p.includes(x))) return "attack";
  if (["CAM", "LM", "RM", "LW", "RW"].some(x => p.includes(x))) return "attacking-mid";
  if (["CM", "CDM", "LDM", "RDM"].some(x => p.includes(x))) return "midfield";
  if (["CB", "LB", "RB", "LWB", "RWB"].some(x => p.includes(x))) return "defense";
  if (p === "GK") return "goalkeeper";
  return "other";
}

// Retrieves a player's attribute value with fallback handling for different naming conventions and clamping between 0-100
export function getAttr(player: any, attr: string): number {
  const attrs = player.attributes || {};
  const normalizedAttr = normalizeKey(attr);

  // Try to get the value with normalized key
  let value = attrs[normalizedAttr];

  // Fallback: try snake_case version if camelCase not found
  if (value === undefined) {
    value = attrs[normalizedAttr.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()];
  }

  // Special handling for dribbling attribute variations
  if (value === undefined && normalizedAttr === 'dribbling') {
    value = attrs.dribblingattr || attrs.dribbling;
  }

  // Return 0 if attribute doesn't exist
  if (value === undefined || value === null) return 0;

  // Clamp value between 0 and 100
  return Math.min(100, Math.max(0, value));
}

// Calculates tactical advantage/disadvantage based on formation counters (+15 for advantage, -12 for disadvantage)
export function calculateFormationCounterAdvantage(
  myFormationId: string,
  oppFormationId: string,
  formationProfiles: FormationProfile[]
): number {
  // Find the opponent's formation profile
  const oppFormation = formationProfiles.find(f => f.id === oppFormationId);

  if (!oppFormation) return 0;

  const suggestedCounters = oppFormation.opponentCounters.suggestedFormations || [];

  // Check if my formation counters the opponent's formation
  if (suggestedCounters.includes(myFormationId)) {
    console.log(`✅ ${myFormationId} counters ${oppFormationId} (+15 tactical advantage)`);
    return 15;
  }

  // Check if opponent's formation counters mine
  const myFormation = formationProfiles.find(f => f.id === myFormationId);
  if (myFormation) {
    const myCounters = myFormation.opponentCounters.suggestedFormations || [];
    if (myCounters.includes(oppFormationId)) {
      console.log(`⚠️ ${oppFormationId} counters ${myFormationId} (-12 tactical disadvantage)`);
      return -12;
    }
  }

  // No counter relationship found
  return 0;
}

// Finds the best opponent matchup for a given position slot using position preferences and zone matchups
export function findOpponentForSlotAdvanced(
  slot: string,
  oppPlayers: any[]
): any | null {
  if (!oppPlayers.length) return null;

  // Maps each position to their typical direct opponents on the field
  const matchupMap: Record<string, string[]> = {
    'LW': ['RB', 'RWB', 'CB'],
    'RW': ['LB', 'LWB', 'CB'],
    'LM': ['RB', 'RWB', 'RM'],
    'RM': ['LB', 'LWB', 'LM'],
    'ST': ['CB', 'CDM'],
    'ST1': ['CB1', 'CB2', 'CB3'],
    'ST2': ['CB1', 'CB2', 'CB3'],
    'LB': ['RW', 'RM', 'RWB'],
    'RB': ['LW', 'LM', 'LWB'],
    'LWB': ['RW', 'RM'],
    'RWB': ['LW', 'LM'],
    'CB': ['ST', 'CF'],
    'CB1': ['ST', 'ST1', 'ST2'],
    'CB2': ['ST', 'ST1', 'ST2'],
    'CB3': ['ST', 'ST1', 'ST2'],
    'CDM': ['CAM', 'CM', 'ST'],
    'CDM1': ['CAM', 'LAM', 'RAM'],
    'CDM2': ['CAM', 'LAM', 'RAM'],
    'CM': ['CM', 'CDM', 'CAM'],
    'CM1': ['CM1', 'CM2', 'CM3'],
    'CM2': ['CM1', 'CM2', 'CM3'],
    'CM3': ['CM1', 'CM2', 'CM3'],
    'CAM': ['CDM', 'CM'],
    'LAM': ['CDM1', 'CDM2', 'CM'],
    'RAM': ['CDM1', 'CDM2', 'CM'],
  };

  const preferredOppPositions = matchupMap[slot] || [];
  const myZone = getZoneForPosition(slot);

  // Score each opponent based on position matchup, zone compatibility, and key attributes
  const scoredOpponents = oppPlayers.map(opp => {
    let score = 0;
    const oppPos = opp.slot || opp.position || '';
    const oppPosUpper = oppPos.toUpperCase();

    // High score for preferred positional matchups
    if (preferredOppPositions.some(p => oppPosUpper.includes(p))) {
      score += 100;
    }

    const oppZone = getZoneForPosition(oppPos);

    // Score based on zone matchups (attackers vs defenders, etc.)
    if (myZone === 'attack' && oppZone === 'defense') score += 50;
    if (myZone === 'defense' && oppZone === 'attack') score += 50;
    if (myZone === 'midfield' && oppZone === 'midfield') score += 40;
    if (myZone === 'attacking-mid' && oppZone === 'defense') score += 30;

    // Bonus for opponents with high pace or defensive awareness
    if (getAttr(opp, 'pace') > 70) score += 10;
    if (getAttr(opp, 'defensiveawareness') > 70) score += 10;

    return { opponent: opp, score };
  });

  // Sort by score descending and return the best matchup
  scoredOpponents.sort((a, b) => b.score - a.score);
  return scoredOpponents[0]?.opponent || oppPlayers[0];
}

// Calculates a player's weighted score for a position based on role-specific attribute weights and bonuses
export function calculateWeightedAttributeScore(
  player: any,
  slot: string,
  formationAttributes: string[]
): number {
  const attrs = player.attributes || {};
  // Return overall rating if no attributes available
  if (!Object.keys(attrs).length) return player.overall || 70;

  // Different attribute weights for each role (higher weight = more important)
  const attributeWeights: Record<string, Record<string, number>> = {
    striker: {
      finishing: 2.8,
      positioning: 2.2,
      shotpower: 2.0,
      composure: 1.5,
      strength: 1.3,
      reactions: 1.2,
      pace: 1.0,
    },
    winger: {
      pace: 2.8,
      dribbling: 2.2,
      agility: 2.0,  
      acceleration: 2.0,
      finishing: 1.5,
      crossing: 1.3,
      stamina: 1.0,  
    },
    defender: {
      defensiveawareness: 2.5,  
      standingtackle: 2.0,
      strength: 2.0,
      positioning: 1.8,
      headingaccuracy: 1.5,  
      jumping: 1.3, 
      pace: 1.2, 
    },
    midfield: {
      passing: 2.5,  
      vision: 2.0,
      stamina: 2.0,  
      ballcontrol: 1.5, 
      shortpassing: 1.5,
      longpassing: 1.3, 
    },
    'defensive-mid': {
      defensiveawareness: 2.5,  
      standingtackle: 2.5,
      interceptions: 2.0, 
      strength: 1.8,
      passing: 1.5, 
      stamina: 1.5, 
    },
  };

  const role = determineRoleFromSlot(slot);
  const weights = attributeWeights[role] || {};

  let totalScore = 0;
  let weightSum = 0;

  // Calculate weighted average of formation-specific attributes
  for (const attr of formationAttributes) {
    const attrValue = getAttr(player, attr);
    const weight = weights[normalizeKey(attr)] || 1.0;

    totalScore += attrValue * weight;
    weightSum += weight;
  }

  // Calculate base score as weighted average or fallback to overall rating
  const baseScore = weightSum > 0 ? totalScore / weightSum : player.overall || 70;

  // Add threshold bonuses for exceptional attributes (90+, 85+, 80+)
  let thresholdBonus = 0;

  if (role === 'winger' || role === 'striker') {
    const pace = getAttr(player, 'pace');
    if (pace >= 90) thresholdBonus += 5;
    else if (pace >= 85) thresholdBonus += 3;
    else if (pace >= 80) thresholdBonus += 1;
  }

  if (role === 'striker') {
    const finishing = getAttr(player, 'finishing');
    if (finishing >= 90) thresholdBonus += 5;
    else if (finishing >= 85) thresholdBonus += 3;
  }

  if (role === 'defender') {
    const defensiveAwareness = getAttr(player, 'defensiveawareness');
    if (defensiveAwareness >= 85) thresholdBonus += 5;
    else if (defensiveAwareness >= 80) thresholdBonus += 2;
  }

  // Add synergy bonuses for complementary high attributes
  let synergyBonus = 0;

  // Wingers with both high pace and dribbling get bonus
  if (role === 'winger') {
    const pace = getAttr(player, 'pace');
    const dribbling = getAttr(player, 'dribbling') || getAttr(player, 'ballcontrol');
    if (pace >= 85 && dribbling >= 85) synergyBonus += 5;
  }

  // Strikers with pace, finishing, and positioning get bonus
  if (role === 'striker') {
    const pace = getAttr(player, 'pace');
    const finishing = getAttr(player, 'finishing');
    const positioning = getAttr(player, 'positioning');
    if (pace >= 80 && finishing >= 85 && positioning >= 80) {
      synergyBonus += 8;
    }
  }

  return baseScore + thresholdBonus + synergyBonus;
}

// Computes matchup advantage score (0-1) between two players based on role-specific attribute battles
export function computeAdvancedMatchupScore(
  myPlayer: any,
  oppPlayer: any,
  myRole: string
): number {
  // Return neutral score if either player is missing
  if (!oppPlayer || !myPlayer) return 0.5;

  let advantageScore = 0;
  let battleCount = 0;

  // Attacking roles: compare pace, finishing vs defense, and dribbling vs tackling
  if (myRole.includes('striker') || myRole.includes('attacking') || myRole.includes('winger')) {
    // Pace battle
    const myPace = getAttr(myPlayer, 'pace');
    const oppPace = getAttr(oppPlayer, 'pace');
    const paceDiff = myPace - oppPace;
    if (paceDiff > 10) advantageScore += 0.25;
    else if (paceDiff > 5) advantageScore += 0.15;
    else if (paceDiff < -10) advantageScore -= 0.2;
    battleCount++;

    // Finishing vs defensive awareness
    const myFinishing = getAttr(myPlayer, 'finishing');
    const oppDefAwareness = getAttr(oppPlayer, 'defensiveawareness');
    if (myFinishing > oppDefAwareness + 10) advantageScore += 0.2;
    else if (myFinishing < oppDefAwareness - 10) advantageScore -= 0.15;
    battleCount++;

    // Dribbling vs tackling
    const myDribbling = getAttr(myPlayer, 'dribbling') || getAttr(myPlayer, 'agility');
    const oppTackling = getAttr(oppPlayer, 'standingtackle');
    if (myDribbling > oppTackling + 10) advantageScore += 0.2;
    else if (myDribbling < oppTackling - 10) advantageScore -= 0.15;
    battleCount++;

  } else if (myRole.includes('defender')) {
    // Defensive roles: pace advantage is critical, plus tackling and strength battles
    const myPace = getAttr(myPlayer, 'pace');
    const oppPace = getAttr(oppPlayer, 'pace');
    const paceDiff = myPace - oppPace;
    if (paceDiff > 0) advantageScore += 0.2;
    else if (paceDiff < -15) advantageScore -= 0.3;
    battleCount++;

    // Defensive awareness vs positioning
    const myDefAwareness = getAttr(myPlayer, 'defensiveawareness');
    const oppPositioning = getAttr(oppPlayer, 'positioning') || getAttr(oppPlayer, 'vision');
    if (myDefAwareness > oppPositioning + 10) advantageScore += 0.25;
    battleCount++;

    // Tackling vs dribbling
    const myTackling = getAttr(myPlayer, 'standingtackle');
    const oppDribbling = getAttr(oppPlayer, 'dribbling') || getAttr(oppPlayer, 'agility');
    if (myTackling > oppDribbling + 10) advantageScore += 0.2;
    else if (myTackling < oppDribbling - 15) advantageScore -= 0.25;
    battleCount++;

    // Strength battle
    const myStrength = getAttr(myPlayer, 'strength');
    const oppStrength = getAttr(oppPlayer, 'strength');
    if (myStrength > oppStrength + 10) advantageScore += 0.15;
    battleCount++;

  } else if (myRole.includes('midfield')) {
    // Midfield roles: passing vs interceptions and stamina comparison
    const myPassing = getAttr(myPlayer, 'passing');
    const oppInterceptions = getAttr(oppPlayer, 'interceptions');
    if (myPassing > oppInterceptions + 10) advantageScore += 0.2;
    battleCount++;

    // Stamina battle for midfield dominance
    const myStamina = getAttr(myPlayer, 'stamina');
    const oppStamina = getAttr(oppPlayer, 'stamina');
    if (myStamina > oppStamina + 10) advantageScore += 0.15;
    else if (myStamina < oppStamina - 10) advantageScore -= 0.1;
    battleCount++;
  }

  // Factor in overall rating difference using hyperbolic tangent for smooth scaling
  const myOverall = myPlayer.overall || 75;
  const oppOverall = oppPlayer.overall || 75;
  const overallDiff = myOverall - oppOverall;
  const overallAdvantage = Math.tanh(overallDiff / 15) * 0.2;
  advantageScore += overallAdvantage;

  // Normalize to 0-1 range with 0.5 as neutral
  const normalizedScore = 0.5 + (advantageScore / (battleCount + 1));
  return Math.max(0, Math.min(1, normalizedScore));
}

// Calculates team synergy score 
export function calculateFormationSynergy(
  mapping: Array<{ player: Player; slot: string; role: string; score: number }>,
  formation: any
): number {
  let synergyScore = 0;

  // Initialize arrays to categorize players by position and role
  const leftWingers: typeof mapping = [];
  const rightWingers: typeof mapping = [];
  const defenders: typeof mapping = [];
  const strikers: typeof mapping = [];
  const midfielders: typeof mapping = [];
  const attackers: typeof mapping = [];
  const staminaValues: number[] = [];

  // Categorize all players into their respective groups
  for (const m of mapping) {
    const slotUpper = m.slot.toUpperCase();

    if (slotUpper.includes('LW') || slotUpper.includes('LM')) leftWingers.push(m);
    if (slotUpper.includes('RW') || slotUpper.includes('RM')) rightWingers.push(m);

    if (m.role === 'defender') defenders.push(m);
    if (m.role.includes('striker')) strikers.push(m);
    if (m.role.includes('midfield') || m.role === 'defensive-mid') midfielders.push(m);
    if (m.role.includes('striker') || m.role.includes('winger') || m.role.includes('attacking')) {
      attackers.push(m);
    }

    staminaValues.push(getAttr(m.player, 'stamina'));
  }

  // Width synergy
  const leftPace = Math.max(...leftWingers.map(w => getAttr(w.player, 'pace')), 0);
  const rightPace = Math.max(...rightWingers.map(w => getAttr(w.player, 'pace')), 0);

  if (leftPace >= 80 && rightPace >= 80) synergyScore += 10;
  else if (leftPace >= 75 || rightPace >= 75) synergyScore += 5;

  // Aerial ability
  const tallDefenders = defenders.filter(d =>
    getAttr(d.player, 'headingaccuracy') >= 75 &&
    getAttr(d.player, 'jumping') >= 70
  ).length;

  const tallStrikers = strikers.filter(s =>
    getAttr(s.player, 'headingaccuracy') >= 70
  ).length;

  if (tallDefenders >= 2) synergyScore += 8;
  if (tallStrikers >= 1) synergyScore += 5;

  // Team stamina
  const totalStamina = staminaValues.reduce((sum, val) => sum + val, 0) / staminaValues.length;

  if (totalStamina >= 80) synergyScore += 10;
  else if (totalStamina >= 75) synergyScore += 5;
  else if (totalStamina < 65) synergyScore -= 10;

  // Defensive coverage
  const defensiveMids = midfielders.filter(m =>
    getAttr(m.player, 'defensiveawareness') >= 70
  ).length;

  if (defensiveMids >= 2) synergyScore += 8;
  else if (defensiveMids >= 1) synergyScore += 4;
  else synergyScore -= 5;

  // Finishing quality
  const goodFinishers = attackers.filter(a =>
    getAttr(a.player, 'finishing') >= 75
  ).length;

  if (goodFinishers >= 3) synergyScore += 10;
  else if (goodFinishers >= 2) synergyScore += 6;
  else if (goodFinishers <= 1) synergyScore -= 5;

  console.log(`Formation Synergy: ${synergyScore.toFixed(1)} (Width: ${leftPace}/${rightPace}, Stamina avg: ${totalStamina.toFixed(1)})`);

  return synergyScore;
}

// Determines synergy weight percentage based on formation type and synergy score
export function calculateSynergyWeight(
  formationId: string,
  synergyScore: number
): number {

  const highDependencyFormations = ['3-5-2', '5-3-2', '3-4-3'];
  const mediumDependencyFormations = ['4-2-3-1', '4-5-1'];

  if (highDependencyFormations.includes(formationId)) {
    if (synergyScore >= 25) {
      console.log(`${formationId}: High synergy (${synergyScore.toFixed(1)}) → 25% weight`);
      return 0.25;
    } else if (synergyScore >= 15) {
      console.log(`${formationId}: Decent synergy (${synergyScore.toFixed(1)}) → 18% weight`);
      return 0.18;
    } else {
      console.log(`${formationId}: Poor synergy (${synergyScore.toFixed(1)}) → 12% weight`);
      return 0.12;
    }
  }

  
  if (mediumDependencyFormations.includes(formationId)) {
    if (synergyScore >= 20) {
      console.log(`${formationId}: Good synergy (${synergyScore.toFixed(1)}) → 20% weight`);
      return 0.20;
    } else {
      console.log(`${formationId}: Standard synergy (${synergyScore.toFixed(1)}) → 15% weight`);
      return 0.15;
    }
  }

  
  console.log(`${formationId}: Simple formation → 15% weight`);
  return 0.15;
}

// Determines the role category from a position slot 
function determineRoleFromSlot(slot): string {
  const s = slot.toUpperCase();
  if (s.includes('ST') || s.includes('CF')) return 'striker';
  if (s.includes('W') && !s.includes('B')) return 'winger';
  if (s.includes('CAM')) return 'attacking-mid';
  if (s.includes('CDM')) return 'defensive-mid';
  if (s.includes('CM')) return 'midfield';
  if (s.includes('CB')) return 'defender';
  if (s.includes('B')) return 'fullback';
  return 'midfield';
}