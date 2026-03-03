import { createClient } from "@startpoint/supabase/server";
import { Card, CardContent } from "@startpoint/ui";
import { PayoutList } from "@/components/admin/payout-list";

export default async function PayoutsPage() {
  const supabase = await createClient();

  // Fetch all payout requests with client profiles
  const { data: payouts } = await supabase
    .from("payout_requests" as "profiles")
    .select("*")
    .order("created_at", { ascending: false });

  // Cast to expected shape
  const payoutsList = (payouts || []) as Array<{
    id: string;
    user_id: string;
    amount: number;
    payment_method: "gcash" | "bank";
    payment_details: { account_number?: string; account_name?: string };
    status: "pending" | "paid" | "rejected";
    rejection_reason: string | null;
    processed_by: string | null;
    processed_at: string | null;
    created_at: string;
  }>;

  // Get unique user IDs and fetch profiles
  const userIds = [...new Set(payoutsList.map((p) => p.user_id))];
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

  // Enrich payouts with client info
  const enrichedPayouts = payoutsList.map((p) => ({
    ...p,
    clientName: profileMap.get(p.user_id)?.full_name || "Unknown",
    clientEmail: profileMap.get(p.user_id)?.email || "",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payout Requests</h1>
        <p className="text-muted-foreground">
          Review and process cash payout requests from referrers
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {enrichedPayouts.length > 0 ? (
            <PayoutList payouts={enrichedPayouts} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-lg font-medium">No payout requests</p>
              <p className="text-sm">
                Payout requests from clients will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
