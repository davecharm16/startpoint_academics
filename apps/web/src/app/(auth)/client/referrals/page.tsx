import { createClient } from "@startpoint/supabase/server";
import { redirect } from "next/navigation";
import { ReferralCodeCard } from "@/components/client/referral-code-card";
import { ReferralStats } from "@/components/client/referral-stats";
import { ReferralList } from "@/components/client/referral-list";
import { RewardRedemption } from "@/components/client/reward-redemption";

export default async function ClientReferralsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code, reward_balance, apply_rewards_to_next_order")
    .eq("id", user.id)
    .single();

  const profileData = profile as {
    referral_code: string | null;
    reward_balance: number | null;
    apply_rewards_to_next_order: boolean | null;
  } | null;

  // Fetch referral settings
  const { data: settingsData } = await supabase
    .from("referral_settings" as "profiles")
    .select("*")
    .single();

  const settings = settingsData as {
    new_client_discount_type: "percentage" | "fixed";
    new_client_discount_value: number;
    referrer_reward_type: "percentage" | "fixed";
    referrer_reward_value: number;
    minimum_payout: number;
  } | null;

  // Fetch user's referrals
  const { data: referrals } = await supabase
    .from("referrals" as "profiles")
    .select("*")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false });

  const referralsList = ((referrals as unknown) || []) as Array<{
    id: string;
    referred_email: string;
    status: "signed_up" | "converted";
    reward_amount: number | null;
    reward_status: string | null;
    created_at: string;
  }>;

  // Fetch reward transactions
  const { data: transactions } = await supabase
    .from("reward_transactions" as "profiles")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const transactionsList = ((transactions as unknown) || []) as Array<{
    type: string;
    amount: number;
  }>;

  // Fetch pending payout requests
  const { data: pendingPayouts } = await supabase
    .from("payout_requests" as "profiles")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "pending");

  const referralCode = profileData?.referral_code || null;
  const rewardBalance = Number(profileData?.reward_balance || 0);
  const applyToNextOrder = Boolean(
    profileData?.apply_rewards_to_next_order || false
  );
  const hasPendingPayout =
    Array.isArray(pendingPayouts) && pendingPayouts.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Referrals</h1>
        <p className="text-muted-foreground">
          Track your referrals and manage your rewards
        </p>
      </div>

      {/* Referral Code Card */}
      {referralCode && settings && (
        <ReferralCodeCard
          referralCode={referralCode}
          discountType={settings.new_client_discount_type}
          discountValue={settings.new_client_discount_value}
          rewardType={settings.referrer_reward_type}
          rewardValue={settings.referrer_reward_value}
        />
      )}

      {/* Stats */}
      <ReferralStats
        referrals={referralsList}
        transactions={transactionsList}
      />

      {/* Reward Redemption (Story 8-12) */}
      <RewardRedemption
        rewardBalance={rewardBalance}
        minimumPayout={settings?.minimum_payout || 500}
        applyToNextOrder={applyToNextOrder}
        hasPendingPayout={hasPendingPayout}
        userId={user.id}
      />

      {/* Referral List */}
      <ReferralList referrals={referralsList} />
    </div>
  );
}
