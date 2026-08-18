import { formationProfiles } from "@/lib/engine/formationProfiles";

// Maps opponent players to formation slots by matching their positions to available roles with fallback logic
export function mapOpponentToFormation(oppPlayers: any[], formationId: string) {
  const formationProfile = formationProfiles.find((f) => f.id === formationId);
  if (!formationProfile) {
    console.warn(`Formation ${formationId} not found for opponent mapping`);
    return oppPlayers.slice(0, 11);
  }

  const availableSlots = Object.keys(formationProfile.keyAttributes);
  
  const slotsByRole: Record<string, string[]> = {
    goalkeeper: availableSlots.filter(s => 
      formationProfile.keyAttributes[s].role === 'goalkeeper'
    ),
    defender: availableSlots.filter(s => 
      formationProfile.keyAttributes[s].role === 'defender'
    ),
    fullback: availableSlots.filter(s => 
      formationProfile.keyAttributes[s].role === 'full-back'
    ),
    wingback: availableSlots.filter(s => 
      formationProfile.keyAttributes[s].role === 'wing-back'
    ),
    defensiveMid: availableSlots.filter(s => 
      formationProfile.keyAttributes[s].role === 'defensive-mid'
    ),
    midfield: availableSlots.filter(s => 
      formationProfile.keyAttributes[s].role === 'midfield' || 
      formationProfile.keyAttributes[s].role === 'playmaker'
    ),
    attackingMid: availableSlots.filter(s => 
      formationProfile.keyAttributes[s].role === 'attacking-mid' || 
      formationProfile.keyAttributes[s].role === 'creator'
    ),
    winger: availableSlots.filter(s => {
      const role = formationProfile.keyAttributes[s].role;
      return role === 'winger' || role === 'wide forward' || role === 'wide-mid';
    }),
    striker: availableSlots.filter(s => {
      const role = formationProfile.keyAttributes[s].role;
      return role === 'striker' || role === 'central striker';
    }),
  };

  const getRoleCategory = (position: string): string => {
    const pos = position.toUpperCase();
    if (pos.includes('GK')) return 'goalkeeper';
    if (pos.includes('CB')) return 'defender';
    if (pos.includes('LB') || pos.includes('RB')) return 'fullback';
    if (pos.includes('LWB') || pos.includes('RWB')) return 'wingback';
    if (pos.includes('CDM')) return 'defensiveMid';
    if (pos.includes('CM')) return 'midfield';
    if (pos.includes('CAM')) return 'attackingMid';
    if (pos.includes('LW') || pos.includes('RW') || pos.includes('LM') || pos.includes('RM')) return 'winger';
    if (pos.includes('ST') || pos.includes('CF')) return 'striker';
    return 'midfield';
  };

  const getPositionPriority = (position: string): number => {
    const pos = position.toUpperCase();
    if (pos.includes('GK')) return 1;
    if (pos.includes('CB')) return 2;
    if (pos.includes('LB') || pos.includes('RB') || pos.includes('WB')) return 3;
    if (pos.includes('CDM')) return 4;
    if (pos.includes('CM')) return 5;
    if (pos.includes('CAM')) return 6;
    if (pos.includes('LW') || pos.includes('RW') || pos.includes('LM') || pos.includes('RM')) return 7;
    if (pos.includes('ST') || pos.includes('CF')) return 8;
    return 9;
  };

  const sortedPlayers = [...oppPlayers]
    .slice(0, 11)
    .sort((a, b) => getPositionPriority(a.position || '') - getPositionPriority(b.position || ''));

  const usedSlots = new Set<string>();
  const mappedPlayers: any[] = [];

  for (const player of sortedPlayers) {
    const roleCategory = getRoleCategory(player.position || '');
    let assignedSlot: string | null = null;

    if (slotsByRole[roleCategory]?.length) {
      for (const slot of slotsByRole[roleCategory]) {
        if (!usedSlots.has(slot)) {
          assignedSlot = slot;
          usedSlots.add(slot);
          break;
        }
      }
    }

    if (!assignedSlot) {
      const fallbackOrder: Record<string, string[]> = {
        'fullback': ['wingback', 'defender'],
        'wingback': ['fullback', 'winger'],
        'defensiveMid': ['midfield', 'defender'],
        'midfield': ['defensiveMid', 'attackingMid'],
        'attackingMid': ['midfield', 'winger', 'striker'],
        'winger': ['attackingMid', 'striker'],
        'striker': ['winger', 'attackingMid'],
        'defender': ['defensiveMid', 'fullback'],
      };

      const fallbacks = fallbackOrder[roleCategory] || [];
      for (const fallback of fallbacks) {
        if (slotsByRole[fallback]?.length) {
          for (const slot of slotsByRole[fallback]) {
            if (!usedSlots.has(slot)) {
              assignedSlot = slot;
              usedSlots.add(slot);
              break;
            }
          }
          if (assignedSlot) break;
        }
      }
    }

    if (!assignedSlot) {
      for (const slot of availableSlots) {
        if (!usedSlots.has(slot)) {
          assignedSlot = slot;
          usedSlots.add(slot);
          break;
        }
      }
    }

    mappedPlayers.push({
      ...player,
      slot: assignedSlot || availableSlots[0] || 'GK',
    });
  }
  
  return mappedPlayers;
}