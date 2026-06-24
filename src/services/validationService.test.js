import { describe, it, expect } from 'vitest';
import { validate, isCodepage1252 } from './validationService.js';

describe('validationService', () => {
  describe('isCodepage1252', () => {
    it('returns true for a simple ASCII string', () => {
      expect(isCodepage1252('Hello, World!')).toBe(true);
    });

    it('returns true for an empty string', () => {
      expect(isCodepage1252('')).toBe(true);
    });

    it('returns true for valid Codepage 1252 characters in the 0x80-0xFF range', () => {
      // 0x80 = €, 0x82 = ‚, 0xA9 = ©, 0xE9 = é, 0xFF = ÿ
      const validChars = String.fromCharCode(0x80, 0x82, 0xA9, 0xE9, 0xFF);
      expect(isCodepage1252(validChars)).toBe(true);
    });

    it('returns false for undefined Codepage 1252 position 0x81', () => {
      const str = String.fromCharCode(0x81);
      expect(isCodepage1252(str)).toBe(false);
    });

    it('returns false for undefined Codepage 1252 position 0x8D', () => {
      const str = String.fromCharCode(0x8D);
      expect(isCodepage1252(str)).toBe(false);
    });

    it('returns false for undefined Codepage 1252 position 0x8F', () => {
      const str = String.fromCharCode(0x8F);
      expect(isCodepage1252(str)).toBe(false);
    });

    it('returns false for undefined Codepage 1252 position 0x90', () => {
      const str = String.fromCharCode(0x90);
      expect(isCodepage1252(str)).toBe(false);
    });

    it('returns false for undefined Codepage 1252 position 0x9D', () => {
      const str = String.fromCharCode(0x9D);
      expect(isCodepage1252(str)).toBe(false);
    });

    it('returns false for Unicode characters above 0xFF', () => {
      // U+2014 em dash, U+201C left double quotation mark
      expect(isCodepage1252('\u2014')).toBe(false);
      expect(isCodepage1252('\u201C')).toBe(false);
    });

    it('returns false for a string containing a mix of valid and invalid characters', () => {
      const str = 'Hello \u2014 World';
      expect(isCodepage1252(str)).toBe(false);
    });

    it('returns false for non-string input', () => {
      expect(isCodepage1252(undefined)).toBe(false);
      expect(isCodepage1252(null)).toBe(false);
      expect(isCodepage1252(123)).toBe(false);
    });

    it('returns true for all printable ASCII characters', () => {
      let ascii = '';
      for (let i = 0x20; i <= 0x7E; i++) {
        ascii += String.fromCharCode(i);
      }
      expect(isCodepage1252(ascii)).toBe(true);
    });

    it('returns true for control characters in the valid range (0x00-0x1F)', () => {
      const controlChars = String.fromCharCode(0x00, 0x09, 0x0A, 0x0D, 0x1F);
      expect(isCodepage1252(controlChars)).toBe(true);
    });
  });

  describe('validate', () => {
    it('returns an empty array for valid Codepage 1252 input across all fields', () => {
      const formData = {
        claimId: 'CLM-2024-00142',
        memberName: 'Jane Doe',
        providerName: 'Dr. Thompson',
        addressLine1: '742 Evergreen Terrace',
        addressLine2: 'Suite 3',
        city: 'Springfield',
        state: 'CA',
        zipCode: '90210',
        notes: 'Standard follow-up visit.',
        remittanceInfo: 'Remit to: Acct #8675309',
      };

      const errors = validate(formData);
      expect(errors).toEqual([]);
    });

    it('returns errors for fields containing non-Codepage 1252 characters', () => {
      const formData = {
        claimId: 'CLM-2024-00142',
        providerName: 'Dr. Ren\u00E9e \u201CSunny\u201D Thompson\u2014MD',
      };

      const errors = validate(formData);
      expect(errors.length).toBeGreaterThan(0);

      const providerError = errors.find((e) => e.field === 'providerName');
      expect(providerError).toBeDefined();
      expect(providerError.invalidChars.length).toBeGreaterThan(0);
      expect(providerError.message).toContain('providerName');
    });

    it('correctly identifies multiple invalid characters with their positions', () => {
      const formData = {
        notes: 'A\u2014B\u201CC',
      };

      const errors = validate(formData);
      expect(errors).toHaveLength(1);

      const notesError = errors[0];
      expect(notesError.field).toBe('notes');
      expect(notesError.invalidChars).toHaveLength(2);

      expect(notesError.invalidChars[0].char).toBe('\u2014');
      expect(notesError.invalidChars[0].codePoint).toBe(0x2014);
      expect(notesError.invalidChars[0].position).toBe(1);

      expect(notesError.invalidChars[1].char).toBe('\u201C');
      expect(notesError.invalidChars[1].codePoint).toBe(0x201C);
      expect(notesError.invalidChars[1].position).toBe(3);
    });

    it('returns errors for multiple fields with invalid characters', () => {
      const formData = {
        memberName: 'Jane D\u00F6e',
        providerName: 'Dr. Thompson\u2014MD',
        notes: 'Patient\u2019s visit',
        city: 'Springfield',
      };

      const errors = validate(formData);

      // memberName has ö (0xF6) which IS valid in Codepage 1252
      const memberError = errors.find((e) => e.field === 'memberName');
      expect(memberError).toBeUndefined();

      // providerName has em dash (U+2014) which is NOT valid
      const providerError = errors.find((e) => e.field === 'providerName');
      expect(providerError).toBeDefined();

      // notes has right single quotation mark (U+2019) which is NOT valid
      const notesError = errors.find((e) => e.field === 'notes');
      expect(notesError).toBeDefined();

      // city is all valid
      const cityError = errors.find((e) => e.field === 'city');
      expect(cityError).toBeUndefined();
    });

    it('handles empty string fields without errors', () => {
      const formData = {
        claimId: '',
        memberName: '',
        notes: '',
      };

      const errors = validate(formData);
      expect(errors).toEqual([]);
    });

    it('handles null and undefined input gracefully', () => {
      expect(validate(null)).toEqual([]);
      expect(validate(undefined)).toEqual([]);
    });

    it('handles non-object input gracefully', () => {
      expect(validate('string')).toEqual([]);
      expect(validate(42)).toEqual([]);
    });

    it('skips non-string field values', () => {
      const formData = {
        claimId: 'CLM-001',
        count: 42,
        flag: true,
        empty: null,
      };

      const errors = validate(formData);
      expect(errors).toEqual([]);
    });

    it('generates a descriptive error message with character details', () => {
      const formData = {
        notes: 'Test\u2022bullet',
      };

      const errors = validate(formData);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('notes');
      expect(errors[0].message).toContain('U+2022');
      expect(errors[0].message).toContain('position 4');
      expect(errors[0].message).toContain('1 invalid character');
    });

    it('generates correct plural form in error message for multiple invalid characters', () => {
      const formData = {
        notes: '\u2022\u2023',
      };

      const errors = validate(formData);
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toContain('2 invalid characters');
    });

    it('validates the default mock data and finds expected invalid characters', () => {
      const { DEFAULT_FORM_DATA } = await import('../constants/mockData.js');

      const errors = validate(DEFAULT_FORM_DATA);
      expect(errors.length).toBeGreaterThan(0);

      const fieldNames = errors.map((e) => e.field);
      // providerName contains em dash and smart quotes
      expect(fieldNames).toContain('providerName');
      // notes contains various Unicode characters
      expect(fieldNames).toContain('notes');
    });

    it('correctly identifies characters at undefined Codepage 1252 positions in field values', () => {
      const formData = {
        testField: `A${String.fromCharCode(0x81)}B${String.fromCharCode(0x9D)}C`,
      };

      const errors = validate(formData);
      expect(errors).toHaveLength(1);
      expect(errors[0].field).toBe('testField');
      expect(errors[0].invalidChars).toHaveLength(2);
      expect(errors[0].invalidChars[0].codePoint).toBe(0x81);
      expect(errors[0].invalidChars[0].position).toBe(1);
      expect(errors[0].invalidChars[1].codePoint).toBe(0x9D);
      expect(errors[0].invalidChars[1].position).toBe(3);
    });

    it('completes validation of typical form data in under 50ms', () => {
      const formData = {
        claimId: 'CLM-2024-00142',
        memberName: 'Jane D\u00F6e',
        providerName: 'Dr. Ren\u00E9e \u201CSunny\u201D Thompson\u2014MD',
        addressLine1: '742 Evergreen Terrace, Ste\u2009#3',
        addressLine2: 'Bldg \u2116 5 \u2014 East Wing',
        city: 'Montr\u00E9al\u2010West',
        state: 'CA',
        zipCode: '90210',
        notes: 'Patient\u2019s follow\u2011up visit re: claim \u201CCLM-2024-00142\u201D. Diagnosis code\u2014J06.9. Paid \u20AC150.00 equiv. \u2248 $162.50. \u2022 Review pending.',
        remittanceInfo: 'Remit to: Acct #8675309 \u2013 First National Bank\u2122. Ref\u2026 EOB\u00B9 attached. Amount: \u00A512,000 (\u2248 $82.17). Status: Approved \u2714',
      };

      const startTime = performance.now();
      validate(formData);
      const endTime = performance.now();
      const elapsed = endTime - startTime;

      expect(elapsed).toBeLessThan(50);
    });

    it('handles a large number of fields efficiently under 50ms', () => {
      const formData = {};
      for (let i = 0; i < 100; i++) {
        formData[`field_${i}`] = 'This is a test string with some content that is perfectly valid ASCII text for testing performance.';
      }

      const startTime = performance.now();
      validate(formData);
      const endTime = performance.now();
      const elapsed = endTime - startTime;

      expect(elapsed).toBeLessThan(50);
    });

    it('returns empty errors when all fields contain only valid Codepage 1252 extended characters', () => {
      const formData = {
        name: 'Ren\u00E9',       // é (0xE9)
        currency: '\u00A3100',    // £ (0xA3)
        copyright: '\u00A9 2024', // © (0xA9)
        umlaut: '\u00FC\u00F6',   // ü (0xFC), ö (0xF6)
      };

      const errors = validate(formData);
      expect(errors).toEqual([]);
    });
  });
});