import { getAttr } from "./advancedLogic";

// Calculates formation-specific penalties for players who don't meet tactical requirements 
export function calculatePlayerSlotFitPenalty(
  player: any,
  slot: string,
  formationId: string
): number {
  const slotUpper = slot.toUpperCase();
  let penalty = 0;

  if (formationId === '3-5-2' && slotUpper.includes('WB')) {
    const stamina = getAttr(player, 'stamina');
    const pace = getAttr(player, 'pace');
    
    if (stamina < 70) {
      penalty += 40;  
    } else if (stamina < 75) {
      penalty += 25;  
    } else if (stamina < 80) {
      penalty += 10;  
    }
    
    if (pace < 70) {
      penalty += 15;
    }
  }

  if (formationId === '5-3-2' && slotUpper.includes('WB')) {
    const stamina = getAttr(player, 'stamina');
    
    if (stamina < 70) {
      penalty += 30;
    } else if (stamina < 75) {
      penalty += 20;
    } else if (stamina < 80) {
      penalty += 8;
    }
  }

  if (formationId === '3-4-3') {
    const isForward = slotUpper.includes('ST') || slotUpper.includes('LW') || slotUpper.includes('RW');
    
    if (isForward) {
      const pace = getAttr(player, 'pace');
      
      if (pace < 75) {
        penalty += 25;
      } else if (pace < 80) {
        penalty += 15;
      } else if (pace < 85) {
        penalty += 5;
      }
      
      if (slotUpper.includes('W')) {
        const dribbling = getAttr(player, 'dribbling') || getAttr(player, 'ballcontrol');
        if (dribbling < 75) {
          penalty += 10;
        }
      }
    }
  }

  if (formationId === '4-5-1' && slotUpper.includes('ST')) {
    const strength = getAttr(player, 'strength');
    const heading = getAttr(player, 'headingaccuracy');
    const positioning = getAttr(player, 'positioning');
    
    if (strength < 70 || heading < 65) {
      penalty += 30;
    } else if (strength < 75 || heading < 70) {
      penalty += 15;
    }
    
    if (positioning < 75) {
      penalty += 10;
    }
  }

  if (formationId === '4-3-3' && (slotUpper.includes('LW') || slotUpper.includes('RW'))) {
    const pace = getAttr(player, 'pace');
    const dribbling = getAttr(player, 'dribbling') || getAttr(player, 'ballcontrol');
    
    if (pace < 80 || dribbling < 75) {
      penalty += 12;
    } else if (pace < 85 || dribbling < 80) {
      penalty += 5;
    }
  }

  if (formationId === '4-2-3-1' && slotUpper === 'CAM') {
    const passing = getAttr(player, 'passing');
    const vision = getAttr(player, 'vision');
    const ballControl = getAttr(player, 'ballcontrol');
    
    const avgCreativity = (passing + vision + ballControl) / 3;
    
    if (avgCreativity < 75) {
      penalty += 20;
    } else if (avgCreativity < 80) {
      penalty += 10;
    }
  }


  if (formationId === '4-4-2' && slotUpper.includes('ST')) {
    const pace = getAttr(player, 'pace');
    const strength = getAttr(player, 'strength');
    
    const hasPace = pace >= 80;
    const hasStrength = strength >= 75;
    
    if (!hasPace && !hasStrength) {
      penalty += 10; 
    }
  }

  return penalty;
}

// Determines if a player is completely unsuitable for a specific formation slot 
export function isHardBlockForFormationSlot(
  player: any,
  slot: string,
  formationId: string
): boolean {
  const slotUpper = slot.toUpperCase();
  
  if (formationId === '3-5-2' && slotUpper.includes('WB')) {
    const stamina = getAttr(player, 'stamina');
    if (stamina < 60) return true;  
  }
  
  if (formationId === '4-5-1' && slotUpper.includes('ST')) {
    const strength = getAttr(player, 'strength');
    const heading = getAttr(player, 'headingaccuracy');
    if (strength < 60 && heading < 55) return true;
  }
  
  return false;
}

// Returns human-readable descriptions of formation-specific penalty rules for UI display
export function getFormationPenaltyRules(formationId: string): string[] {
  const rules: string[] = [];
  
  switch (formationId) {
    case '3-5-2':
      rules.push('Wing-backs need Stamina ≥80 (penalty up to -40)');
      rules.push('Wing-backs need Pace ≥70 (penalty up to -15)');
      break;
    case '5-3-2':
      rules.push('Wing-backs need Stamina ≥80 (penalty up to -30)');
      break;
    case '3-4-3':
      rules.push('Forwards need Pace ≥85 (penalty up to -25)');
      rules.push('Wingers need Dribbling ≥75 (penalty up to -10)');
      break;
    case '4-5-1':
      rules.push('Striker needs Strength ≥75 (penalty up to -30)');
      rules.push('Striker needs Heading ≥70 (penalty up to -30)');
      rules.push('Striker needs Positioning ≥75 (penalty up to -10)');
      break;
    case '4-3-3':
      rules.push('Wingers need Pace ≥85 (penalty up to -12)');
      rules.push('Wingers need Dribbling ≥80 (penalty up to -12)');
      break;
    case '4-2-3-1':
      rules.push('CAM needs Creativity ≥80 (penalty up to -20)');
      break;
    case '4-4-2':
      rules.push('Strikers need Pace ≥80 OR Strength ≥75 (penalty up to -10)');
      break;
  }
  
  return rules;
}