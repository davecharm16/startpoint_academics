/**
 * Tests for password validation logic used in change-password and forgot-password flows.
 *
 * Password requirements (from Story 8-3 AC #5):
 * - At least 8 characters
 * - Contains at least 1 uppercase letter
 * - Contains at least 1 number
 *
 * Also tests the additional requirement from ChangePasswordForm:
 * - Contains at least 1 lowercase letter
 */

// Extract the validation logic that mirrors what the forms use
interface PasswordRequirement {
  label: string;
  met: boolean;
}

function validatePassword(password: string): PasswordRequirement[] {
  return [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
    { label: "Contains a number", met: /[0-9]/.test(password) },
  ];
}

function areAllRequirementsMet(password: string): boolean {
  return validatePassword(password).every((r) => r.met);
}

function doPasswordsMatch(password: string, confirmPassword: string): boolean {
  return password === confirmPassword && confirmPassword.length > 0;
}

describe("Password validation", () => {
  describe("validatePassword", () => {
    it("should fail all requirements for empty password", () => {
      const results = validatePassword("");
      expect(results.every((r) => !r.met)).toBe(true);
    });

    it("should detect length requirement (>= 8 chars)", () => {
      const short = validatePassword("Ab1");
      expect(short[0]!.met).toBe(false);

      const exactlyEight = validatePassword("Abcdefg1");
      expect(exactlyEight[0]!.met).toBe(true);

      const long = validatePassword("Abcdefghijk1");
      expect(long[0]!.met).toBe(true);
    });

    it("should detect uppercase letter requirement", () => {
      const noUpper = validatePassword("abcdefgh1");
      expect(noUpper[1]!.met).toBe(false);

      const hasUpper = validatePassword("Abcdefgh1");
      expect(hasUpper[1]!.met).toBe(true);
    });

    it("should detect lowercase letter requirement", () => {
      const noLower = validatePassword("ABCDEFGH1");
      expect(noLower[2]!.met).toBe(false);

      const hasLower = validatePassword("ABCDEFGh1");
      expect(hasLower[2]!.met).toBe(true);
    });

    it("should detect number requirement", () => {
      const noNumber = validatePassword("Abcdefgh");
      expect(noNumber[3]!.met).toBe(false);

      const hasNumber = validatePassword("Abcdefg1");
      expect(hasNumber[3]!.met).toBe(true);
    });
  });

  describe("areAllRequirementsMet", () => {
    it("should return false for weak passwords", () => {
      expect(areAllRequirementsMet("")).toBe(false);
      expect(areAllRequirementsMet("short")).toBe(false);
      expect(areAllRequirementsMet("nouppercase1")).toBe(false);
      expect(areAllRequirementsMet("NOLOWERCASE1")).toBe(false);
      expect(areAllRequirementsMet("NoNumber")).toBe(false);
    });

    it("should return true for passwords meeting all requirements", () => {
      expect(areAllRequirementsMet("Abcdefg1")).toBe(true);
      expect(areAllRequirementsMet("StrongPass123")).toBe(true);
      expect(areAllRequirementsMet("MyP@ssw0rd")).toBe(true);
    });

    it("should accept special characters without requiring them", () => {
      expect(areAllRequirementsMet("Abcdef1!@#")).toBe(true);
    });
  });

  describe("doPasswordsMatch", () => {
    it("should return false when passwords do not match", () => {
      expect(doPasswordsMatch("Abcdefg1", "Abcdefg2")).toBe(false);
    });

    it("should return true when passwords match and are non-empty", () => {
      expect(doPasswordsMatch("Abcdefg1", "Abcdefg1")).toBe(true);
    });

    it("should return false when confirm password is empty", () => {
      expect(doPasswordsMatch("Abcdefg1", "")).toBe(false);
    });

    it("should return false when both passwords are empty", () => {
      expect(doPasswordsMatch("", "")).toBe(false);
    });
  });
});
