/**
 * Style Utilities
 * 
 * Tailwind CSS class merging utility combining clsx and tailwind-merge for optimal class handling.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Merges and deduplicates Tailwind CSS classes, resolving conflicts intelligently
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}