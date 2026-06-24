import { useState, useCallback } from 'react';
import { DemoForm } from '../components/form/DemoForm.jsx';
import { ValidationLogPanel } from '../components/logging/ValidationLogPanel.jsx';
import { AlertBanner } from '../components/monitoring/AlertBanner.jsx';
import { useMonitoring } from '../hooks/useMonitoring.js';

/**
 * Screen B page component — "Future State (Validation Enabled)".
 * Renders the DemoForm with validation enabled to demonstrate the future-state
 * behavior where Codepage 1252 encoding validation is enforced on all fields.
 * Includes a header banner explaining the screen's purpose, a ValidationLogPanel
 * below the form, and an AlertBanner displaying monitoring alerts.
 *
 * User Stories: SCRUM-9782, SCRUM-9783, SCRUM-9779, SCRUM-9784, SCRUM-9781
 *
 * @returns {JSX.Element} The rendered Screen B page component.
 */
export function ScreenB() {
  const { alerts, dismissAlert } = useMonitoring({
    pollInterval: 5000,
    enabled: true,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Screen B — Codepage 1252 Validation (Future State)
        </h1>
        <div className="mt-3 rounded-md bg-success-50 border border-success-200 p-4">
          <div className="flex items-start gap-3">
            <div
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-success-500 text-white"
              aria-hidden="true"
            >
              ✓
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-success-800">
                Future State — Codepage 1252 Encoding Validation Enabled
              </p>
              <p className="mt-1 text-sm text-success-700">
                This screen demonstrates the future state where all form fields are validated
                against Codepage 1252 encoding on submission. Characters outside the valid
                Codepage 1252 range will be flagged with detailed error messages showing the
                invalid character, its Unicode code point, and position. Compare with Screen A
                to see the difference validation makes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <AlertBanner alerts={alerts} onDismiss={dismissAlert} />
      )}

      <DemoForm validationEnabled={true} screenKey="b" />

      <div className="border-t border-gray-200 pt-6">
        <ValidationLogPanel />
      </div>
    </div>
  );
}

export default ScreenB;