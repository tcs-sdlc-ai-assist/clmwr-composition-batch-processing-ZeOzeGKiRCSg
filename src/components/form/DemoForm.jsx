import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FormField } from './FormField.jsx';
import { DEFAULT_FORM_DATA, FIELD_LABELS, FIELD_DESCRIPTIONS } from '../../constants/mockData.js';
import { saveInput, loadInput } from '../../services/persistenceService.js';
import { validatePayload } from '../../services/simulatedBackendValidator.js';

/**
 * Ordered list of field keys to render in the form.
 * @type {string[]}
 */
const FIELD_ORDER = [
  'claimId',
  'memberName',
  'providerName',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'zipCode',
  'notes',
  'remittanceInfo',
];

/**
 * Fields that should render as textarea instead of text input.
 * @type {Set<string>}
 */
const TEXTAREA_FIELDS = new Set(['notes', 'remittanceInfo']);

/**
 * @typedef {Object} SubmissionResult
 * @property {boolean} isValid - Whether the submission passed validation.
 * @property {number} processingTimeMs - Processing time in milliseconds.
 * @property {string} timestamp - ISO 8601 timestamp of the submission.
 * @property {number} simulatedStatusCode - Simulated HTTP status code.
 * @property {number} errorCount - Number of validation errors.
 */

/**
 * Core demo form component with validation integration.
 * Renders all claim fields using FormField components, pre-populated from
 * mockData or localStorage. Supports validation toggle and localStorage isolation
 * per screen.
 *
 * User Stories: SCRUM-9782, SCRUM-9783, SCRUM-9779, SCRUM-9784, SCRUM-9780, SCRUM-9786, SCRUM-9789
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.validationEnabled - Whether Codepage 1252 validation is active on submit.
 * @param {string} props.screenKey - Screen identifier for localStorage isolation (e.g., 'a' or 'b').
 * @returns {JSX.Element} The rendered demo form component.
 */
export function DemoForm({ validationEnabled, screenKey }) {
  const [formData, setFormData] = useState(() => {
    const saved = loadInput(screenKey);
    if (saved && typeof saved === 'object') {
      return { ...DEFAULT_FORM_DATA, ...saved };
    }
    return { ...DEFAULT_FORM_DATA };
  });

  const [errors, setErrors] = useState({});
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Persist form data to localStorage whenever it changes.
   */
  useEffect(() => {
    saveInput(screenKey, formData);
  }, [formData, screenKey]);

  /**
   * Handles input change for a specific field.
   * Updates form data state and clears any existing error for that field.
   *
   * @param {React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>} event - The change event.
   */
  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => {
      if (prev[name]) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return prev;
    });
  }, []);

  /**
   * Handles form submission.
   * If validationEnabled, runs the simulated backend validator.
   * If not, accepts all input as valid.
   *
   * @param {React.FormEvent} event - The form submit event.
   */
  const handleSubmit = useCallback((event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSubmissionResult(null);

    try {
      if (validationEnabled) {
        const response = validatePayload(formData, screenKey);

        /** @type {Object.<string, {message: string, invalidChars: Array}>} */
        const errorMap = {};
        for (let i = 0; i < response.errors.length; i++) {
          const err = response.errors[i];
          errorMap[err.field] = {
            message: err.message,
            invalidChars: err.invalidChars,
          };
        }
        setErrors(errorMap);

        setSubmissionResult({
          isValid: response.isValid,
          processingTimeMs: response.processingTimeMs,
          timestamp: response.timestamp,
          simulatedStatusCode: response.simulatedStatusCode,
          errorCount: response.errors.length,
        });
      } else {
        setSubmissionResult({
          isValid: true,
          processingTimeMs: 0,
          timestamp: new Date().toISOString(),
          simulatedStatusCode: 200,
          errorCount: 0,
        });
      }
    } catch (error) {
      console.error('[DemoForm] Submission error:', error);
      setSubmissionResult({
        isValid: false,
        processingTimeMs: 0,
        timestamp: new Date().toISOString(),
        simulatedStatusCode: 500,
        errorCount: 0,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validationEnabled, screenKey]);

  /**
   * Resets the form to the default mock data values.
   */
  const handleResetToDefault = useCallback(() => {
    setFormData({ ...DEFAULT_FORM_DATA });
    setErrors({});
    setSubmissionResult(null);
  }, []);

  /**
   * Clears all form fields to empty strings.
   */
  const handleClearForm = useCallback(() => {
    const cleared = {};
    for (let i = 0; i < FIELD_ORDER.length; i++) {
      cleared[FIELD_ORDER[i]] = '';
    }
    setFormData(cleared);
    setErrors({});
    setSubmissionResult(null);
  }, []);

  /**
   * Renders the submission result status banner.
   * @returns {JSX.Element|null} The status banner, or null if no result.
   */
  const renderSubmissionResult = () => {
    if (!submissionResult) {
      return null;
    }

    const isSuccess = submissionResult.isValid;

    return (
      <div
        role="status"
        className={`rounded-md p-4 ${
          isSuccess
            ? 'bg-success-50 border border-success-200'
            : 'bg-error-50 border border-error-200'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full flex items-center justify-center text-xs font-bold ${
              isSuccess
                ? 'bg-success-500 text-white'
                : 'bg-error-500 text-white'
            }`}
          >
            {isSuccess ? '✓' : '✗'}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-semibold ${
                isSuccess ? 'text-success-800' : 'text-error-800'
              }`}
            >
              {isSuccess
                ? 'Submission Accepted'
                : `Validation Failed — ${submissionResult.errorCount} error${submissionResult.errorCount === 1 ? '' : 's'} found`}
            </p>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
              <span>
                Status: <span className="font-mono font-medium">{submissionResult.simulatedStatusCode}</span>
              </span>
              <span>
                Processing: <span className="font-mono font-medium">{submissionResult.processingTimeMs}ms</span>
              </span>
              <span>
                Timestamp: <span className="font-mono font-medium">{submissionResult.timestamp}</span>
              </span>
              {validationEnabled && (
                <span>
                  Validation: <span className="font-mono font-medium text-brand-600">Enabled</span>
                </span>
              )}
              {!validationEnabled && (
                <span>
                  Validation: <span className="font-mono font-medium text-gray-400">Disabled</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {renderSubmissionResult()}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FIELD_ORDER.map((fieldKey) => {
          const isTextarea = TEXTAREA_FIELDS.has(fieldKey);

          return (
            <div
              key={fieldKey}
              className={isTextarea ? 'md:col-span-2' : ''}
            >
              <FormField
                name={fieldKey}
                label={FIELD_LABELS[fieldKey] || fieldKey}
                value={formData[fieldKey] || ''}
                onChange={handleChange}
                error={errors[fieldKey] || undefined}
                type={isTextarea ? 'textarea' : 'text'}
                disabled={isSubmitting}
                helpText={FIELD_DESCRIPTIONS[fieldKey]}
              />
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 rounded-md text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus-ring transition-colors duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Submitting…' : 'Submit'}
        </button>

        <button
          type="button"
          onClick={handleResetToDefault}
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus-ring transition-colors duration-150 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Reset to Default
        </button>

        <button
          type="button"
          onClick={handleClearForm}
          disabled={isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-medium text-error-700 bg-white border border-error-300 hover:bg-error-50 focus-ring transition-colors duration-150 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          Clear Form
        </button>
      </div>
    </form>
  );
}

DemoForm.propTypes = {
  validationEnabled: PropTypes.bool.isRequired,
  screenKey: PropTypes.string.isRequired,
};

export default DemoForm;