/**
 * Player Attribute Utilities
 * 
 * Utilities for grouping, formatting, and styling player attributes with color-coded ratings.
 */

export const ATTRIBUTE_GROUPS = {
  Shooting: ["positioning", "finishing", "volleys", "penalties", "shotpower", "longshots"],
  Passing: ["vision", "curve", "longpassing", "shortpassing", "freekickaccuracy", "crossing"],
  Dribbling: ["agility", "reactions", "composure", "balance", "ballcontrol", "dribbling"],
  Defense: ["interceptions", "headingaccuracy", "defensiveawareness", "standingtackle", "slidingtackle"],
  Physicality: ["jumping", "stamina", "strength", "aggression"],
  Pace: ["acceleration", "sprintspeed"],
};

// Returns Tailwind background color class based on attribute value thresholds (90+, 80+, 70+, 60+)
export const getAttributeColor = (value: number): string => {
  if (value >= 90) return "bg-green-500";
  if (value >= 80) return "bg-lime-500";
  if (value >= 70) return "bg-yellow-500";
  if (value >= 60) return "bg-orange-500";
  return "bg-red-500";
};

// Returns Tailwind text color class based on attribute value thresholds with dark mode support
export const getAttributeTextColor = (value: number): string => {
  if (value >= 90) return "text-green-600 dark:text-green-400 font-semibold";
  if (value >= 80) return "text-lime-600 dark:text-lime-400 font-medium";
  if (value >= 70) return "text-yellow-600 dark:text-yellow-400";
  if (value >= 60) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
};

// Rounds attribute value to nearest integer, returning 0 for undefined/null values
export const formatAttributeValue = (value?: number): number => {
  if (value === undefined || value === null) return 0;
  return Math.round(value);
};

// Returns Tailwind border and background classes for severity levels (critical, high, medium, low)
export const getSeverityColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case "critical":
      return "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
    case "high":
      return "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-400";
    case "medium":
      return "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    case "low":
      return "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
    default:
      return "border-gray-500 bg-gray-500/10 text-gray-700 dark:text-gray-400";
  }
};