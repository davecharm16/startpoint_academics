import { createClient } from "@startpoint/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@startpoint/ui";
import { Users, TrendingUp, Percent, Coins, DollarSign } from "lucide-react";
import { ReferralLeaderboard } from "@/components/admin/referral-leaderboard";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default async function ReferralsPage() {
  const supabase = await createClient();

  // Get all referrals for stats
  const { data: referrals } = await supabase
    .from("referrals" as "profiles")
    .select("*");

  const referralsList = (referrals || []) as Array<{
    id: string;
    referrer_id: string;
    referred_id: string | null;
    referred_email: string;
    status: "signed_up" | "converted";
    reward_amount: number | null;
    reward_status: string | null;
    converted_at: string | null;
    created_at: string;
  }>;

  // Get all reward transactions for total rewards paid
  const { data: transactions } = await supabase
    .from("reward_transactions" as "profiles")
    .select("*");

  const transactionsList = (transactions || []) as Array<{
    type: string;
    amount: number;
  }>;

  // Get leaderboard data from the view
  const { data: leaderboard } = await supabase
    .from("referral_leaderboard" as "profiles")
    .select("*");

  const leaderboardData = (leaderboard || []) as Array<{
    id: string;
    full_name: string;
    referral_code: string;
    total_referrals: number;
    conversions: number;
    total_earned: number;
    available_balance: number;
  }>;

  // Get revenue from referred clients
  const { data: referredProjects } = await supabase
    .from("projects")
    .select("agreed_price, client_user_id")
    .not("client_user_id", "is", null);

  // Calculate stats
  const totalReferrals = referralsList.length;
  const totalConversions = referralsList.filter(
    (r) => r.status === "converted"
  ).length;
  const conversionRate =
    totalReferrals > 0
      ? Math.round((totalConversions / totalReferrals) * 100)
      : 0;
  const totalRewardsPaid = transactionsList
    .filter((t) => t.type === "payout")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Revenue from referred clients (projects where client was referred)
  const referredClientIds = new Set(
    referralsList.filter((r) => r.referred_id).map((r) => r.referred_id)
  );
  const referredRevenue = (referredProjects || [])
    .filter((p: any) => referredClientIds.has(p.client_user_id))
    .reduce((sum: number, p: any) => sum + Number(p.agreed_price || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referral Analytics</h1>
        <p className="text-muted-foreground">
          Monitor referral program performance and top referrers
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Referrals
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferrals}</div>
            <p className="text-xs text-muted-foreground">
              All-time signups via referral
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversions}</div>
            <p className="text-xs text-muted-foreground">
              Referred users who ordered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Signups to conversions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Rewards Paid
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRewardsPaid)}
            </div>
            <p className="text-xs text-muted-foreground">
              Payouts to referrers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Referred Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(referredRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From referred clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Top Referrers</CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboardData.length > 0 ? (
            <ReferralLeaderboard data={leaderboardData} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No referral data yet</p>
              <p className="text-sm">
                Referral analytics will appear here once clients start
                referring.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
