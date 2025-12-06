import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { format, differenceInHours } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Timeline } from "@/components/tracking/timeline";
import { WriterStatusActions } from "@/components/writer/status-actions";
import { WriterNoteForm } from "@/components/writer/note-form";
import { EstimatedCompletionForm } from "@/components/writer/estimated-completion-form";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

interface ProjectRow {
  id: string;
  reference_code: string;
  topic: string;
  requirements: string;
  deadline: string;
  special_instructions: string | null;
  status: string;
  agreed_price: number;
  writer_share: number;
  estimated_completion_at: string | null;
  created_at: string;
  packages: { name: string } | null;
}

interface HistoryRow {
  id: string;
  action: string;
  old_status: string | null;
  new_status: string | null;
  notes: string | null;
  created_at: string;
  profiles: { full_name: string } | null;
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

export default async function WriterProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Fetch project
  const { data: projectData } = await supabase
    .from("projects")
    .select(`
      id,
      reference_code,
      topic,
      requirements,
      deadline,
      special_instructions,
      status,
      agreed_price,
      writer_share,
      estimated_completion_at,
      created_at,
      packages!projects_package_id_fkey (name)
    `)
    .eq("id", id)
    .eq("writer_id", user.id)
    .single();

  const project = projectData as ProjectRow | null;

  if (!project) {
    notFound();
  }

  // Fetch project history
  const { data: historyData } = await supabase
    .from("project_history")
    .select(`
      id,
      action,
      old_status,
      new_status,
      notes,
      created_at,
      profiles!project_history_performed_by_fkey (full_name)
    `)
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const history = historyData as HistoryRow[] | null;

  // Transform history for timeline
  const timelineEvents =
    history?.map((h) => ({
      id: h.id,
      action: h.action,
      old_status: h.old_status,
      new_status: h.new_status,
      notes: h.notes,
      performed_by_name: h.profiles?.full_name || null,
      created_at: h.created_at,
    })) || [];

  // Parse requirements
  let requirementsData: Record<string, string> = {};
  try {
    const parsed = JSON.parse(project.requirements);
    if (typeof parsed === "object" && parsed !== null) {
      for (const [key, value] of Object.entries(parsed)) {
        requirementsData[key] = String(value);
      }
    }
  } catch {
    requirementsData = { raw: project.requirements };
  }

  const hoursUntilDeadline = differenceInHours(
    new Date(project.deadline),
    new Date()
  );
  const isUrgent = hoursUntilDeadline <= 48 && hoursUntilDeadline > 0;
  const isOverdue = hoursUntilDeadline <= 0;
  const isActive = ["assigned", "in_progress", "review"].includes(project.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/writer">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono">
                {project.reference_code}
              </h1>
              <Badge
                variant="secondary"
                className={STATUS_COLORS[project.status] || ""}
              >
                {STATUS_LABELS[project.status] || project.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{project.packages?.name}</p>
          </div>
        </div>
      </div>

      {/* Urgent Warning */}
      {isActive && (isUrgent || isOverdue) && (
        <div
          className={`flex items-center gap-3 p-4 rounded-lg ${
            isOverdue ? "bg-red-100 text-red-800" : "bg-orange-100 text-orange-800"
          }`}
        >
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-medium">
              {isOverdue ? "Project is overdue!" : "Deadline approaching!"}
            </p>
            <p className="text-sm">
              {isOverdue
                ? "Please complete this project as soon as possible."
                : `Only ${hoursUntilDeadline} hours remaining until deadline.`}
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Brief */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Brief
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Topic</p>
                <p className="font-medium">{project.topic}</p>
              </div>

              {requirementsData.expected_outputs && (
                <div>
                  <p className="text-sm text-muted-foreground">Expected Outputs</p>
                  <p className="mt-1">{requirementsData.expected_outputs}</p>
                </div>
              )}

              {requirementsData.page_count && (
                <div>
                  <p className="text-sm text-muted-foreground">Page Count</p>
                  <p className="mt-1">{requirementsData.page_count} pages</p>
                </div>
              )}

              {project.special_instructions && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Special Instructions
                  </p>
                  <p className="mt-1 p-3 bg-muted/50 rounded-md whitespace-pre-wrap">
                    {project.special_instructions}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add Note */}
          {isActive && (
            <Card>
              <CardHeader>
                <CardTitle>Add Note</CardTitle>
              </CardHeader>
              <CardContent>
                <WriterNoteForm projectId={project.id} />
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Timeline events={timelineEvents} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Deadline Card */}
          <Card className={isOverdue ? "border-red-300" : isUrgent ? "border-orange-300" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Deadline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-xl font-bold ${
                  isOverdue
                    ? "text-red-600"
                    : isUrgent
                    ? "text-orange-600"
                    : ""
                }`}
              >
                {format(new Date(project.deadline), "MMMM d, yyyy")}
              </p>
              <p className="text-muted-foreground">
                {format(new Date(project.deadline), "h:mm a")}
              </p>
              {!isOverdue && hoursUntilDeadline > 0 && (
                <p className="mt-2 text-sm">
                  {hoursUntilDeadline < 24
                    ? `${hoursUntilDeadline} hours remaining`
                    : `${Math.floor(hoursUntilDeadline / 24)} days remaining`}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Estimated Completion */}
          {isActive && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Estimated Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EstimatedCompletionForm
                  projectId={project.id}
                  currentDate={project.estimated_completion_at}
                  deadline={project.deadline}
                />
              </CardContent>
            </Card>
          )}

          {/* Earnings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Your Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {formatCurrency(project.writer_share)}
              </p>
              <p className="text-sm text-muted-foreground">60% of agreed price</p>
            </CardContent>
          </Card>

          {/* Status Actions */}
          {isActive && (
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent>
                <WriterStatusActions
                  projectId={project.id}
                  currentStatus={project.status}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
