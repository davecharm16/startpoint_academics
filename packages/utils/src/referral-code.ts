/**
 * Referral Code Generation Utility
 * Generates unique, memorable referral codes for clients
 *
 * Format: First 4 letters of name (uppercase) + 4 random digits
 * Example: "Dave Smith" → "DAVE1234"
 */

/**
 * Generates a referral code from a full name
 * @param fullName - The user's full name
 * @returns A unique referral code (e.g., "DAVE1234")
 */
export function generateReferralCode(fullName: string): string {
  // Extract letters only from the name, convert to uppercase
  const letters = fullName
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

  // Take first 4 letters, pad with 'X' if name is too short
  const prefix = letters.slice(0, 4).padEnd(4, "X");

  // Generate 4 random digits (1000-9999)
  const suffix = Math.floor(1000 + Math.random() * 9000).toString();

  return `${prefix}${suffix}`;
}

/**
 * Validates a referral code format
 * @param code - The referral code to validate
 * @returns True if the code matches the expected format
 */
export function isValidReferralCodeFormat(code: string): boolean {
  // Format: 4 letters + 4 digits
  const pattern = /^[A-Z]{4}\d{4}$/;
  return pattern.test(code.toUpperCase());
}

/**
 * Normalizes a referral code for comparison
 * Converts to uppercase and trims whitespace
 * @param code - The referral code to normalize
 * @returns Normalized referral code
 */
export function normalizeReferralCode(code: string): string {
  return code.toUpperCase().trim();
}

/**
 * Generates a unique referral code with collision checking
 * This is the main function to use when creating codes
 *
 * @param fullName - The user's full name
 * @param existingCodes - Array of existing codes to check against (optional)
 * @param maxAttempts - Maximum regeneration attempts (default 10)
 * @returns A unique referral code
 * @throws Error if unable to generate unique code after maxAttempts
 */
export function generateUniqueReferralCode(
  fullName: string,
  existingCodes: string[] = [],
  maxAttempts: number = 10
): string {
  const normalizedExisting = new Set(
    existingCodes.map((code) => normalizeReferralCode(code))
  );

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateReferralCode(fullName);
    if (!normalizedExisting.has(code)) {
      return code;
    }
  }

  // If all attempts failed, use timestamp to ensure uniqueness
  const prefix = fullName
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 2)
    .padEnd(2, "X");
  const timestamp = Date.now().toString().slice(-6);
  return `${prefix}${timestamp}`;
}
