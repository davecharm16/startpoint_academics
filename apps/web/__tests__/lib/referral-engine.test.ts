/**
 * Tests for referral engine — pure business logic for referral discounts and rewards.
 *
 * Stories 8-10 (Referral Discount Application) and 8-11 (Referrer Reward Tracking)
 * HIGH RISK: Money flow — TDD mandatory for all calculation paths.
 */

import {
  calculateReferralDiscount,
  calculateReferrerReward,
  calculateBalanceAfter,
} from "@/lib/referral-engine";

// Helper to create settings objects
function makeSettings(overrides: Partial<{
  new_client_discount_type: "percentage" | "fixed";
  new_client_discount_value: number;
  referrer_reward_type: "percentage" | "fixed";
  referrer_reward_value: number;
}> = {}) {
  return {
    new_client_discount_type: "percentage" as const,
    new_client_discount_value: 10,
    referrer_reward_type: "fixed" as const,
    referrer_reward_value: 100,
    ...overrides,
  };
}

describe("calculateReferralDiscount", () => {
  it("returns percentage discount correctly (10% of 1000 = 100)", () => {
    const settings = makeSettings({
      new_client_discount_type: "percentage",
      new_client_discount_value: 10,
    });
    expect(calculateReferralDiscount(1000, settings)).toBe(100);
  });

  it("returns fixed discount correctly (fixed 150 on 1000 = 150)", () => {
    const settings = makeSettings({
      new_client_discount_type: "fixed",
      new_client_discount_value: 150,
    });
    expect(calculateReferralDiscount(1000, settings)).toBe(150);
  });

  it("caps discount at order total (200 discount on 100 order = 100)", () => {
    const settings = makeSettings({
      new_client_discount_type: "fixed",
      new_client_discount_value: 200,
    });
    expect(calculateReferralDiscount(100, settings)).toBe(100);
  });

  it("caps percentage discount at order total (100% of 500 = 500, not more)", () => {
    const settings = makeSettings({
      new_client_discount_type: "percentage",
      new_client_discount_value: 100,
    });
    expect(calculateReferralDiscount(500, settings)).toBe(500);
  });

  it("returns 0 for zero order total", () => {
    const settings = makeSettings({
      new_client_discount_type: "percentage",
      new_client_discount_value: 10,
    });
    expect(calculateReferralDiscount(0, settings)).toBe(0);
  });

  it("returns 0 for negative order total", () => {
    const settings = makeSettings({
      new_client_discount_type: "percentage",
      new_client_discount_value: 10,
    });
    expect(calculateReferralDiscount(-500, settings)).toBe(0);
  });

  it("handles decimal precision correctly (10% of 999 = 99.90)", () => {
    const settings = makeSettings({
      new_client_discount_type: "percentage",
      new_client_discount_value: 10,
    });
    expect(calculateReferralDiscount(999, settings)).toBe(99.9);
  });

  it("handles decimal precision for odd percentages (15% of 333 = 49.95)", () => {
    const settings = makeSettings({
      new_client_discount_type: "percentage",
      new_client_discount_value: 15,
    });
    expect(calculateReferralDiscount(333, settings)).toBe(49.95);
  });

  it("returns 0 when discount value is 0", () => {
    const settingsPercentage = makeSettings({
      new_client_discount_type: "percentage",
      new_client_discount_value: 0,
    });
    expect(calculateReferralDiscount(1000, settingsPercentage)).toBe(0);

    const settingsFixed = makeSettings({
      new_client_discount_type: "fixed",
      new_client_discount_value: 0,
    });
    expect(calculateReferralDiscount(1000, settingsFixed)).toBe(0);
  });

  it("does not return negative discount (negative discount value treated as 0)", () => {
    const settings = makeSettings({
      new_client_discount_type: "fixed",
      new_client_discount_value: -50,
    });
    expect(calculateReferralDiscount(1000, settings)).toBe(0);
  });

  it("does not return negative discount for negative percentage value", () => {
    const settings = makeSettings({
      new_client_discount_type: "percentage",
      new_client_discount_value: -10,
    });
    expect(calculateReferralDiscount(1000, settings)).toBe(0);
  });
});

describe("calculateReferrerReward", () => {
  it("returns fixed reward correctly (100 for any order)", () => {
    const settings = makeSettings({
      referrer_reward_type: "fixed",
      referrer_reward_value: 100,
    });
    expect(calculateReferrerReward(2000, settings)).toBe(100);
    expect(calculateReferrerReward(500, settings)).toBe(100);
  });

  it("returns percentage reward correctly (5% of 2000 = 100)", () => {
    const settings = makeSettings({
      referrer_reward_type: "percentage",
      referrer_reward_value: 5,
    });
    expect(calculateReferrerReward(2000, settings)).toBe(100);
  });

  it("returns 0 for zero order total", () => {
    const settings = makeSettings({
      referrer_reward_type: "fixed",
      referrer_reward_value: 100,
    });
    expect(calculateReferrerReward(0, settings)).toBe(0);
  });

  it("returns 0 for negative order total", () => {
    const settings = makeSettings({
      referrer_reward_type: "percentage",
      referrer_reward_value: 5,
    });
    expect(calculateReferrerReward(-1000, settings)).toBe(0);
  });

  it("handles decimal precision correctly (5% of 999 = 49.95)", () => {
    const settings = makeSettings({
      referrer_reward_type: "percentage",
      referrer_reward_value: 5,
    });
    expect(calculateReferrerReward(999, settings)).toBe(49.95);
  });

  it("returns 0 when reward value is 0", () => {
    const settingsFixed = makeSettings({
      referrer_reward_type: "fixed",
      referrer_reward_value: 0,
    });
    expect(calculateReferrerReward(1000, settingsFixed)).toBe(0);

    const settingsPercentage = makeSettings({
      referrer_reward_type: "percentage",
      referrer_reward_value: 0,
    });
    expect(calculateReferrerReward(1000, settingsPercentage)).toBe(0);
  });

  it("does not return negative reward for negative values", () => {
    const settings = makeSettings({
      referrer_reward_type: "fixed",
      referrer_reward_value: -50,
    });
    expect(calculateReferrerReward(1000, settings)).toBe(0);
  });
});

describe("calculateBalanceAfter", () => {
  it("adds positive amount to balance", () => {
    expect(calculateBalanceAfter(500, 100)).toBe(600);
  });

  it("handles zero balance correctly", () => {
    expect(calculateBalanceAfter(0, 250)).toBe(250);
  });

  it("handles decimal precision (avoids floating point errors)", () => {
    // 0.1 + 0.2 in floating point would be 0.30000000000000004
    expect(calculateBalanceAfter(0.1, 0.2)).toBe(0.3);
    expect(calculateBalanceAfter(100.10, 50.20)).toBe(150.3);
  });

  it("returns correct balance for negative amounts (payouts)", () => {
    expect(calculateBalanceAfter(1000, -300)).toBe(700);
  });

  it("allows balance to go negative (admin correction)", () => {
    expect(calculateBalanceAfter(100, -200)).toBe(-100);
  });

  it("handles zero amount", () => {
    expect(calculateBalanceAfter(500, 0)).toBe(500);
  });

  it("handles both zero balance and zero amount", () => {
    expect(calculateBalanceAfter(0, 0)).toBe(0);
  });
});
