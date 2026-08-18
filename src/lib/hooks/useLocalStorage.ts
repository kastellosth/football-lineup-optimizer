import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for localStorage with automatic persistence
 * Handles JSON serialization, error handling, and auto-save
 * 
 * @template T - The type of data being stored
 * @param key - localStorage key
 * @param initialValue - Default value if no data exists
 * @param options - Configuration options
 * @returns [value, setValue, clearValue] tuple
 * 
 * @example
 * const [user, setUser, clearUser] = useLocalStorage('user', { name: '', age: 0 });
 * setUser({ name: 'John', age: 30 });
 * clearUser(); // Remove from storage
 */

interface UseLocalStorageOptions {
  useSession?: boolean;
  serializer?: (value: any) => string;
  deserializer?: (value: string) => any;
  onError?: (error: Error) => void;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  
  const {
    useSession = false,
    serializer = JSON.stringify,
    deserializer = JSON.parse,
    onError,
  } = options;

  const storage = useSession ? sessionStorage : localStorage;

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      
      try {
        return deserializer(item);
      } catch (parseError) {
        console.warn(`Could not parse ${key}, using raw value:`, item);
        return item as unknown as T;
      }
    } catch (error) {
      console.error(`Error loading ${key} from storage:`, error);
      onError?.(error as Error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      if (storedValue === undefined || storedValue === null) {
        storage.removeItem(key);
        return;
      }

      storage.setItem(key, serializer(storedValue));
    } catch (error) {
      console.error(`Error saving ${key} to storage:`, error);
      onError?.(error as Error);
    }
  }, [key, storedValue, storage, serializer, onError]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      onError?.(error as Error);
    }
  }, [key, storedValue, onError]);

  const clearValue = useCallback(() => {
    try {
      storage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error clearing ${key}:`, error);
      onError?.(error as Error);
    }
  }, [key, storage, initialValue, onError]);

  return [storedValue, setValue, clearValue];
}


export function useSessionStorage<T>(
  key: string,
  initialValue: T,
  options: Omit<UseLocalStorageOptions, 'useSession'> = {}
) {
  return useLocalStorage(key, initialValue, { ...options, useSession: true });
}