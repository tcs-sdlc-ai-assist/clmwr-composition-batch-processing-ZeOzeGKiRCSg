/**
 * SimulatedBackendValidator — Mimics a backend validation endpoint.
 * Wraps validationService.validate() with simulated processing delay measurement,
 * returns a structured response object. Logs failures via logService and records
 * in monitoringService.
 *
 * User Stories: SCRUM-9781, SCRUM-9787, SCRUM-9788, SCRUM-9790, SCRUM-9793
 */

import { validate } from './validationService.js';
import { logFailure } from './logService.js';
import { recordFailure } from './monitoringService.js';

/**
 * @typedef {Object} ValidationResponse
 * @property {boolean} isValid - Whether the payload passed Codepage 1252 validation.
 * @property {import('./validationService.js').ValidationError[]} errors - Array of validation errors (empty if valid).
 * @property {number} processingTimeMs - Simulated processing time in milliseconds.
 * @property {string} timestamp - ISO 8601 timestamp of when the validation was performed.
 * @property {number} simulatedStatusCode - Simulated HTTP status code (200 for valid, 422 for invalid, 400 for bad input).
 */

/**
 * Validates a form data payload against Codepage 1252 encoding, simulating
 * a backend validation endpoint. Measures processing time, logs failures
 * via logService, and records them in monitoringService.
 *
 * @param {Object.<string, string>} formData - An object mapping field names to string values.
 * @param {string} [screenType=''] - The screen identifier where the validation occurred (e.g., 'a' or 'b').
 * @returns {ValidationResponse} A structured response object mimicking a backend API response.
 */
export function validatePayload(formData, screenType) {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();
  const normalizedScreen = String(screenType || '').toLowerCase().trim();

  // Handle invalid input
  if (!formData || typeof formData !== 'object') {
    const endTime = performance.now();
    return {
      isValid: false,
      errors: [],
      processingTimeMs: parseFloat((endTime - startTime).toFixed(2)),
      timestamp,
      simulatedStatusCode: 400,
    };
  }

  // Run validation
  const errors = validate(formData);
  const endTime = performance.now();
  const processingTimeMs = parseFloat((endTime - startTime).toFixed(2));

  const isValid = errors.length === 0;
  const simulatedStatusCode = isValid ? 200 : 422;

  // Log failures and record in monitoring service
  if (!isValid) {
    const logEntries = logFailure(errors, normalizedScreen);

    for (let i = 0; i < logEntries.length; i++) {
      recordFailure(logEntries[i]);
    }
  }

  return {
    isValid,
    errors,
    processingTimeMs,
    timestamp,
    simulatedStatusCode,
  };
}