import { createClient } from "@startpoint/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@startpoint/ui";
import { CopyButton } from "@startpoint/ui";
import { FolderOpen, Gift, Coins } from "lucide-react";

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

      {/* Referral Code Section */}
      {referralCode && (
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-semibold">
                  Share your referral code
                </h3>
                <p className="text-sm text-muted-foreground">
                  Earn rewards when friends sign up and submit projects using
                  your code!
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-3">
                <span className="font-mono text-2xl font-bold tracking-widest text-primary">
                  {referralCode}
                </span>
                <CopyButton
                  value={referralCode}
                  label="Copy referral code"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
