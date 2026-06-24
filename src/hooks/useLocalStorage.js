import { useState, useEffect, useCallback } from 'react';

/**
 * Custom React hook that syncs React state with localStorage.
 * Provides JSON serialization/deserialization, error handling for
 * unavailable localStorage, and cross-tab synchronization via storage events.
 *
 * User Stories: SCRUM-9780, SCRUM-9785, SCRUM-9789
 *
 * @param {string} key - The localStorage key to use for persistence.
 * @param {*} initialValue - The initial value to use if no stored value exists.
 * @returns {[*, function]} A tuple of [storedValue, setValue] similar to useState.
 */
export function useLocalStorage(key, initialValue) {
  /**
   * Checks whether localStorage is available and functional.
   * @returns {boolean} True if localStorage is available, false otherwise.
   */
  const isAvailable = useCallback(() => {
    const testKey = '__useLocalStorage_test__';
    try {
      window.localStorage.setItem(testKey, 'test');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }, []);

  /**
   * Reads the current value from localStorage for the given key.
   * Falls back to initialValue if the key does not exist or parsing fails.
   * @returns {*} The parsed value from localStorage, or initialValue.
   */
  const readStoredValue = useCallback(() => {
    if (!isAvailable()) {
      return initialValue;
    }

    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) {
        return initialValue;
      }
      return JSON.parse(raw);
    } catch (error) {
      console.error(`[useLocalStorage] Failed to read key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue, isAvailable]);

  const [storedValue, setStoredValue] = useState(readStoredValue);

  /**
   * Sets a new value in both React state and localStorage.
   * Accepts a direct value or a function updater (like useState).
   *
   * @param {*|function} value - The new value, or a function that receives the previous value and returns the new value.
   */
  const setValue = useCallback((value) => {
    try {
      setStoredValue((prevValue) => {
        const valueToStore = typeof value === 'function' ? value(prevValue) : value;

        if (isAvailable()) {
          try {
            const serialized = JSON.stringify(valueToStore);
            window.localStorage.setItem(key, serialized);
          } catch (error) {
            if (
              error instanceof DOMException &&
              (error.code === 22 ||
                error.code === 1014 ||
                error.name === 'QuotaExceededError' ||
                error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
            ) {
              console.warn(`[useLocalStorage] Storage quota exceeded when writing key "${key}".`);
            } else {
              console.error(`[useLocalStorage] Failed to write key "${key}":`, error);
            }
          }
        }

        return valueToStore;
      });
    } catch (error) {
      console.error(`[useLocalStorage] Failed to set value for key "${key}":`, error);
    }
  }, [key, isAvailable]);

  /**
   * Cross-tab synchronization via the storage event.
   * When another tab modifies the same key, this tab's state is updated.
   */
  useEffect(() => {
    /**
     * Handles the storage event fired when localStorage is modified in another tab.
     * @param {StorageEvent} event - The storage event.
     */
    function handleStorageChange(event) {
      if (event.key !== key) {
        return;
      }

      if (event.newValue === null) {
        setStoredValue(initialValue);
        return;
      }

      try {
        const parsed = JSON.parse(event.newValue);
        setStoredValue(parsed);
      } catch (error) {
        console.error(`[useLocalStorage] Failed to parse storage event for key "${key}":`, error);
      }
    }

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  /**
   * Re-read from localStorage if the key changes.
   */
  useEffect(() => {
    setStoredValue(readStoredValue());
  }, [key, readStoredValue]);

  return [storedValue, setValue];
}