import { redirect } from "next/navigation";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, CheckCircle, Clock } from "lucide-react";

interface ProjectRow {
  id: string;
  reference_code: string;
  topic: string;
  status: string;
  writer_share: number;
  created_at: string;
  packages: { name: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  complete: "bg-green-100 text-green-800",
  paid: "bg-emerald-100 text-emerald-800",
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default async function WriterEarningsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch all completed/paid projects
  const { data: projectsData } = await supabase
    .from("projects")
    .select(`
      id,
      reference_code,
      topic,
      status,
      writer_share,
      created_at,
      packages!projects_package_id_fkey (name)
    `)
    .eq("writer_id", user.id)
    .in("status", ["complete", "paid"])
    .order("created_at", { ascending: false });

  const projects = (projectsData as ProjectRow[] | null) || [];

  // Calculate totals
  const totalEarnings = projects.reduce((sum, p) => sum + p.writer_share, 0);
  const paidEarnings = projects
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.writer_share, 0);
  const pendingEarnings = projects
    .filter((p) => p.status === "complete")
    .reduce((sum, p) => sum + p.writer_share, 0);

  // This month's earnings
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const thisMonthProjects = projects.filter((p) => {
    const date = new Date(p.created_at);
    return date >= monthStart && date <= monthEnd;
  });
  const thisMonthEarnings = thisMonthProjects.reduce(
    (sum, p) => sum + p.writer_share,
    0
  );

  // Last month's earnings for comparison
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));
  const lastMonthProjects = projects.filter((p) => {
    const date = new Date(p.created_at);
    return date >= lastMonthStart && date <= lastMonthEnd;
  });
  const lastMonthEarnings = lastMonthProjects.reduce(
    (sum, p) => sum + p.writer_share,
    0
  );

  const monthOverMonthChange =
    lastMonthEarnings > 0
      ? ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings) * 100
      : thisMonthEarnings > 0
      ? 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Earnings</h1>
        <p className="text-muted-foreground">
          Track your project earnings and payment status
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              {projects.length} completed project{projects.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(thisMonthEarnings)}
            </div>
            <p
              className={`text-xs ${
                monthOverMonthChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {monthOverMonthChange >= 0 ? "+" : ""}
              {monthOverMonthChange.toFixed(0)}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(paidEarnings)}</div>
            <p className="text-xs text-muted-foreground">Settled payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(pendingEarnings)}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No earnings yet</h3>
              <p className="mt-2 text-muted-foreground">
                Your completed projects will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {project.reference_code}
                      </span>
                      <Badge
                        variant="secondary"
                        className={STATUS_COLORS[project.status]}
                      >
                        {project.status === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                      {project.topic}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project.packages?.name} •{" "}
                      {format(new Date(project.created_at), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">
                      {formatCurrency(project.writer_share)}
                    </p>
                    <p className="text-xs text-muted-foreground">Your share</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
