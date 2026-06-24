/**
 * Codepage 1252 (Windows-1252) character encoding constants and validation.
 * This is the single source of truth for encoding validation.
 */

/**
 * Undefined code points in Codepage 1252.
 * These positions (0x81, 0x8D, 0x8F, 0x90, 0x9D) are not assigned
 * to any character in the Windows-1252 encoding.
 * @type {Set<number>}
 */
const CODEPAGE_1252_UNDEFINED = new Set([0x81, 0x8D, 0x8F, 0x90, 0x9D]);

/**
 * Complete set of valid Codepage 1252 code points (0x00–0xFF),
 * excluding the undefined positions: 0x81, 0x8D, 0x8F, 0x90, 0x9D.
 * @type {Set<number>}
 */
export const CODEPAGE_1252_VALID_CODEPOINTS = new Set();

for (let i = 0x00; i <= 0xFF; i++) {
  if (!CODEPAGE_1252_UNDEFINED.has(i)) {
    CODEPAGE_1252_VALID_CODEPOINTS.add(i);
  }
}

/**
 * Checks whether a given character code is a valid Codepage 1252 code point.
 * @param {number} charCode - The numeric code point to validate.
 * @returns {boolean} True if the code point is valid in Codepage 1252, false otherwise.
 */
export function isValidCodepage1252Char(charCode) {
  return CODEPAGE_1252_VALID_CODEPOINTS.has(charCode);
}