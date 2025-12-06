import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Timeline } from "@/components/tracking/timeline";
import { WriterAssignmentDialog } from "@/components/admin/writer-assignment-dialog";
import { PaymentValidation } from "@/components/admin/payment-validation";
import { PriceAdjustments } from "@/components/admin/price-adjustments";
import { ProjectStatusActions } from "@/components/admin/project-status-actions";
import { ArrowLeft, ExternalLink, User, Calendar, Phone, Mail, FileText, UserPlus } from "lucide-react";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

interface ProjectRow {
  id: string;
  reference_code: string;
  tracking_token: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  topic: string;
  requirements: string;
  deadline: string;
  special_instructions: string | null;
  status: string;
  agreed_price: number;
  discount_amount: number;
  additional_charges: number;
  writer_share: number;
  admin_share: number;
  created_at: string;
  packages: { name: string } | null;
  profiles: { id: string; full_name: string } | null;
}

interface PaymentProofRow {
  id: string;
  type: string;
  storage_path: string;
  amount_claimed: number;
  validated: boolean;
  rejection_reason: string | null;
  created_at: string;
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

interface WriterRow {
  id: string;
  full_name: string;
  email: string;
  max_concurrent_projects: number;
}

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-gray-100 text-gray-800",
  validated: "bg-blue-100 text-blue-800",
  assigned: "bg-purple-100 text-purple-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  review: "bg-orange-100 text-orange-800",
  complete: "bg-green-100 text-green-800",
  paid: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
  rejected: "bg-red-100 text-red-800",
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch project
  const { data: projectData } = await supabase
    .from("projects")
    .select(`
      id,
      reference_code,
      tracking_token,
      client_name,
      client_email,
      client_phone,
      topic,
      requirements,
      deadline,
      special_instructions,
      status,
      agreed_price,
      discount_amount,
      additional_charges,
      writer_share,
      admin_share,
      created_at,
      packages!projects_package_id_fkey (name),
      profiles!projects_writer_id_fkey (id, full_name)
    `)
    .eq("id", id)
    .single();

  const project = projectData as ProjectRow | null;

  if (!project) {
    notFound();
  }

  // Fetch payment proofs
  const { data: paymentProofsData } = await supabase
    .from("payment_proofs")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const paymentProofs = paymentProofsData as PaymentProofRow[] | null;

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

  // Fetch writers with workload
  const { data: writersData } = await supabase
    .from("profiles")
    .select("id, full_name, email, max_concurrent_projects")
    .eq("role", "writer")
    .eq("is_active", true)
    .order("full_name");

  const writersRaw = writersData as WriterRow[] | null;

  // Get current project counts for writers
  const writerIds = writersRaw?.map((w) => w.id) || [];
  const { data: projectCounts } = await supabase
    .from("projects")
    .select("writer_id")
    .in("writer_id", writerIds)
    .in("status", ["assigned", "in_progress", "review"]);

  const countByWriter = (projectCounts || []).reduce(
    (acc: Record<string, number>, p: { writer_id: string }) => {
      acc[p.writer_id] = (acc[p.writer_id] || 0) + 1;
      return acc;
    },
    {}
  );

  const writers =
    writersRaw?.map((w) => ({
      ...w,
      current_projects: countByWriter[w.id] || 0,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/projects">
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
                {project.status.replace("_", " ")}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Created {format(new Date(project.created_at), "MMMM d, yyyy")}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/track/${project.tracking_token}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Tracking
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{project.client_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Package</p>
                  <p className="font-medium">
                    {project.packages?.name || "N/A"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${project.client_email}`}
                    className="text-primary hover:underline"
                  >
                    {project.client_email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{project.client_phone || "N/A"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Topic</p>
                <p className="font-medium">{project.topic}</p>
              </div>
              <div className="flex items-center gap-4">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="font-medium">
                    {format(new Date(project.deadline), "MMMM d, yyyy h:mm a")}
                  </p>
                </div>
              </div>
              {requirementsData.expected_outputs && (
                <div>
                  <p className="text-sm text-muted-foreground">Expected Outputs</p>
                  <p className="mt-1">{requirementsData.expected_outputs}</p>
                </div>
              )}
              {project.special_instructions && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Special Instructions
                  </p>
                  <p className="mt-1 p-3 bg-muted/50 rounded-md">
                    {project.special_instructions}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Proofs */}
          {paymentProofs && paymentProofs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Proofs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentProofs.map((proof) => (
                    <div
                      key={proof.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium capitalize">{proof.type}</p>
                        <p className="text-sm text-muted-foreground">
                          Claimed: {formatCurrency(proof.amount_claimed)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(proof.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <Badge
                            variant={proof.validated ? "default" : "secondary"}
                            className={
                              proof.validated
                                ? "bg-green-100 text-green-800"
                                : proof.rejection_reason
                                ? "bg-red-100 text-red-800"
                                : ""
                            }
                          >
                            {proof.validated
                              ? "Validated"
                              : proof.rejection_reason
                              ? "Rejected"
                              : "Pending"}
                          </Badge>
                          {proof.rejection_reason && (
                            <p className="text-xs text-red-600 mt-1">
                              {proof.rejection_reason}
                            </p>
                          )}
                        </div>
                        {!proof.validated && !proof.rejection_reason && (
                          <PaymentValidation
                            projectId={project.id}
                            projectReference={project.reference_code}
                            paymentProof={proof}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
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
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Agreed Price</span>
                <span className="font-medium">
                  {formatCurrency(project.agreed_price)}
                </span>
              </div>
              {project.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(project.discount_amount)}</span>
                </div>
              )}
              {project.additional_charges > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Additional Charges</span>
                  <span>+{formatCurrency(project.additional_charges)}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Writer Share (60%)</span>
                  <span>{formatCurrency(project.writer_share)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Admin Share (40%)</span>
                  <span>{formatCurrency(project.admin_share)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Writer Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Writer Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              {project.profiles ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{project.profiles.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Assigned Writer
                      </p>
                    </div>
                  </div>
                  <WriterAssignmentDialog
                    projectId={project.id}
                    projectReference={project.reference_code}
                    currentWriterId={project.profiles.id}
                    writers={writers}
                    trigger={
                      <Button size="sm" variant="outline" className="w-full">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Reassign Writer
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-3">
                    No writer assigned yet
                  </p>
                  <WriterAssignmentDialog
                    projectId={project.id}
                    projectReference={project.reference_code}
                    writers={writers}
                    trigger={
                      <Button size="sm">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign Writer
                      </Button>
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Price Adjustments */}
          <Card>
            <CardHeader>
              <CardTitle>Price Adjustments</CardTitle>
            </CardHeader>
            <CardContent>
              <PriceAdjustments
                projectId={project.id}
                agreedPrice={project.agreed_price}
                discountAmount={project.discount_amount}
                additionalCharges={project.additional_charges}
                writerShare={project.writer_share}
                adminShare={project.admin_share}
              />
            </CardContent>
          </Card>

          {/* Admin Status Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Status Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectStatusActions
                projectId={project.id}
                currentStatus={project.status}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
