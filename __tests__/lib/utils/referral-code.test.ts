import {
  generateReferralCode,
  isValidReferralCodeFormat,
  normalizeReferralCode,
  generateUniqueReferralCode,
} from "@/lib/utils/referral-code";

describe("referral-code utilities", () => {
  describe("generateReferralCode", () => {
    it("generates code with first 4 letters of name + 4 digits", () => {
      const code = generateReferralCode("Dave Smith");
      expect(code).toMatch(/^DAVE\d{4}$/);
    });

    it("pads short names with X", () => {
      const code = generateReferralCode("Jo");
      expect(code).toMatch(/^JOXX\d{4}$/);
    });

    it("handles names with special characters", () => {
      const code = generateReferralCode("José García");
      expect(code).toMatch(/^JOS\w\d{4}$/);
    });

    it("handles single word names", () => {
      const code = generateReferralCode("Madonna");
      expect(code).toMatch(/^MADO\d{4}$/);
    });

    it("generates 4-digit suffix between 1000-9999", () => {
      for (let i = 0; i < 100; i++) {
        const code = generateReferralCode("Test User");
        const suffix = parseInt(code.slice(-4));
        expect(suffix).toBeGreaterThanOrEqual(1000);
        expect(suffix).toBeLessThan(10000);
      }
    });
  });

  describe("isValidReferralCodeFormat", () => {
    it("validates correct format", () => {
      expect(isValidReferralCodeFormat("DAVE1234")).toBe(true);
      expect(isValidReferralCodeFormat("ABCD5678")).toBe(true);
    });

    it("rejects invalid formats", () => {
      expect(isValidReferralCodeFormat("DAV1234")).toBe(false); // Only 3 letters
      expect(isValidReferralCodeFormat("DAVE123")).toBe(false); // Only 3 digits
      expect(isValidReferralCodeFormat("DAVE12345")).toBe(false); // 5 digits
      expect(isValidReferralCodeFormat("DAV21234")).toBe(false); // Number in letters
    });

    it("accepts lowercase (function normalizes to uppercase)", () => {
      // The function converts to uppercase before validation, so lowercase is valid
      expect(isValidReferralCodeFormat("dave1234")).toBe(true);
    });

    it("is case-insensitive when normalized first", () => {
      // Note: The function itself checks uppercase, normalization should happen before
      expect(isValidReferralCodeFormat("DAVE1234".toUpperCase())).toBe(true);
    });
  });

  describe("normalizeReferralCode", () => {
    it("converts to uppercase", () => {
      expect(normalizeReferralCode("dave1234")).toBe("DAVE1234");
    });

    it("trims whitespace", () => {
      expect(normalizeReferralCode("  DAVE1234  ")).toBe("DAVE1234");
    });

    it("handles mixed case", () => {
      expect(normalizeReferralCode("DaVe1234")).toBe("DAVE1234");
    });
  });

  describe("generateUniqueReferralCode", () => {
    it("generates a unique code not in existing list", () => {
      const existing = ["DAVE1234", "DAVE5678"];
      const code = generateUniqueReferralCode("Dave Smith", existing);
      expect(code).not.toBe("DAVE1234");
      expect(code).not.toBe("DAVE5678");
    });

    it("falls back to timestamp-based code after max attempts", () => {
      // Create a scenario where collision is very likely
      const existing: string[] = [];
      for (let i = 1000; i < 10000; i++) {
        existing.push(`DAVE${i}`);
      }

      const code = generateUniqueReferralCode("Dave", existing, 5);
      // Should use timestamp fallback format (2 letters + 6 digits)
      expect(code.length).toBe(8);
    });

    it("works with empty existing list", () => {
      const code = generateUniqueReferralCode("John Doe", []);
      expect(code).toMatch(/^JOHN\d{4}$/);
    });

    it("is case-insensitive when checking collisions", () => {
      const existing = ["dave1234"];
      // Note: The implementation normalizes existing codes
      const code = generateUniqueReferralCode("Dave Smith", existing);
      // Should avoid collision with normalized existing
      expect(normalizeReferralCode(code)).not.toBe("DAVE1234");
    });
  });
});
