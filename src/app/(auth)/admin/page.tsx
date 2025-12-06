import { createClient } from "@/lib/supabase/server";
import { differenceInHours, startOfMonth } from "date-fns";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentProjects } from "@/components/dashboard/recent-projects";
import { AtRiskAlerts } from "@/components/dashboard/at-risk-alerts";

interface MonthlyProject {
  agreed_price: number;
}

interface RecentProjectRow {
  id: string;
  reference_code: string;
  client_name: string;
  topic: string;
  status: string;
  created_at: string;
  packages: { name: string } | null;
}

interface AtRiskProjectRow {
  id: string;
  reference_code: string;
  topic: string;
  deadline: string;
  status: string;
  profiles: { full_name: string } | null;
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get stats
  const [
    totalResult,
    inProgressResult,
    pendingResult,
    monthlyResult,
    recentResult,
  ] = await Promise.all([
    // Total projects
    supabase.from("projects").select("*", { count: "exact", head: true }),

    // In progress projects
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .in("status", ["assigned", "in_progress", "review"]),

    // Pending validation
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "submitted"),

    // Monthly revenue (projects created this month)
    supabase
      .from("projects")
      .select("agreed_price")
      .gte("created_at", startOfMonth(new Date()).toISOString()),

    // Recent projects (last 5)
    supabase
      .from("projects")
      .select(`
        id,
        reference_code,
        client_name,
        topic,
        status,
        created_at,
        packages!projects_package_id_fkey (name)
      `)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const totalProjects = totalResult.count || 0;
  const inProgressCount = inProgressResult.count || 0;
  const pendingValidation = pendingResult.count || 0;

  // Type cast the results
  const monthlyProjects = monthlyResult.data as MonthlyProject[] | null;
  const recentProjects = recentResult.data as RecentProjectRow[] | null;

  // Calculate monthly revenue
  const monthlyRevenue =
    monthlyProjects?.reduce((sum, p) => sum + (p.agreed_price || 0), 0) || 0;

  // Transform recent projects data
  const recentProjectsData =
    recentProjects?.map((p) => ({
      id: p.id,
      reference_code: p.reference_code,
      client_name: p.client_name,
      topic: p.topic,
      status: p.status,
      created_at: p.created_at,
      package_name: p.packages?.name,
    })) || [];

  // Get at-risk projects (deadline within 48h, not complete/paid/cancelled)
  const now = new Date();
  const { data: atRiskProjectsRaw } = await supabase
    .from("projects")
    .select(`
      id,
      reference_code,
      topic,
      deadline,
      status,
      profiles!projects_writer_id_fkey (full_name)
    `)
    .not("status", "in", "(complete,paid,cancelled)")
    .order("deadline", { ascending: true });

  const atRiskData = atRiskProjectsRaw as AtRiskProjectRow[] | null;

  // Filter to only projects with deadline within 48 hours
  const atRiskProjects =
    atRiskData
      ?.filter((p) => {
        const hoursUntilDeadline = differenceInHours(
          new Date(p.deadline),
          now
        );
        return hoursUntilDeadline <= 48;
      })
      .map((p) => ({
        id: p.id,
        reference_code: p.reference_code,
        topic: p.topic,
        deadline: p.deadline,
        status: p.status,
        writer_name: p.profiles?.full_name,
      })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your business.
        </p>
      </div>

      <StatsCards
        totalProjects={totalProjects}
        inProgress={inProgressCount}
        pendingValidation={pendingValidation}
        monthlyRevenue={monthlyRevenue}
      />

      <AtRiskAlerts projects={atRiskProjects} />

      <RecentProjects projects={recentProjectsData} />
    </div>
  );
}
