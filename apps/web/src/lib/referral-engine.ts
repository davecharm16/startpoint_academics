/**
 * Referral Engine — Core business logic for referral discounts and rewards.
 * All functions are pure and testable (no Supabase calls).
 */

interface ReferralSettings {
  new_client_discount_type: "percentage" | "fixed";
  new_client_discount_value: number;
  referrer_reward_type: "percentage" | "fixed";
  referrer_reward_value: number;
}

/**
 * Calculate the discount amount for a referred client's first order.
 * @returns The discount amount in PHP (always >= 0, never more than orderTotal)
 */
export function calculateReferralDiscount(
  orderTotal: number,
  settings: ReferralSettings
): number {
  if (orderTotal <= 0) return 0;

  let discount: number;
  if (settings.new_client_discount_type === "percentage") {
    discount =
      Math.round(((orderTotal * settings.new_client_discount_value) / 100) * 100) / 100;
  } else {
    discount = settings.new_client_discount_value;
  }

  // Discount cannot exceed order total (minimum order of 0 after discount)
  return Math.min(Math.max(discount, 0), orderTotal);
}

/**
 * Calculate the reward amount for a referrer when their referral converts.
 * @returns The reward amount in PHP (always >= 0)
 */
export function calculateReferrerReward(
  orderTotal: number,
  settings: ReferralSettings
): number {
  if (orderTotal <= 0) return 0;

  let reward: number;
  if (settings.referrer_reward_type === "percentage") {
    reward =
      Math.round(((orderTotal * settings.referrer_reward_value) / 100) * 100) / 100;
  } else {
    reward = settings.referrer_reward_value;
  }

  return Math.max(reward, 0);
}

/**
 * Calculate balance after a transaction.
 */
export function calculateBalanceAfter(
  currentBalance: number,
  transactionAmount: number
): number {
  return Math.round((currentBalance + transactionAmount) * 100) / 100;
}
