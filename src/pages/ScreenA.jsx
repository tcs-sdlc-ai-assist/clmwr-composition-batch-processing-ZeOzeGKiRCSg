import { DemoForm } from '../components/form/DemoForm.jsx';
import { ValidationLogPanel } from '../components/logging/ValidationLogPanel.jsx';

/**
 * Screen A page component — "Current State (No Validation)".
 * Renders the DemoForm with validation disabled to demonstrate the current
 * behavior where all characters are accepted without Codepage 1252 checks.
 * Includes a header banner explaining the screen's purpose and a
 * ValidationLogPanel below the form.
 *
 * User Stories: SCRUM-9782, SCRUM-9783, SCRUM-9779
 *
 * @returns {JSX.Element} The rendered Screen A page component.
 */
export function ScreenA() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Screen A — No Validation (Current State)
        </h1>
        <div className="mt-3 rounded-md bg-brand-50 border border-brand-200 p-4">
          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-brand-500 text-white"
              aria-hidden="true"
            >
              ℹ
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-brand-800">
                Current Behavior — No Encoding Validation
              </p>
              <p className="mt-1 text-sm text-brand-700">
                This screen demonstrates the current state where all characters are accepted
                without Codepage 1252 validation. Any Unicode character can be submitted,
                including characters that may cause encoding issues downstream. Compare with
                Screen B to see the validated experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      <DemoForm validationEnabled={false} screenKey="a" />

      <div className="border-t border-gray-200 pt-6">
        <ValidationLogPanel />
      </div>
    </div>
  );
}

export default ScreenA;