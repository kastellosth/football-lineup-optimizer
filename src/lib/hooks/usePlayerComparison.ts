import { useState } from 'react';

/**
 * Custom hook for player comparison functionality
 * Manages selection, toggling, and display of player comparisons
 * 
 * @template T - Player type (must have shirtNumber or name)
 * @param maxPlayers - Maximum number of players that can be compared (default: 4)
 * @returns Object with comparison state and control functions
 * 
 * @example
 * const comparison = usePlayerComparison<Player>(4);
 * 
 * <Button onClick={() => comparison.toggle(player)}>Compare</Button>
 * {comparison.isOpen && <PlayerComparison players={comparison.compareList} />}
 */
export function usePlayerComparison<T extends { shirtNumber?: number; name: string }>(
  maxPlayers = 4
) {
  const [compareList, setCompareList] = useState<T[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);


  const togglePlayer = (player: T) => {
    const identifier = player.shirtNumber || player.name;
    const isSelected = compareList.some(p => 
      (p.shirtNumber || p.name) === identifier
    );

    if (isSelected) {
      const newList = compareList.filter(p => 
        (p.shirtNumber || p.name) !== identifier
      );
      setCompareList(newList);
      
      if (newList.length < 2) {
        setIsComparisonOpen(false);
      }
    } else {
      if (compareList.length >= maxPlayers) {
        alert(`Maximum ${maxPlayers} players can be compared at once`);
        return;
      }
      setCompareList([...compareList, player]);
    }
  };


  const removePlayer = (player: T) => {
    const newList = compareList.filter(p => 
      (p.shirtNumber || p.name) !== (player.shirtNumber || player.name)
    );
    setCompareList(newList);
    
    if (newList.length < 2) {
      setIsComparisonOpen(false);
    }
  };


  const clearAll = () => {
    setCompareList([]);
    setIsComparisonOpen(false);
  };


  const toggleView = () => {
    if (compareList.length < 2) {
      alert("Please select at least 2 players to compare");
      return;
    }
    setIsComparisonOpen(!isComparisonOpen);
  };


  const isSelected = (player: T): boolean => {
    const identifier = player.shirtNumber || player.name;
    return compareList.some(p => (p.shirtNumber || p.name) === identifier);
  };

  return {
    compareList,
    isComparisonOpen,
    togglePlayer,
    removePlayer,
    clearAll,
    toggleView,
    isSelected,
    setIsComparisonOpen,
  };
}