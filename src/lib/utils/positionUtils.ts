/**
 * Position and Player Utility Functions
 * 
 * Utilities for categorizing player positions, formatting display, and filtering/sorting players.
 */

// Returns the broad position category (GK, DF, MF, FW) from a specific position string
export const coarseLine = (position: string): string => {
  if (!position) return "Unknown";
  const pos = position.toUpperCase();
  
  if (pos.includes("GK")) return "GK";
  
  if (pos.includes("CB") || pos.includes("LB") || pos.includes("RB") || 
      pos.includes("LWB") || pos.includes("RWB") || pos.includes("LCB") || 
      pos.includes("RCB")) return "DF";
  
  if (pos.includes("CM") || pos.includes("CDM") || pos.includes("CAM") || 
      pos.includes("LM") || pos.includes("RM") || pos.includes("LCM") || 
      pos.includes("RCM") || pos.includes("AM") || pos.includes("DM")) return "MF";
  
  if (pos.includes("ST") || pos.includes("CF") || pos.includes("LW") || 
      pos.includes("RW") || pos.includes("LS") || pos.includes("RS")) return "FW";
  
  return "Unknown";
};

// Formats slot string for display, returning em-dash for empty/undefined values
export const normalizeSlot = (slot?: string): string => {
  if (!slot) return "—";
  return slot.trim() || "—";
};

// Returns Tailwind CSS classes for position badge styling based on position category
export const getPositionColor = (position: string): string => {
  const line = coarseLine(position);
  
  switch (line) {
    case "GK":
      return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50";
    case "DF":
      return "bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/50";
    case "MF":
      return "bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50";
    case "FW":
      return "bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/50";
    default:
      return "bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/50";
  }
};

// Extracts player initials from full name (first 2 letters of name parts)
export const getPlayerInitials = (name: string): string => {
  if (!name) return "?";
  
  return name
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Human-readable labels for position categories
export const POSITION_LABELS: Record<string, string> = {
  GK: "Goalkeeper",
  DF: "Defense",
  MF: "Midfield",
  FW: "Forward",
  Unknown: "Unknown",
};

// Comparator function for sorting players by their slot position alphabetically
export const sortBySlot = (a: any, b: any): number => {
  const slotA = a.slot || "";
  const slotB = b.slot || "";
  
  if (!slotA && !slotB) return 0;
  if (!slotA) return 1;
  if (!slotB) return -1;
  
  return slotA.localeCompare(slotB);
};

// Checks if player matches search query by name, position, or slot (case-insensitive)
export const matchesSearchQuery = (player: any, query: string): boolean => {
  if (!query) return true;
  
  const q = query.toLowerCase();
  const name = (player.name || "").toLowerCase();
  const position = (player.position || "").toLowerCase();
  const slot = (player.slot || "").toLowerCase();
  
  return name.includes(q) || position.includes(q) || slot.includes(q);
};

// Checks if player matches position filter category (All, GK, DF, MF, FW)
export const matchesPositionFilter = (player: any, filter: string): boolean => {
  if (filter === "All") return true;
  return coarseLine(player.position) === filter;
};