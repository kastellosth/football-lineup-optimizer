import { useState, useMemo } from 'react';

/**
 * Custom hook for managing filters and search functionality
 * Provides search query, position filter, and sort functionality
 * 
 * @template T - The type of items being filtered
 * @returns Object with filter state and control functions
 * 
 * @example
 * const filters = useFilters();
 * 
 * <input value={filters.searchQuery} onChange={(e) => filters.setSearchQuery(e.target.value)} />
 * <select value={filters.positionFilter} onChange={(e) => filters.setPositionFilter(e.target.value)} />
 */
export function useFilters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"name" | "slot" | "overall" | "number">("slot");

  const clearFilters = () => {
    setSearchQuery("");
    setPositionFilter("All");
  };

  const hasActiveFilters = useMemo(() => {
    return searchQuery !== "" || positionFilter !== "All";
  }, [searchQuery, positionFilter]);

  return {
    searchQuery,
    setSearchQuery,
    positionFilter,
    setPositionFilter,
    sortBy,
    setSortBy,
    clearFilters,
    hasActiveFilters,
  };
}