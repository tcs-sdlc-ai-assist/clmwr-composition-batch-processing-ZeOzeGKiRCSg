/**
 * Mock data factory and field definitions for the CLMWR Encoding Validator.
 * Provides realistic fake claim data with intentional non-Codepage 1252 characters
 * for testing encoding validation.
 *
 * User Stories: SCRUM-9783, SCRUM-9786
 */

/**
 * Version tag for DEFAULT_FORM_DATA. Bump this whenever the mock data values
 * change so that stale persisted form data (saved under an older version) is
 * discarded instead of masking the new defaults.
 * @type {number}
 */
export const MOCK_DATA_VERSION = 2;

/**
 * Default form data pre-populated with realistic fake claim data.
 * Several fields intentionally contain non-Codepage 1252 characters
 * such as em dashes (—), smart quotes (\u201C \u201D), and Unicode symbols
 * to exercise encoding validation.
 * @type {Object.<string, string>}
 */
export const DEFAULT_FORM_DATA = {
  claimId: 'CLM-2024-00142',
  memberName: 'Jane D\u00F6e',
  providerName: 'Dr. Ren\u00E9e "Sunny" Thompson-MD',
  addressLine1: '742 Evergreen Terrace, Ste #3',
  addressLine2: 'Bldg \u2116 5 \u2014 East Wing',
  city: 'Montr\u00E9al-West',
  state: 'CA',
  zipCode: '90210',
  notes: "Patient's follow-up visit re: claim \"CLM-2024-00142\". Diagnosis code-J06.9. Paid EUR150.00 equiv. ~$162.50. * Review pending.",
  remittanceInfo: 'Remit to: Acct #8675309 \u2013 First National Bank\u2122. Ref... EOB\u00B9 attached. Amount: \u00A512,000 (~$82.17). Status: Approved Yes',
};

/**
 * Human-readable labels for each form field.
 * @type {Object.<string, string>}
 */
export const FIELD_LABELS = {
  claimId: 'Claim ID',
  memberName: 'Member Name',
  providerName: 'Provider Name',
  addressLine1: 'Address Line 1',
  addressLine2: 'Address Line 2',
  city: 'City',
  state: 'State',
  zipCode: 'ZIP Code',
  notes: 'Notes',
  remittanceInfo: 'Remittance Info',
};

/**
 * Accessible descriptions for each form field, suitable for aria-describedby usage.
 * @type {Object.<string, string>}
 */
export const FIELD_DESCRIPTIONS = {
  claimId: 'Unique identifier for the insurance claim (e.g., CLM-2024-00142)',
  memberName: 'Full name of the insured member',
  providerName: 'Name of the healthcare provider or facility',
  addressLine1: 'Primary street address of the provider or member',
  addressLine2: 'Secondary address information such as suite or building number',
  city: 'City name for the mailing address',
  state: 'Two-letter state or province abbreviation',
  zipCode: 'Postal or ZIP code for the mailing address',
  notes: 'Additional notes or comments related to the claim',
  remittanceInfo: 'Payment and remittance details for the claim',
};