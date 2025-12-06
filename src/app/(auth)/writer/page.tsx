import Link from "next/link";
import { format, differenceInHours } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, AlertTriangle, Calendar, ArrowRight } from "lucide-react";

interface ProjectRow {
  id: string;
  reference_code: string;
  topic: string;
  deadline: string;
  status: string;
  agreed_price: number;
  writer_share: number;
  created_at: string;
  packages: { name: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  assigned: "bg-purple-100 text-purple-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  review: "bg-orange-100 text-orange-800",
  complete: "bg-green-100 text-green-800",
  paid: "bg-emerald-100 text-emerald-800",
};

const STATUS_LABELS: Record<string, string> = {
  assigned: "Assigned",
  in_progress: "In Progress",
  review: "Under Review",
  complete: "Complete",
  paid: "Paid",
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default async function WriterDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch assigned projects
  const { data: projectsData } = await supabase
    .from("projects")
    .select(`
      id,
      reference_code,
      topic,
      deadline,
      status,
      agreed_price,
      writer_share,
      created_at,
      packages!projects_package_id_fkey (name)
    `)
    .eq("writer_id", user.id)
    .in("status", ["assigned", "in_progress", "review", "complete", "paid"])
    .order("deadline", { ascending: true });

  const projects = (projectsData as ProjectRow[] | null) || [];

  const activeProjects = projects.filter((p) =>
    ["assigned", "in_progress", "review"].includes(p.status)
  );
  const completedProjects = projects.filter((p) =>
    ["complete", "paid"].includes(p.status)
  );

  const urgentProjects = activeProjects.filter((p) => {
    const hoursUntilDeadline = differenceInHours(new Date(p.deadline), new Date());
    return hoursUntilDeadline <= 48 && hoursUntilDeadline > 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Projects</h1>
        <p className="text-muted-foreground">
          Manage your assigned projects and track progress
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urgentProjects.length}</div>
            <p className="text-xs text-muted-foreground">Due within 48 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Projects */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Active Projects</h2>
        {activeProjects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No active projects</h3>
              <p className="mt-2 text-muted-foreground">
                You&apos;ll see your assigned projects here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeProjects.map((project) => {
              const hoursUntilDeadline = differenceInHours(
                new Date(project.deadline),
                new Date()
              );
              const isUrgent = hoursUntilDeadline <= 48 && hoursUntilDeadline > 0;
              const isOverdue = hoursUntilDeadline <= 0;

              return (
                <Card
                  key={project.id}
                  className={`${
                    isOverdue
                      ? "border-red-300 bg-red-50/50"
                      : isUrgent
                      ? "border-orange-300 bg-orange-50/50"
                      : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium">
                            {project.reference_code}
                          </span>
                          <Badge
                            variant="secondary"
                            className={STATUS_COLORS[project.status]}
                          >
                            {STATUS_LABELS[project.status]}
                          </Badge>
                        </div>
                        <h3 className="font-medium line-clamp-2">{project.topic}</h3>
                        <p className="text-sm text-muted-foreground">
                          {project.packages?.name}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          isOverdue
                            ? "text-red-600"
                            : isUrgent
                            ? "text-orange-600"
                            : "text-muted-foreground"
                        }`}
                      >
                        <Calendar className="h-4 w-4" />
                        <span>
                          {isOverdue
                            ? "Overdue!"
                            : format(new Date(project.deadline), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <Button size="sm" asChild>
                        <Link href={`/writer/projects/${project.id}`}>
                          View Brief
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Projects */}
      {completedProjects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Completed Projects</h2>
          <div className="space-y-2">
            {completedProjects.slice(0, 5).map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">
                        {project.reference_code}
                      </span>
                      <Badge
                        variant="secondary"
                        className={STATUS_COLORS[project.status]}
                      >
                        {STATUS_LABELS[project.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {project.topic}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(project.writer_share)}
                  </p>
                  <p className="text-xs text-muted-foreground">Your share</p>
                </div>
              </div>
            ))}
            {completedProjects.length > 5 && (
              <Button variant="outline" asChild className="w-full">
                <Link href="/writer/earnings">View All Earnings</Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
