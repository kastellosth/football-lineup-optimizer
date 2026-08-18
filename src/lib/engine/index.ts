
export {
  normalizeKey,
  getZoneForPosition,
  getAttr,
  calculateFormationCounterAdvantage,
  findOpponentForSlotAdvanced,
  calculateWeightedAttributeScore,
  computeAdvancedMatchupScore,
  calculateFormationSynergy,
  calculateSynergyWeight,
} from './advancedLogic';

export {
  buildCostMatrix,
  DEFAULT_CONFIG,
  type OptimizerConfig,
} from './costMatrix';

export {
  evaluateFormation,
} from './formationEvaluator';

export {
  calculatePlayerSlotFitPenalty,
  isHardBlockForFormationSlot,
  getFormationPenaltyRules,
} from './formationFitPenalties';

 export {
  FORMATIONS,
  normalizeFormation,
  formationProfiles,
  type FormationType,
  type FormationProfile,
} from './formationProfiles';

 export {
  padToSquare,
  hungarianAlgorithm,
} from './hungarian';

 export {
  mapOpponentToFormation,
} from './opponentMapper';