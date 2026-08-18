import { useState } from 'react';
import { parseCSVToPlayers } from '@/lib/parsers/parser';

/**
 * Custom hook for CSV import functionality
 * Handles file reading, parsing, validation, and error handling
 * 
 * @template T - The type of data being imported
 * @returns Object with data, error state, loading state, and import handler
 * 
 * @example
 * const { data: players, error, isLoading, handleImport } = useCSVImport<Player>();
 * 
 * <input type="file" onChange={(e) => handleImport(e, validatePlayers)} />
 */
export function useCSVImport<T = any>() {
  const [data, setData] = useState<T[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImport = async (
    e: React.ChangeEvent<HTMLInputElement>,
    validator?: (items: any[]) => T[]
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsLoading(true);

    try {
      const text = await file.text();
      const parsed = parseCSVToPlayers(text);
      
      const validated = validator ? validator(parsed) : parsed as T[];
      
      if (validated.length === 0) {
        throw new Error("No valid data found in CSV. Please check the file format.");
      }

      setData(validated);
      console.log(`✅ Successfully imported ${validated.length} items`);
    } catch (err: any) {
      const errorMsg = err?.message || "Unknown error occurred during import";
      setError(errorMsg);
      console.error("CSV import failed:", err);
    } finally {
      setIsLoading(false);
      e.target.value = "";
    }
  };

  const clearData = () => {
    setData([]);
    setError(null);
  };

  return { 
    data, 
    setData,
    error, 
    isLoading, 
    handleImport,
    clearData 
  };
}