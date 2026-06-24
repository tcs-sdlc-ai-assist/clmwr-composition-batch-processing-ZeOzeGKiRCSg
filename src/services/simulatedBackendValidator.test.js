import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validatePayload } from './simulatedBackendValidator.js';

vi.mock('./validationService.js', () => ({
  validate: vi.fn(),
}));

vi.mock('./logService.js', () => ({
  logFailure: vi.fn(),
}));

vi.mock('./monitoringService.js', () => ({
  recordFailure: vi.fn(),
}));

import { validate } from './validationService.js';
import { logFailure } from './logService.js';
import { recordFailure } from './monitoringService.js';

describe('simulatedBackendValidator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validatePayload response structure', () => {
    it('returns a response object with all required properties', () => {
      validate.mockReturnValue([]);
      logFailure.mockReturnValue([]);

      const formData = { claimId: 'CLM-001', memberName: 'John Doe' };
      const response = validatePayload(formData, 'b');

      expect(response).toHaveProperty('isValid');
      expect(response).toHaveProperty('errors');
      expect(response).toHaveProperty('processingTimeMs');
      expect(response).toHaveProperty('timestamp');
      expect(response).toHaveProperty('simulatedStatusCode');

      expect(typeof response.isValid).toBe('boolean');
      expect(Array.isArray(response.errors)).toBe(true);
      expect(typeof response.processingTimeMs).toBe('number');
      expect(typeof response.timestamp).toBe('string');
      expect(typeof response.simulatedStatusCode).toBe('number');
    });

    it('returns a valid ISO 8601 timestamp', () => {
      validate.mockReturnValue([]);
      logFailure.mockReturnValue([]);

      const response = validatePayload({ claimId: 'CLM-001' }, 'a');
      const parsed = new Date(response.timestamp);
      expect(isNaN(parsed.getTime())).toBe(false);
    });
  });

  describe('valid input', () => {
    it('returns isValid=true and status 200 when all fields are valid', () => {
      validate.mockReturnValue([]);
      logFailure.mockReturnValue([]);

      const formData = {
        claimId: 'CLM-2024-00142',
        memberName: 'Jane Doe',
        providerName: 'Dr. Thompson',
        state: 'CA',
        zipCode: '90210',
      };

      const response = validatePayload(formData, 'b');

      expect(response.isValid).toBe(true);
      expect(response.errors).toEqual([]);
      expect(response.simulatedStatusCode).toBe(200);
    });

    it('does not call logFailure when validation passes', () => {
      validate.mockReturnValue([]);

      const formData = { claimId: 'CLM-001' };
      validatePayload(formData, 'b');

      expect(logFailure).not.toHaveBeenCalled();
      expect(recordFailure).not.toHaveBeenCalled();
    });
  });

  describe('invalid input', () => {
    it('returns isValid=false and status 422 when fields contain invalid characters', () => {
      const mockErrors = [
        {
          field: 'providerName',
          invalidChars: [{ char: '\u2014', codePoint: 0x2014, position: 30 }],
          message: 'Field "providerName" contains 1 invalid character not in Codepage 1252: \'\u2014\' (U+2014 at position 30)',
        },
      ];

      validate.mockReturnValue(mockErrors);
      logFailure.mockReturnValue([
        {
          id: 'log-1',
          timestamp: '2024-06-09T12:00:00.000Z',
          field: 'providerName',
          invalidChars: [{ char: '\u2014', codePoint: 0x2014, position: 30 }],
          screenType: 'b',
          message: 'Field "providerName" contains 1 invalid character not in Codepage 1252: \'\u2014\' (U+2014 at position 30)',
        },
      ]);

      const formData = {
        providerName: 'Dr. Ren\u00E9e \u201CSunny\u201D Thompson\u2014MD',
      };

      const response = validatePayload(formData, 'b');

      expect(response.isValid).toBe(false);
      expect(response.errors).toEqual(mockErrors);
      expect(response.simulatedStatusCode).toBe(422);
    });

    it('returns isValid=false with status 400 for null input', () => {
      const response = validatePayload(null, 'b');

      expect(response.isValid).toBe(false);
      expect(response.errors).toEqual([]);
      expect(response.simulatedStatusCode).toBe(400);
    });

    it('returns isValid=false with status 400 for undefined input', () => {
      const response = validatePayload(undefined, 'b');

      expect(response.isValid).toBe(false);
      expect(response.errors).toEqual([]);
      expect(response.simulatedStatusCode).toBe(400);
    });

    it('returns isValid=false with status 400 for non-object input', () => {
      const response = validatePayload('not an object', 'b');

      expect(response.isValid).toBe(false);
      expect(response.errors).toEqual([]);
      expect(response.simulatedStatusCode).toBe(400);
    });

    it('does not call validate for invalid (non-object) input', () => {
      validatePayload(null, 'b');

      expect(validate).not.toHaveBeenCalled();
    });
  });

  describe('processingTimeMs measurement', () => {
    it('measures processingTimeMs as a non-negative number', () => {
      validate.mockReturnValue([]);
      logFailure.mockReturnValue([]);

      const formData = { claimId: 'CLM-001' };
      const response = validatePayload(formData, 'a');

      expect(response.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('measures processingTimeMs for invalid input (400 response)', () => {
      const response = validatePayload(null, 'b');

      expect(response.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('returns processingTimeMs with at most 2 decimal places', () => {
      validate.mockReturnValue([]);
      logFailure.mockReturnValue([]);

      const formData = { claimId: 'CLM-001' };
      const response = validatePayload(formData, 'b');

      const decimalStr = String(response.processingTimeMs);
      const parts = decimalStr.split('.');
      if (parts.length === 2) {
        expect(parts[1].length).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('failure logging via logService', () => {
    it('calls logFailure with validation errors and screen type when validation fails', () => {
      const mockErrors = [
        {
          field: 'notes',
          invalidChars: [{ char: '\u2019', codePoint: 0x2019, position: 7 }],
          message: 'Field "notes" contains 1 invalid character not in Codepage 1252',
        },
      ];

      validate.mockReturnValue(mockErrors);
      logFailure.mockReturnValue([
        {
          id: 'log-1',
          timestamp: '2024-06-09T12:00:00.000Z',
          field: 'notes',
          invalidChars: [{ char: '\u2019', codePoint: 0x2019, position: 7 }],
          screenType: 'b',
          message: 'Field "notes" contains 1 invalid character not in Codepage 1252',
        },
      ]);

      const formData = { notes: 'Patient\u2019s visit' };
      validatePayload(formData, 'b');

      expect(logFailure).toHaveBeenCalledTimes(1);
      expect(logFailure).toHaveBeenCalledWith(mockErrors, 'b');
    });

    it('normalizes screen type to lowercase when calling logFailure', () => {
      const mockErrors = [
        {
          field: 'notes',
          invalidChars: [{ char: '\u2014', codePoint: 0x2014, position: 5 }],
          message: 'Invalid character found',
        },
      ];

      validate.mockReturnValue(mockErrors);
      logFailure.mockReturnValue([
        {
          id: 'log-1',
          timestamp: '2024-06-09T12:00:00.000Z',
          field: 'notes',
          invalidChars: [{ char: '\u2014', codePoint: 0x2014, position: 5 }],
          screenType: 'b',
          message: 'Invalid character found',
        },
      ]);

      const formData = { notes: 'Test\u2014value' };
      validatePayload(formData, 'B');

      expect(logFailure).toHaveBeenCalledWith(mockErrors, 'b');
    });

    it('handles empty screenType gracefully', () => {
      const mockErrors = [
        {
          field: 'notes',
          invalidChars: [{ char: '\u2014', codePoint: 0x2014, position: 5 }],
          message: 'Invalid character found',
        },
      ];

      validate.mockReturnValue(mockErrors);
      logFailure.mockReturnValue([
        {
          id: 'log-1',
          timestamp: '2024-06-09T12:00:00.000Z',
          field: 'notes',
          invalidChars: [{ char: '\u2014', codePoint: 0x2014, position: 5 }],
          screenType: '',
          message: 'Invalid character found',
        },
      ]);

      const formData = { notes: 'Test\u2014value' };
      validatePayload(formData);

      expect(logFailure).toHaveBeenCalledWith(mockErrors, '');
    });
  });

  describe('failure recording via monitoringService', () => {
    it('calls recordFailure for each log entry returned by logFailure', () => {
      const mockErrors = [
        {
          field: 'providerName',
          invalidChars: [{ char: '\u2014', codePoint: 0x2014, position: 30 }],
          message: 'Invalid character in providerName',
        },
        {
          field: 'notes',
          invalidChars: [{ char: '\u2019', codePoint: 0x2019, position: 7 }],
          message: 'Invalid character in notes',
        },
      ];

      const mockLogEntries = [
        {
          id: 'log-1',
          timestamp: '2024-06-09T12:00:00.000Z',
          field: 'providerName',
          invalidChars: [{ char: '\u2014', codePoint: 0x2014, position: 30 }],
          screenType: 'b',
          message: 'Invalid character in providerName',
        },
        {
          id: 'log-2',
          timestamp: '2024-06-09T12:00:00.000Z',
          field: 'notes',
          invalidChars: [{ char: '\u2019', codePoint: 0x2019, position: 7 }],
          screenType: 'b',
          message: 'Invalid character in notes',
        },
      ];

      validate.mockReturnValue(mockErrors);
      logFailure.mockReturnValue(mockLogEntries);

      const formData = {
        providerName: 'Dr. Thompson\u2014MD',
        notes: 'Patient\u2019s visit',
      };

      validatePayload(formData, 'b');

      expect(recordFailure).toHaveBeenCalledTimes(2);
      expect(recordFailure).toHaveBeenCalledWith(mockLogEntries[0]);
      expect(recordFailure).toHaveBeenCalledWith(mockLogEntries[1]);
    });

    it('does not call recordFailure when validation passes', () => {
      validate.mockReturnValue([]);

      const formData = { claimId: 'CLM-001' };
      validatePayload(formData, 'b');

      expect(recordFailure).not.toHaveBeenCalled();
    });

    it('does not call recordFailure for bad input (status 400)', () => {
      validatePayload(null, 'b');

      expect(recordFailure).not.toHaveBeenCalled();
    });
  });

  describe('multiple errors handling', () => {
    it('returns all validation errors from multiple fields', () => {
      const mockErrors = [
        {
          field: 'providerName',
          invalidChars: [{ char: '\u2014', codePoint: 0x2014, position: 30 }],
          message: 'Invalid character in providerName',
        },
        {
          field: 'notes',
          invalidChars: [
            { char: '\u2019', codePoint: 0x2019, position: 7 },
            { char: '\u2014', codePoint: 0x2014, position: 50 },
          ],
          message: 'Invalid characters in notes',
        },
        {
          field: 'remittanceInfo',
          invalidChars: [{ char: '\u2122', codePoint: 0x2122, position: 40 }],
          message: 'Invalid character in remittanceInfo',
        },
      ];

      validate.mockReturnValue(mockErrors);
      logFailure.mockReturnValue([
        { id: 'log-1', timestamp: '2024-06-09T12:00:00.000Z', field: 'providerName', invalidChars: mockErrors[0].invalidChars, screenType: 'b', message: mockErrors[0].message },
        { id: 'log-2', timestamp: '2024-06-09T12:00:00.000Z', field: 'notes', invalidChars: mockErrors[1].invalidChars, screenType: 'b', message: mockErrors[1].message },
        { id: 'log-3', timestamp: '2024-06-09T12:00:00.000Z', field: 'remittanceInfo', invalidChars: mockErrors[2].invalidChars, screenType: 'b', message: mockErrors[2].message },
      ]);

      const formData = {
        providerName: 'Dr. Thompson\u2014MD',
        notes: 'Patient\u2019s follow-up\u2014visit',
        remittanceInfo: 'First National Bank\u2122',
      };

      const response = validatePayload(formData, 'b');

      expect(response.isValid).toBe(false);
      expect(response.errors).toHaveLength(3);
      expect(response.simulatedStatusCode).toBe(422);
      expect(recordFailure).toHaveBeenCalledTimes(3);
    });
  });
});