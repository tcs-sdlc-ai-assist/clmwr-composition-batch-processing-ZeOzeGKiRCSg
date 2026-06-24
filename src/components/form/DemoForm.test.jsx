import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DemoForm } from './DemoForm.jsx';
import { DEFAULT_FORM_DATA, FIELD_LABELS } from '../../constants/mockData.js';

// Mock persistenceService to avoid localStorage side effects
vi.mock('../../services/persistenceService.js', () => ({
  saveInput: vi.fn(() => true),
  loadInput: vi.fn(() => null),
}));

// Mock simulatedBackendValidator
vi.mock('../../services/simulatedBackendValidator.js', () => ({
  validatePayload: vi.fn(),
}));

import { loadInput, saveInput } from '../../services/persistenceService.js';
import { validatePayload } from '../../services/simulatedBackendValidator.js';

describe('DemoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loadInput.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('renders all form fields with default mock data labels', () => {
      render(<DemoForm validationEnabled={false} screenKey="a" />);

      const labelEntries = Object.entries(FIELD_LABELS);
      for (let i = 0; i < labelEntries.length; i++) {
        const [, label] = labelEntries[i];
        expect(screen.getByLabelText(label)).toBeInTheDocument();
      }
    });

    it('renders all form fields pre-populated with default mock data values', () => {
      render(<DemoForm validationEnabled={false} screenKey="a" />);

      expect(screen.getByLabelText('Claim ID')).toHaveValue(DEFAULT_FORM_DATA.claimId);
      expect(screen.getByLabelText('Member Name')).toHaveValue(DEFAULT_FORM_DATA.memberName);
      expect(screen.getByLabelText('State')).toHaveValue(DEFAULT_FORM_DATA.state);
      expect(screen.getByLabelText('ZIP Code')).toHaveValue(DEFAULT_FORM_DATA.zipCode);
    });

    it('renders Submit, Reset to Default, and Clear Form buttons', () => {
      render(<DemoForm validationEnabled={false} screenKey="a" />);

      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset to default/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear form/i })).toBeInTheDocument();
    });

    it('loads saved data from localStorage when available', () => {
      const savedData = { ...DEFAULT_FORM_DATA, claimId: 'CLM-SAVED-001' };
      loadInput.mockReturnValue(savedData);

      render(<DemoForm validationEnabled={false} screenKey="a" />);

      expect(screen.getByLabelText('Claim ID')).toHaveValue('CLM-SAVED-001');
    });
  });

  describe('submission without validation (Screen A)', () => {
    it('succeeds and shows Submission Accepted status', async () => {
      const user = userEvent.setup();
      render(<DemoForm validationEnabled={false} screenKey="a" />);

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      const status = screen.getByRole('status');
      expect(status).toBeInTheDocument();
      expect(status).toHaveTextContent('Submission Accepted');
    });

    it('does not call validatePayload when validation is disabled', async () => {
      const user = userEvent.setup();
      render(<DemoForm validationEnabled={false} screenKey="a" />);

      await user.click(screen.getByRole('button', { name: /submit/i }));

      expect(validatePayload).not.toHaveBeenCalled();
    });

    it('shows status code 200 and Validation Disabled when validation is off', async () => {
      const user = userEvent.setup();
      render(<DemoForm validationEnabled={false} screenKey="a" />);

      await user.click(screen.getByRole('button', { name: /submit/i }));

      const status = screen.getByRole('status');
      expect(status).toHaveTextContent('200');
      expect(status).toHaveTextContent('Disabled');
    });
  });

  describe('submission with validation (Screen B)', () => {
    it('shows field-specific errors for invalid characters', async () => {
      const user = userEvent.setup();

      validatePayload.mockReturnValue({
        isValid: false,
        errors: [
          {
            field: 'providerName',
            message: 'Field "providerName" contains 1 invalid character not in Codepage 1252: \'\u2014\' (U+2014 at position 30)',
            invalidChars: [
              { char: '\u2014', codePoint: 0x2014, position: 30 },
            ],
          },
          {
            field: 'notes',
            message: 'Field "notes" contains 2 invalid characters not in Codepage 1252',
            invalidChars: [
              { char: '\u2019', codePoint: 0x2019, position: 7 },
              { char: '\u2014', codePoint: 0x2014, position: 50 },
            ],
          },
        ],
        processingTimeMs: 1.23,
        timestamp: '2024-06-09T12:00:00.000Z',
        simulatedStatusCode: 422,
      });

      render(<DemoForm validationEnabled={true} screenKey="b" />);

      await user.click(screen.getByRole('button', { name: /submit/i }));

      const status = screen.getByRole('status');
      expect(status).toHaveTextContent('Validation Failed');
      expect(status).toHaveTextContent('2 errors found');

      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThanOrEqual(2);

      const providerAlert = alerts.find((el) =>
        el.textContent.includes('providerName')
      );
      expect(providerAlert).toBeDefined();

      const notesAlert = alerts.find((el) =>
        el.textContent.includes('notes')
      );
      expect(notesAlert).toBeDefined();
    });

    it('shows Submission Accepted when all fields are valid', async () => {
      const user = userEvent.setup();

      validatePayload.mockReturnValue({
        isValid: true,
        errors: [],
        processingTimeMs: 0.5,
        timestamp: '2024-06-09T12:00:00.000Z',
        simulatedStatusCode: 200,
      });

      render(<DemoForm validationEnabled={true} screenKey="b" />);

      await user.click(screen.getByRole('button', { name: /submit/i }));

      const status = screen.getByRole('status');
      expect(status).toHaveTextContent('Submission Accepted');
    });

    it('shows status code 422 and Validation Enabled when validation fails', async () => {
      const user = userEvent.setup();

      validatePayload.mockReturnValue({
        isValid: false,
        errors: [
          {
            field: 'notes',
            message: 'Invalid character found',
            invalidChars: [{ char: '\u2014', codePoint: 0x2014, position: 5 }],
          },
        ],
        processingTimeMs: 1.0,
        timestamp: '2024-06-09T12:00:00.000Z',
        simulatedStatusCode: 422,
      });

      render(<DemoForm validationEnabled={true} screenKey="b" />);

      await user.click(screen.getByRole('button', { name: /submit/i }));

      const status = screen.getByRole('status');
      expect(status).toHaveTextContent('422');
      expect(status).toHaveTextContent('Enabled');
    });
  });

  describe('accessibility', () => {
    it('sets aria-invalid on fields with errors after validation', async () => {
      const user = userEvent.setup();

      validatePayload.mockReturnValue({
        isValid: false,
        errors: [
          {
            field: 'providerName',
            message: 'Invalid character found',
            invalidChars: [{ char: '\u2014', codePoint: 0x2014, position: 30 }],
          },
        ],
        processingTimeMs: 1.0,
        timestamp: '2024-06-09T12:00:00.000Z',
        simulatedStatusCode: 422,
      });

      render(<DemoForm validationEnabled={true} screenKey="b" />);

      await user.click(screen.getByRole('button', { name: /submit/i }));

      const providerInput = screen.getByLabelText('Provider Name');
      expect(providerInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby linking to error message on invalid fields', async () => {
      const user = userEvent.setup();

      validatePayload.mockReturnValue({
        isValid: false,
        errors: [
          {
            field: 'providerName',
            message: 'Invalid character found',
            invalidChars: [{ char: '\u2014', codePoint: 0x2014, position: 30 }],
          },
        ],
        processingTimeMs: 1.0,
        timestamp: '2024-06-09T12:00:00.000Z',
        simulatedStatusCode: 422,
      });

      render(<DemoForm validationEnabled={true} screenKey="b" />);

      await user.click(screen.getByRole('button', { name: /submit/i }));

      const providerInput = screen.getByLabelText('Provider Name');
      const describedBy = providerInput.getAttribute('aria-describedby');
      expect(describedBy).toContain('providerName-error');

      const errorElement = document.getElementById('providerName-error');
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent('Invalid character found');
    });

    it('does not set aria-invalid on fields without errors', async () => {
      const user = userEvent.setup();

      validatePayload.mockReturnValue({
        isValid: false,
        errors: [
          {
            field: 'notes',
            message: 'Invalid character found',
            invalidChars: [{ char: '\u2014', codePoint: 0x2014, position: 5 }],
          },
        ],
        processingTimeMs: 1.0,
        timestamp: '2024-06-09T12:00:00.000Z',
        simulatedStatusCode: 422,
      });

      render(<DemoForm validationEnabled={true} screenKey="b" />);

      await user.click(screen.getByRole('button', { name: /submit/i }));

      const claimInput = screen.getByLabelText('Claim ID');
      expect(claimInput).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('valid input preservation', () => {
    it('preserves valid field values when errors are shown on other fields', async () => {
      const user = userEvent.setup();

      validatePayload.mockReturnValue({
        isValid: false,
        errors: [
          {
            field: 'notes',
            message: 'Invalid character found',
            invalidChars: [{ char: '\u2014', codePoint: 0x2014, position: 5 }],
          },
        ],
        processingTimeMs: 1.0,
        timestamp: '2024-06-09T12:00:00.000Z',
        simulatedStatusCode: 422,
      });

      render(<DemoForm validationEnabled={true} screenKey="b" />);

      await user.click(screen.getByRole('button', { name: /submit/i }));

      expect(screen.getByLabelText('Claim ID')).toHaveValue(DEFAULT_FORM_DATA.claimId);
      expect(screen.getByLabelText('Member Name')).toHaveValue(DEFAULT_FORM_DATA.memberName);
      expect(screen.getByLabelText('State')).toHaveValue(DEFAULT_FORM_DATA.state);
      expect(screen.getByLabelText('ZIP Code')).toHaveValue(DEFAULT_FORM_DATA.zipCode);
    });

    it('clears field error when user modifies the field value', async () => {
      const user = userEvent.setup();

      validatePayload.mockReturnValue({
        isValid: false,
        errors: [
          {
            field: 'providerName',
            message: 'Invalid character found',
            invalidChars: [{ char: '\u2014', codePoint: 0x2014, position: 30 }],
          },
        ],
        processingTimeMs: 1.0,
        timestamp: '2024-06-09T12:00:00.000Z',
        simulatedStatusCode: 422,
      });

      render(<DemoForm validationEnabled={true} screenKey="b" />);

      await user.click(screen.getByRole('button', { name: /submit/i }));

      const providerInput = screen.getByLabelText('Provider Name');
      expect(providerInput).toHaveAttribute('aria-invalid', 'true');

      await user.type(providerInput, 'X');

      expect(providerInput).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('reset button', () => {
    it('restores default mock data when Reset to Default is clicked', async () => {
      const user = userEvent.setup();
      render(<DemoForm validationEnabled={false} screenKey="a" />);

      const claimInput = screen.getByLabelText('Claim ID');
      await user.clear(claimInput);
      await user.type(claimInput, 'MODIFIED-CLAIM');
      expect(claimInput).toHaveValue('MODIFIED-CLAIM');

      await user.click(screen.getByRole('button', { name: /reset to default/i }));

      expect(screen.getByLabelText('Claim ID')).toHaveValue(DEFAULT_FORM_DATA.claimId);
      expect(screen.getByLabelText('Member Name')).toHaveValue(DEFAULT_FORM_DATA.memberName);
      expect(screen.getByLabelText('Provider Name')).toHaveValue(DEFAULT_FORM_DATA.providerName);
      expect(screen.getByLabelText('State')).toHaveValue(DEFAULT_FORM_DATA.state);
    });

    it('clears errors and submission result when Reset to Default is clicked', async () => {
      const user = userEvent.setup();

      validatePayload.mockReturnValue({
        isValid: false,
        errors: [
          {
            field: 'notes',
            message: 'Invalid character found',
            invalidChars: [{ char: '\u2014', codePoint: 0x2014, position: 5 }],
          },
        ],
        processingTimeMs: 1.0,
        timestamp: '2024-06-09T12:00:00.000Z',
        simulatedStatusCode: 422,
      });

      render(<DemoForm validationEnabled={true} screenKey="b" />);

      await user.click(screen.getByRole('button', { name: /submit/i }));

      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);

      await user.click(screen.getByRole('button', { name: /reset to default/i }));

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('clear form button', () => {
    it('clears all form fields to empty strings', async () => {
      const user = userEvent.setup();
      render(<DemoForm validationEnabled={false} screenKey="a" />);

      await user.click(screen.getByRole('button', { name: /clear form/i }));

      expect(screen.getByLabelText('Claim ID')).toHaveValue('');
      expect(screen.getByLabelText('Member Name')).toHaveValue('');
      expect(screen.getByLabelText('Provider Name')).toHaveValue('');
      expect(screen.getByLabelText('State')).toHaveValue('');
      expect(screen.getByLabelText('ZIP Code')).toHaveValue('');
      expect(screen.getByLabelText('Notes')).toHaveValue('');
    });
  });

  describe('localStorage isolation', () => {
    it('calls saveInput with the correct screenKey', async () => {
      const user = userEvent.setup();
      render(<DemoForm validationEnabled={false} screenKey="a" />);

      const claimInput = screen.getByLabelText('Claim ID');
      await user.type(claimInput, 'X');

      expect(saveInput).toHaveBeenCalledWith('a', expect.any(Object));
    });

    it('calls loadInput with the correct screenKey on mount', () => {
      render(<DemoForm validationEnabled={false} screenKey="b" />);

      expect(loadInput).toHaveBeenCalledWith('b');
    });
  });
});