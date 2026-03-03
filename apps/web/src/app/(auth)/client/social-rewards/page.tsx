import { createClient } from "@startpoint/supabase/server";
import { redirect } from "next/navigation";
import { SocialActionCard } from "@/components/client/social-action-card";
import { Card, CardContent, CardHeader, CardTitle } from "@startpoint/ui";
import { Award, TrendingUp } from "lucide-react";

export default async function ClientSocialRewardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch enabled social actions from settings
  const { data: settings } = await supabase
    .from("social_reward_settings" as "profiles")
    .select("*")
    .eq("is_enabled", true)
    .order("action_type");

  const socialActions = (settings || []) as Array<{
    id: string;
    action_type: "like_page" | "follow_page" | "share_post";
    is_enabled: boolean;
    discount_amount: number;
    instruction_text: string;
    social_url: string;
  }>;

  // Fetch user's existing claims
  const { data: claims } = await supabase
    .from("social_claims" as "profiles")
    .select("*")
    .eq("user_id", user.id);

  const userClaims = (claims || []) as Array<{
    id: string;
    action_type: string;
    social_username: string | null;
    status: "pending" | "verified" | "rejected";
    discount_amount: number | null;
    rejection_reason: string | null;
    verified_at: string | null;
    created_at: string;
  }>;

  // Calculate progress
  const claimedCount = userClaims.filter(
    (c) => c.status === "verified"
  ).length;
  const totalActions = socialActions.length;
  const totalEarned = userClaims
    .filter((c) => c.status === "verified")
    .reduce((sum, c) => sum + (c.discount_amount || 0), 0);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Social Rewards</h1>
        <p className="text-muted-foreground">
          Earn discounts by engaging with us on social media
        </p>
      </div>

      {/* Progress + Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {claimedCount} of {totalActions}
            </div>
            <p className="text-xs text-muted-foreground">
              Social rewards claimed
            </p>
            {/* Progress bar */}
            <div className="mt-3 h-2 w-full rounded-full bg-muted">
              <div
                className="h-2 rounded-full bg-primary transition-all"
                style={{
                  width:
                    totalActions > 0
                      ? `${(claimedCount / totalActions) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalEarned)}
            </div>
            <p className="text-xs text-muted-foreground">
              From social rewards
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Social Action Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {socialActions.map((action) => {
          const claim = userClaims.find(
            (c) => c.action_type === action.action_type
          );
          return (
            <SocialActionCard
              key={action.id}
              actionType={action.action_type}
              discountAmount={action.discount_amount}
              instructionText={action.instruction_text}
              socialUrl={action.social_url}
              claim={claim || null}
              userId={user.id}
            />
          );
        })}
      </div>

      {socialActions.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>No social rewards are currently available. Check back later!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
