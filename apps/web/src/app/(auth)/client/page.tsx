import { createClient } from "@startpoint/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@startpoint/ui";
import { FolderOpen, Gift, Coins } from "lucide-react";
import { ReferralCodeCard } from "@/components/client/referral-code-card";

export default async function ClientDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch profile for referral code and reward balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, referral_code, reward_balance")
    .eq("id", user.id)
    .single();

  const profileData = profile as {
    full_name: string;
    referral_code: string | null;
    reward_balance: number | null;
  } | null;

  // Fetch project count
  const { count: projectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .or(`client_email.eq.${user.email},client_user_id.eq.${user.id}`);

  // Fetch active referral count
  const { count: referralCount } = await supabase
    .from("referrals" as "profiles")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", user.id);

  // Fetch referral settings for discount/reward display
  const { data: settingsData } = await supabase
    .from("referral_settings" as "profiles")
    .select("*")
    .single();

  const referralSettings = settingsData as {
    new_client_discount_type: "percentage" | "fixed";
    new_client_discount_value: number;
    referrer_reward_type: "percentage" | "fixed";
    referrer_reward_value: number;
  } | null;

  const rewardBalance = Number(profileData?.reward_balance || 0);
  const referralCode = profileData?.referral_code || null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {profileData?.full_name}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your account.
        </p>
      </div>

      {/* Referral Code Section */}
      {referralCode && referralSettings && (
        <ReferralCodeCard
          referralCode={referralCode}
          discountType={referralSettings.new_client_discount_type}
          discountValue={referralSettings.new_client_discount_value}
          rewardType={referralSettings.referrer_reward_type}
          rewardValue={referralSettings.referrer_reward_value}
        />
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Projects submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Reward Balance
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(rewardBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available rewards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Referrals
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Friends referred
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
