/**
 * Mock data factory and field definitions for the CLMWR Encoding Validator.
 * Provides realistic fake claim data with intentional non-Codepage 1252 characters
 * for testing encoding validation.
 *
 * User Stories: SCRUM-9783, SCRUM-9786
 */

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
  providerName: 'Dr. Ren\u00E9e \u201CSunny\u201D Thompson\u2014MD',
  addressLine1: '742 Evergreen Terrace, Ste\u2009#3',
  addressLine2: 'Bldg \u2116 5 \u2014 East Wing',
  city: 'Montr\u00E9al\u2010West',
  state: 'CA',
  zipCode: '90210',
  notes: 'Patient\u2019s follow\u2011up visit re: claim \u201CCLM-2024-00142\u201D. Diagnosis code\u2014J06.9. Paid \u20AC150.00 equiv. \u2248 $162.50. \u2022 Review pending.',
  remittanceInfo: 'Remit to: Acct #8675309 \u2013 First National Bank\u2122. Ref\u2026 EOB\u00B9 attached. Amount: \u00A512,000 (\u2248 $82.17). Status: Approved \u2714',
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