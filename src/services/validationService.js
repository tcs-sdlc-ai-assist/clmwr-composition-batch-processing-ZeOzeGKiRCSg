/**
 * Codepage 1252 validation service.
 * Core validation engine for checking field values against Codepage 1252 encoding.
 *
 * Pure functions with no side effects. Designed for <50ms execution
 * with early-exit optimization.
 *
 * User Stories: SCRUM-9779, SCRUM-9782, SCRUM-9784, SCRUM-9787,
 *               SCRUM-9788, SCRUM-9790, SCRUM-9792, SCRUM-9793
 */

import { isValidCodepage1252Char } from '../constants/codepage1252.js';

/**
 * @typedef {Object} InvalidChar
 * @property {string} char - The invalid character.
 * @property {number} codePoint - The Unicode code point of the invalid character.
 * @property {number} position - The zero-based index of the character in the string.
 */

/**
 * @typedef {Object} ValidationError
 * @property {string} field - The field name that contains invalid characters.
 * @property {InvalidChar[]} invalidChars - Array of invalid character details.
 * @property {string} message - Human-readable error message.
 */

/**
 * Checks whether a given string contains only valid Codepage 1252 characters.
 * Uses early-exit optimization — returns false on the first invalid character found.
 *
 * @param {string} str - The string to validate.
 * @returns {boolean} True if every character in the string is valid Codepage 1252, false otherwise.
 */
export function isCodepage1252(str) {
  if (typeof str !== 'string') {
    return false;
  }

  for (let i = 0; i < str.length; i++) {
    const codePoint = str.charCodeAt(i);
    if (!isValidCodepage1252Char(codePoint)) {
      return false;
    }
  }

  return true;
}

/**
 * Finds all invalid (non-Codepage 1252) characters in a string.
 *
 * @param {string} str - The string to scan.
 * @returns {InvalidChar[]} Array of objects describing each invalid character found.
 */
function findInvalidChars(str) {
  const invalidChars = [];

  for (let i = 0; i < str.length; i++) {
    const codePoint = str.charCodeAt(i);
    if (!isValidCodepage1252Char(codePoint)) {
      invalidChars.push({
        char: str.charAt(i),
        codePoint,
        position: i,
      });
    }
  }

  return invalidChars;
}

/**
 * Formats a human-readable error message for a field with invalid characters.
 *
 * @param {string} field - The field name.
 * @param {InvalidChar[]} invalidChars - The invalid characters found.
 * @returns {string} A descriptive error message.
 */
function formatErrorMessage(field, invalidChars) {
  const charDescriptions = invalidChars.map(
    (ic) => `'${ic.char}' (U+${ic.codePoint.toString(16).toUpperCase().padStart(4, '0')} at position ${ic.position})`
  );

  const count = invalidChars.length;
  const plural = count === 1 ? 'character' : 'characters';

  return `Field "${field}" contains ${count} invalid ${plural} not in Codepage 1252: ${charDescriptions.join(', ')}`;
}

/**
 * Validates all fields in a form data object for Codepage 1252 compliance.
 * Iterates over each key-value pair and collects validation errors for fields
 * that contain characters outside the Codepage 1252 encoding.
 *
 * @param {Object.<string, string>} formData - An object mapping field names to string values.
 * @returns {ValidationError[]} Array of validation error objects. Empty array if all fields are valid.
 */
export function validate(formData) {
  if (!formData || typeof formData !== 'object') {
    return [];
  }

  const errors = [];
  const keys = Object.keys(formData);

  for (let i = 0; i < keys.length; i++) {
    const field = keys[i];
    const value = formData[field];

    if (typeof value !== 'string' || value.length === 0) {
      continue;
    }

    // Early-exit: skip detailed scan if the string is fully valid
    if (isCodepage1252(value)) {
      continue;
    }

    const invalidChars = findInvalidChars(value);

    if (invalidChars.length > 0) {
      errors.push({
        field,
        invalidChars,
        message: formatErrorMessage(field, invalidChars),
      });
    }
  }

  return errors;
}