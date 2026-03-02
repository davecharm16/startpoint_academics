import { createClient } from "@startpoint/supabase/server";
import { Card, CardContent } from "@startpoint/ui";
import { SocialClaimList } from "@/components/admin/social-claim-list";

export default async function SocialClaimsPage() {
  const supabase = await createClient();

  // Fetch all social claims
  const { data: claims } = await (
    supabase.from(
      "social_claims" as "profiles"
    ) as ReturnType<typeof supabase.from>
  )
    .select("*")
    .order("created_at", { ascending: false });

  // Cast to expected shape
  const claimsList = (claims || []) as Array<{
    id: string;
    user_id: string;
    action_type: "like_page" | "follow_page" | "share_post";
    social_username: string | null;
    screenshot_path: string | null;
    discount_amount: number;
    status: "pending" | "verified" | "rejected";
    verified_by: string | null;
    verified_at: string | null;
    rejection_reason: string | null;
    created_at: string;
  }>;

  // Get unique user IDs and fetch profiles
  const userIds = [...new Set(claimsList.map((c) => c.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds.length > 0 ? userIds : ["none"]);

  const profileMap = new Map(
    (profiles || []).map((p) => [
      p.id,
      p as { id: string; full_name: string; email: string },
    ])
  );

  // Fetch social reward settings for social URLs
  const { data: settingsData } = await (
    supabase.from(
      "social_reward_settings" as "profiles"
    ) as ReturnType<typeof supabase.from>
  ).select("*");

  const settingsList = (settingsData || []) as Array<{
    action_type: string;
    social_url: string;
  }>;

  const socialUrlMap = new Map(
    settingsList.map((s) => [s.action_type, s.social_url || ""])
  );

  // Enrich claims with client info and social URLs
  const enrichedClaims = claimsList.map((c) => ({
    ...c,
    clientName: profileMap.get(c.user_id)?.full_name || "Unknown",
    clientEmail: profileMap.get(c.user_id)?.email || "",
    socialUrl: socialUrlMap.get(c.action_type) || "",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Social Claims</h1>
        <p className="text-muted-foreground">
          Review and verify social media engagement claims
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {enrichedClaims.length > 0 ? (
            <SocialClaimList claims={enrichedClaims} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-lg font-medium">No social claims</p>
              <p className="text-sm">
                Social media claims from clients will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
