import { notFound } from "next/navigation";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusStepper } from "@/components/tracking/status-stepper";
import { PinVerification } from "@/components/tracking/pin-verification";
import { TrackingDetails } from "@/components/tracking/tracking-details";
import { FileText, Calendar, Clock, Package } from "lucide-react";
import { cookies } from "next/headers";

interface TrackingPageProps {
  params: Promise<{ token: string }>;
}

interface ProjectRow {
  id: string;
  reference_code: string;
  tracking_token: string;
  client_name: string;
  client_phone: string | null;
  topic: string;
  requirements: string;
  deadline: string;
  special_instructions: string | null;
  status: string;
  estimated_completion_at: string | null;
  created_at: string;
  delivery_link: string | null;
  packages: { name: string } | null;
}

interface HistoryRow {
  id: string;
  action: string;
  old_status: string | null;
  new_status: string | null;
  notes: string | null;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  validated: "Payment Verified",
  assigned: "Writer Assigned",
  in_progress: "In Progress",
  review: "Under Review",
  complete: "Complete",
  paid: "Delivered",
  cancelled: "Cancelled",
  rejected: "Payment Rejected",
};

export default async function TrackingPage({ params }: TrackingPageProps) {
  const { token } = await params;
  const supabase = await createClient();
  const cookieStore = await cookies();

  // Fetch project by tracking token
  const { data: projectData } = await supabase
    .from("projects")
    .select(`
      id,
      reference_code,
      tracking_token,
      client_name,
      client_phone,
      topic,
      requirements,
      deadline,
      special_instructions,
      status,
      estimated_completion_at,
      created_at,
      delivery_link,
      packages!projects_package_id_fkey (name)
    `)
    .eq("tracking_token", token)
    .single();

  const project = projectData as ProjectRow | null;

  if (!project) {
    notFound();
  }

  // Check if PIN is verified via cookie
  const verificationCookie = cookieStore.get(`track_verified_${project.id}`);
  const isVerified = verificationCookie?.value === "true";

  // Fetch history if verified
  let timelineEvents: Array<{
    id: string;
    action: string;
    old_status: string | null;
    new_status: string | null;
    notes: string | null;
    performed_by_name: string | null;
    created_at: string;
  }> = [];

  if (isVerified) {
    const { data: historyData } = await supabase
      .from("project_history")
      .select(`
        id,
        action,
        old_status,
        new_status,
        notes,
        created_at
      `)
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });

    const history = historyData as HistoryRow[] | null;

    timelineEvents =
      history?.map((h) => ({
        id: h.id,
        action: h.action,
        old_status: h.old_status,
        new_status: h.new_status,
        notes: h.notes,
        performed_by_name: "Your assigned team",
        created_at: h.created_at,
      })) || [];
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">Project Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Reference: <span className="font-mono">{project.reference_code}</span>
          </p>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Current Status</CardTitle>
              <Badge
                variant="secondary"
                className={
                  project.status === "complete" || project.status === "paid"
                    ? "bg-green-100 text-green-800"
                    : project.status === "rejected" || project.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }
              >
                {STATUS_LABELS[project.status] || project.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <StatusStepper currentStatus={project.status} />
          </CardContent>
        </Card>

        {/* Public Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Package</p>
                  <p className="font-medium">{project.packages?.name || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="font-medium">
                    {format(new Date(project.deadline), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
              {project.estimated_completion_at && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Estimated Completion
                    </p>
                    <p className="font-medium">
                      {format(
                        new Date(project.estimated_completion_at),
                        "MMMM d, yyyy"
                      )}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                  <p className="font-medium">
                    {format(new Date(project.created_at), "MMMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PIN Verification / Full Details */}
        {isVerified ? (
          <TrackingDetails
            project={project}
            timelineEvents={timelineEvents}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>View Full Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Enter the last 4 digits of the phone number used during
                submission to view complete project details.
              </p>
              <PinVerification
                projectId={project.id}
                token={token}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
