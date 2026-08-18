import { padToSquare, hungarianAlgorithm } from "./hungarian";
import { buildCostMatrix, OptimizerConfig, DEFAULT_CONFIG } from "./costMatrix";
import { 
  calculateFormationSynergy, 
  calculateFormationCounterAdvantage, 
  calculateSynergyWeight 
} from "./advancedLogic";
import { formationProfiles } from "@/lib/engine/formationProfiles";
import type { Player } from "@/lib/types";

interface MappingItem {
  playerName: string;
  player: Player;
  slot: string;
  role: string;
  score: number;
}

interface FormationResult {
  id: string;
  totalScore: number;
  mapping: Array<{
    player: string;
    slot: string;
    role: string;
    score: number;
  }>;
  synergyScore: number;
  avgAttributeScore: number;
  matchupBonus: number;
  counterAdvantage: number;
  synergyWeight: number;
}

// Evaluates a formation by assigning players to positions using the Hungarian algorithm and calculating total score
export function evaluateFormation(
  myPlayers: Player[],
  oppPlayers: Player[],
  formation: any,
  oppFormationId: string, 
  config: OptimizerConfig = DEFAULT_CONFIG
): FormationResult | null {
  console.log(`\n- Testing formation ${formation.id}`);

  if (oppPlayers.length !== 11) {
    console.warn(`- Expected 11 opponents, got ${oppPlayers.length}`);
  }


  const { costMatrix, slots, bestGKIndex } = buildCostMatrix(
    myPlayers,
    formation,
    oppPlayers,
    config
  );

  if (!costMatrix?.length) {
    console.error(`- Failed to build cost matrix for ${formation.id}`);
    return null;
  }

  const gkSlot = slots.find((s) => s.toUpperCase().includes("GK"));
  let fixedAssignments: MappingItem[] = [];
  let reducedMatrix = costMatrix;
  let reducedPlayers = [...myPlayers];
  let reducedSlots = [...slots];

  if (gkSlot && bestGKIndex >= 0) {
    const gkPlayer = myPlayers[bestGKIndex];
    const gkName = gkPlayer.name;

    fixedAssignments.push({
      playerName: gkName,
      player: gkPlayer,
      slot: gkSlot,
      role: formation.keyAttributes[gkSlot].role,
      score: 95.0,
    });

    console.log(`- Locked GK: ${gkName} -> ${gkSlot}`);

    const gkSlotIndex = slots.indexOf(gkSlot);
    reducedMatrix = costMatrix
      .filter((_, i) => i !== bestGKIndex)
      .map((row) => row.filter((_, j) => j !== gkSlotIndex));
    reducedPlayers = myPlayers.filter((_, i) => i !== bestGKIndex);
    reducedSlots = slots.filter((_, j) => j !== gkSlotIndex);
  }

  const numPlayers = reducedMatrix.length;
  const numSlots = reducedMatrix[0]?.length || 0;

  if (numPlayers === 0 || numSlots === 0) {
    console.warn('- Empty matrix after GK removal');
    return null;
  }

  if (numPlayers < numSlots) {
    console.warn(`- Not enough players: ${numPlayers} available, ${numSlots} slots needed`);
    return null;
  }

  console.log(`- Hungarian: ${numPlayers} players -> ${numSlots} slots`);

  const originalMatrix = reducedMatrix.map(row => [...row]);
  const paddedMatrix = padToSquare(reducedMatrix);

  const assignment = hungarianAlgorithm(paddedMatrix);

  const validAssignments: MappingItem[] = assignment
    .map((slotIdx, playerIdx) => {
      if (playerIdx >= numPlayers || slotIdx >= numSlots) {
        return null;
      }

      const player = reducedPlayers[playerIdx];
      const slot = reducedSlots[slotIdx];
      const cost = originalMatrix[playerIdx][slotIdx];
      const score = Number.isFinite(cost) ? -cost : 0;

      const playerName = player.name;

      return {
        playerName,
        player: player,
        slot,
        role: formation.keyAttributes[slot]?.role || "unknown",
        score: Number.isFinite(score) ? score : 0,
      };
    })
    .filter((item): item is MappingItem => item !== null);

  const fullMapping: MappingItem[] = [...fixedAssignments, ...validAssignments];
  const avgScore = fullMapping.reduce((acc, m) => acc + (m.score ?? 0), 0) / fullMapping.length;

  const synergyMapping = fullMapping.map(m => ({
    player: m.player,
    slot: m.slot,
    role: m.role,
    score: m.score,
  }));

  const synergyScore = calculateFormationSynergy(synergyMapping, formation);
  const synergyWeight = calculateSynergyWeight(formation.id, synergyScore);
  
  const counterAdvantage = calculateFormationCounterAdvantage(
    formation.id,
    oppFormationId,
    formationProfiles 
  );

  const totalScore = avgScore + (synergyScore * synergyWeight) + counterAdvantage;
  
  console.log(
    `- ${formation.id}: Base=${avgScore.toFixed(2)}, ` +
    `Synergy=${synergyScore.toFixed(1)} (×${(synergyWeight * 100).toFixed(0)}%), ` +
    `Counter=${counterAdvantage > 0 ? '+' : ''}${counterAdvantage.toFixed(1)}, ` +
    `Total=${totalScore.toFixed(2)}`
  );

  return {
    id: formation.id,
    totalScore,
    mapping: fullMapping.map(m => ({
      player: m.playerName,
      slot: m.slot,
      role: m.role,
      score: m.score,
    })),
    synergyScore,
    avgAttributeScore: avgScore,
    matchupBonus: synergyScore * synergyWeight,
    counterAdvantage,
    synergyWeight
  };
}