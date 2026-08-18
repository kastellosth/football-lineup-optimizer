export const STORAGE_KEYS = {
  // Dashboard
  OPTIMIZATION_HISTORY: 'tactics_optimization_history',
  
  // Teams page (sessionStorage)
  CURRENT_TEAM: 'tactics_current_team',
  
  // Opponents page (sessionStorage)
  CURRENT_OPPONENTS: 'tactics_current_opponents',
  CURRENT_FORMATION: 'tactics_current_formation',
  
  // Settings (if needed in future)
  USER_PREFERENCES: 'tactics_user_preferences',
  THEME: 'tactics_theme',
} as const;


  //Application configuration

export const APP_CONFIG = {
  MAX_PLAYERS_COMPARISON: 4,
  MAX_TEAM_SIZE: 30,
  MIN_TEAM_SIZE: 11,
  DEBOUNCE_DELAY: 500,
  STORAGE_VERSION: 1,
} as const;


// Formation options
 
export const FORMATIONS = [
  '3-4-3',
  '3-5-2',
  '4-2-3-1',
  '4-3-3',
  '4-4-2',
  '4-5-1',
  '5-3-2',
] as const;

export type Formation = typeof FORMATIONS[number];