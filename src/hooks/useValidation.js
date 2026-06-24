import { useState, useCallback } from 'react';
import { validate } from '../services/validationService.js';

/**
 * Custom React hook that manages form validation state for Codepage 1252 encoding.
 * Provides validation execution, error tracking, and performance monitoring.
 *
 * User Stories: SCRUM-9779, SCRUM-9782, SCRUM-9784
 *
 * @param {boolean} validationEnabled - Whether validation is active. When false, validateForm always returns valid.
 * @returns {{
 *   errors: import('../services/validationService.js').ValidationError[],
 *   validateForm: (formData: Object.<string, string>) => import('../services/validationService.js').ValidationError[],
 *   clearErrors: () => void,
 *   clearFieldError: (fieldName: string) => void,
 *   hasErrors: boolean,
 *   validationTime: number
 * }} Validation state and control functions.
 */
export function useValidation(validationEnabled) {
  /** @type {[import('../services/validationService.js').ValidationError[], Function]} */
  const [errors, setErrors] = useState([]);

  /** @type {[number, Function]} */
  const [validationTime, setValidationTime] = useState(0);

  /**
   * Validates the provided form data against Codepage 1252 encoding.
   * When validationEnabled is false, always returns an empty array (valid).
   * Tracks execution time in milliseconds for performance monitoring.
   *
   * @param {Object.<string, string>} formData - An object mapping field names to string values.
   * @returns {import('../services/validationService.js').ValidationError[]} Array of validation errors. Empty if valid or validation is disabled.
   */
  const validateForm = useCallback((formData) => {
    if (!validationEnabled) {
      setErrors([]);
      setValidationTime(0);
      return [];
    }

    const startTime = performance.now();
    const validationErrors = validate(formData);
    const endTime = performance.now();
    const elapsed = parseFloat((endTime - startTime).toFixed(2));

    setErrors(validationErrors);
    setValidationTime(elapsed);

    return validationErrors;
  }, [validationEnabled]);

  /**
   * Clears all validation errors and resets validation time.
   */
  const clearErrors = useCallback(() => {
    setErrors([]);
    setValidationTime(0);
  }, []);

  /**
   * Clears the validation error for a specific field.
   *
   * @param {string} fieldName - The name of the field whose error should be cleared.
   */
  const clearFieldError = useCallback((fieldName) => {
    setErrors((prevErrors) => prevErrors.filter((error) => error.field !== fieldName));
  }, []);

  const hasErrors = errors.length > 0;

  return {
    errors,
    validateForm,
    clearErrors,
    clearFieldError,
    hasErrors,
    validationTime,
  };
}