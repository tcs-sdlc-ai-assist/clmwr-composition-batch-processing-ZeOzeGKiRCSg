/**
 * LogService — Manages validation failure logging.
 * Creates structured log entries for validation failures and persists them
 * via the PersistenceService.
 *
 * User Stories: SCRUM-9781, SCRUM-9787, SCRUM-9788
 */

import { saveLogs, loadLogs } from './persistenceService.js';

/**
 * @typedef {Object} LogEntry
 * @property {string} id - Unique identifier for the log entry.
 * @property {string} timestamp - ISO 8601 timestamp of when the failure was logged.
 * @property {string} field - The field name that contained invalid characters.
 * @property {Array<{char: string, codePoint: number, position: number}>} invalidChars - Details of each invalid character.
 * @property {string} screenType - The screen where the validation failure occurred (e.g., 'a' or 'b').
 * @property {string} message - Human-readable error message.
 */

/**
 * Generates a unique ID for a log entry.
 * Uses a combination of timestamp and random string to ensure uniqueness.
 * @returns {string} A unique identifier string.
 */
function generateId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

/**
 * Logs validation failures by creating structured log entries and persisting them.
 * Each validation error produces a separate log entry with a unique ID and ISO timestamp.
 *
 * @param {import('./validationService.js').ValidationError[]} validationErrors - Array of validation error objects from the validation service.
 * @param {string} screenType - The screen identifier where the validation occurred (e.g., 'a' or 'b').
 * @returns {LogEntry[]} The array of newly created log entries.
 */
export function logFailure(validationErrors, screenType) {
  if (!Array.isArray(validationErrors) || validationErrors.length === 0) {
    return [];
  }

  const normalizedScreen = String(screenType || '').toLowerCase().trim();
  const existingLogs = loadLogs() || [];
  const timestamp = new Date().toISOString();
  const newEntries = [];

  for (let i = 0; i < validationErrors.length; i++) {
    const error = validationErrors[i];

    /** @type {LogEntry} */
    const entry = {
      id: generateId(),
      timestamp,
      field: error.field,
      invalidChars: error.invalidChars,
      screenType: normalizedScreen,
      message: error.message,
    };

    newEntries.push(entry);
  }

  const updatedLogs = [...existingLogs, ...newEntries];
  saveLogs(updatedLogs);

  return newEntries;
}

/**
 * Retrieves all stored validation failure logs.
 *
 * @returns {LogEntry[]} Array of all log entries, or an empty array if none exist.
 */
export function getLogs() {
  const logs = loadLogs();
  if (!Array.isArray(logs)) {
    return [];
  }
  return logs;
}

/**
 * Clears all stored validation failure logs.
 *
 * @returns {boolean} True if the logs were successfully cleared, false otherwise.
 */
export function clearLogs() {
  return saveLogs([]);
}