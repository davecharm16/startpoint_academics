import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Gift, Share2 } from "lucide-react";
import Link from "next/link";

export default async function ClientDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profileData = profile as {
    full_name: string;
    referral_code?: string;
    reward_balance?: number;
    role: string;
  } | null;

  if (!profileData || profileData.role !== "client") {
    redirect("/auth/login");
  }

  // Get project count for this client
  const { count: projectCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .or(`client_email.eq.${user.email},client_user_id.eq.${user.id}`);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Welcome, {profileData.full_name}!</h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Projects Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                My Projects
              </CardTitle>
              <CardDescription>View and track your projects</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{projectCount || 0}</p>
              <p className="text-sm text-muted-foreground">Total projects</p>
              <Link href="/client/projects" className="mt-4 inline-block">
                <Button variant="outline" size="sm">View Projects</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Referral Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Referral Program
              </CardTitle>
              <CardDescription>Earn rewards by referring friends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/5 p-3 rounded-lg mb-3">
                <p className="text-xs text-muted-foreground">Your referral code:</p>
                <p className="text-xl font-bold tracking-widest text-primary">
                  {profileData.referral_code || "N/A"}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this code with friends!
              </p>
            </CardContent>
          </Card>

          {/* Rewards Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                My Rewards
              </CardTitle>
              <CardDescription>Track your earned rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                ₱{Number(profileData.reward_balance || 0).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Available balance</p>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800">More Features Coming Soon!</h3>
          <p className="text-sm text-yellow-700 mt-1">
            The full client dashboard with project details, referral tracking, and social rewards
            is being developed. Stay tuned!
          </p>
        </div>
      </main>
    </div>
  );
}
