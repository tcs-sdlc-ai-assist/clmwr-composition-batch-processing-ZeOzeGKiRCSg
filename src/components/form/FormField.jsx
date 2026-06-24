import PropTypes from 'prop-types';

/**
 * Reusable form field component that renders a labeled input or textarea
 * with accessible error messaging and inline error display.
 *
 * Renders aria-describedby linking to error/help messages, aria-invalid
 * when an error is present, and highlights specific invalid characters found.
 *
 * User Stories: SCRUM-9784, SCRUM-9782, SCRUM-9779
 *
 * @param {Object} props - Component props.
 * @param {string} props.name - The field name, used as the input's name and id.
 * @param {string} props.label - Human-readable label for the field.
 * @param {string} props.value - Current value of the field.
 * @param {function} props.onChange - Change handler receiving the React change event.
 * @param {Object} [props.error] - Validation error object for this field.
 * @param {string} [props.error.message] - Human-readable error message.
 * @param {Array<{char: string, codePoint: number, position: number}>} [props.error.invalidChars] - Details of each invalid character.
 * @param {string} [props.type='text'] - Input type: 'text' or 'textarea'.
 * @param {boolean} [props.disabled=false] - Whether the field is disabled.
 * @param {string} [props.helpText] - Optional help text displayed below the field.
 * @returns {JSX.Element} The rendered form field component.
 */
export function FormField({
  name,
  label,
  value,
  onChange,
  error,
  type = 'text',
  disabled = false,
  helpText,
}) {
  const fieldId = name;
  const errorId = `${name}-error`;
  const helpId = `${name}-help`;
  const hasError = Boolean(error);

  /**
   * Builds the aria-describedby attribute value based on available descriptions.
   * @returns {string|undefined} Space-separated list of descriptor IDs, or undefined.
   */
  const getAriaDescribedBy = () => {
    const ids = [];
    if (hasError) {
      ids.push(errorId);
    }
    if (helpText) {
      ids.push(helpId);
    }
    return ids.length > 0 ? ids.join(' ') : undefined;
  };

  const baseInputClasses =
    'block w-full rounded-md shadow-sm text-sm transition-colors duration-150 focus-ring disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed';

  const inputClasses = hasError
    ? `${baseInputClasses} border-error-500 text-gray-900 placeholder-gray-400 focus:border-error-500 focus:ring-error-500`
    : `${baseInputClasses} border-gray-300 text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:ring-brand-500`;

  /**
   * Renders the list of invalid characters with their code points and positions.
   * @param {Array<{char: string, codePoint: number, position: number}>} invalidChars - Invalid character details.
   * @returns {JSX.Element|null} The rendered invalid character list, or null.
   */
  const renderInvalidChars = (invalidChars) => {
    if (!Array.isArray(invalidChars) || invalidChars.length === 0) {
      return null;
    }

    return (
      <ul className="mt-1 space-y-0.5">
        {invalidChars.map((ic, index) => (
          <li key={`${ic.codePoint}-${ic.position}-${index}`} className="flex items-center gap-1 text-xs text-error-600">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-error-100 text-error-700 font-mono text-xs font-bold flex-shrink-0">
              {ic.char}
            </span>
            <span>
              U+{ic.codePoint.toString(16).toUpperCase().padStart(4, '0')} at position {ic.position}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="space-y-1">
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
      </label>

      {type === 'textarea' ? (
        <textarea
          id={fieldId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          rows={4}
          className={`${inputClasses} px-3 py-2`}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={getAriaDescribedBy()}
        />
      ) : (
        <input
          id={fieldId}
          name={name}
          type="text"
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`${inputClasses} px-3 py-2`}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={getAriaDescribedBy()}
        />
      )}

      {helpText && !hasError && (
        <p id={helpId} className="text-xs text-gray-500">
          {helpText}
        </p>
      )}

      {hasError && (
        <div id={errorId} role="alert" className="mt-1">
          <p className="text-sm text-error-600 font-medium">
            {error.message}
          </p>
          {renderInvalidChars(error.invalidChars)}
        </div>
      )}
    </div>
  );
}

FormField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.shape({
    message: PropTypes.string,
    invalidChars: PropTypes.arrayOf(
      PropTypes.shape({
        char: PropTypes.string.isRequired,
        codePoint: PropTypes.number.isRequired,
        position: PropTypes.number.isRequired,
      })
    ),
  }),
  type: PropTypes.oneOf(['text', 'textarea']),
  disabled: PropTypes.bool,
  helpText: PropTypes.string,
};

export default FormField;