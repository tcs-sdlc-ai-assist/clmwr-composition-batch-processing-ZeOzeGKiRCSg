/**
 * PersistenceService — Abstracts all localStorage operations with error handling
 * for quota exceeded and unavailability.
 *
 * Uses namespaced keys to avoid collisions. Provides graceful fallback
 * when localStorage is unavailable or quota is exceeded.
 *
 * User Stories: SCRUM-9780, SCRUM-9785, SCRUM-9786, SCRUM-9789
 */

/**
 * Namespace prefix for all localStorage keys.
 * @type {string}
 */
const NAMESPACE = 'clmwr';

/**
 * Namespaced localStorage keys.
 * @type {Object.<string, string>}
 */
const KEYS = {
  screen_a_input: `${NAMESPACE}_screen_a_input`,
  screen_b_input: `${NAMESPACE}_screen_b_input`,
  validation_logs: `${NAMESPACE}_validation_logs`,
  monitoring: `${NAMESPACE}_monitoring`,
};

/**
 * Resolves the namespaced localStorage key for a given screen.
 * @param {string} screenKey - The screen identifier (e.g., 'a' or 'b').
 * @returns {string} The namespaced localStorage key.
 */
function resolveScreenKey(screenKey) {
  const normalized = String(screenKey).toLowerCase().trim();
  const mapped = KEYS[`screen_${normalized}_input`];
  if (mapped) {
    return mapped;
  }
  return `${NAMESPACE}_screen_${normalized}_input`;
}

/**
 * Checks whether localStorage is available and functional in the current environment.
 * Tests by writing and removing a sentinel value.
 * @returns {boolean} True if localStorage is available and writable, false otherwise.
 */
export function isLocalStorageAvailable() {
  const testKey = `${NAMESPACE}_storage_test`;
  try {
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely writes a JSON-serializable value to localStorage under the given key.
 * Handles quota exceeded and other errors gracefully.
 * @param {string} key - The localStorage key.
 * @param {*} value - The value to serialize and store.
 * @returns {boolean} True if the write succeeded, false otherwise.
 */
function safeSetItem(key, value) {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    if (error instanceof DOMException &&
      (error.code === 22 ||
        error.code === 1014 ||
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      console.warn(`[PersistenceService] Storage quota exceeded when writing key "${key}".`);
    } else {
      console.error(`[PersistenceService] Failed to write key "${key}":`, error);
    }
    return false;
  }
}

/**
 * Safely reads and parses a JSON value from localStorage.
 * @param {string} key - The localStorage key.
 * @returns {*} The parsed value, or null if the key does not exist or parsing fails.
 */
function safeGetItem(key) {
  if (!isLocalStorageAvailable()) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error(`[PersistenceService] Failed to read key "${key}":`, error);
    return null;
  }
}

/**
 * Safely removes a key from localStorage.
 * @param {string} key - The localStorage key to remove.
 * @returns {boolean} True if the removal succeeded, false otherwise.
 */
function safeRemoveItem(key) {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[PersistenceService] Failed to remove key "${key}":`, error);
    return false;
  }
}

/**
 * Saves form input data for a specific screen.
 * @param {string} screenKey - The screen identifier (e.g., 'a' or 'b').
 * @param {Object.<string, string>} formData - The form data to persist.
 * @returns {boolean} True if the save succeeded, false otherwise.
 */
export function saveInput(screenKey, formData) {
  const key = resolveScreenKey(screenKey);
  return safeSetItem(key, formData);
}

/**
 * Loads previously saved form input data for a specific screen.
 * @param {string} screenKey - The screen identifier (e.g., 'a' or 'b').
 * @returns {Object.<string, string>|null} The saved form data, or null if none exists.
 */
export function loadInput(screenKey) {
  const key = resolveScreenKey(screenKey);
  return safeGetItem(key);
}

/**
 * Saves validation logs to localStorage.
 * @param {Array} logs - The array of validation log entries to persist.
 * @returns {boolean} True if the save succeeded, false otherwise.
 */
export function saveLogs(logs) {
  return safeSetItem(KEYS.validation_logs, logs);
}

/**
 * Loads previously saved validation logs from localStorage.
 * @returns {Array|null} The saved logs array, or null if none exists.
 */
export function loadLogs() {
  return safeGetItem(KEYS.validation_logs);
}

/**
 * Saves monitoring data to localStorage.
 * @param {*} data - The monitoring data to persist.
 * @returns {boolean} True if the save succeeded, false otherwise.
 */
export function saveMonitoring(data) {
  return safeSetItem(KEYS.monitoring, data);
}

/**
 * Loads previously saved monitoring data from localStorage.
 * @returns {*} The saved monitoring data, or null if none exists.
 */
export function loadMonitoring() {
  return safeGetItem(KEYS.monitoring);
}

/**
 * Clears all CLMWR-namespaced keys from localStorage.
 * Does not affect keys from other applications.
 * @returns {boolean} True if the operation succeeded, false otherwise.
 */
export function clearAll() {
  if (!isLocalStorageAvailable()) {
    return false;
  }
  try {
    const keysToRemove = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(NAMESPACE)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      window.localStorage.removeItem(key);
    }
    return true;
  } catch (error) {
    console.error('[PersistenceService] Failed to clear all keys:', error);
    return false;
  }
}

/**
 * Clears the saved input data for a specific screen.
 * @param {string} screenKey - The screen identifier (e.g., 'a' or 'b').
 * @returns {boolean} True if the removal succeeded, false otherwise.
 */
export function clearScreen(screenKey) {
  const key = resolveScreenKey(screenKey);
  return safeRemoveItem(key);
}