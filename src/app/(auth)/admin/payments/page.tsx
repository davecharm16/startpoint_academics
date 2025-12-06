import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentTable } from "@/components/admin/payment-table";
import { ProfitSummary } from "@/components/admin/profit-summary";
import { ExportButton } from "@/components/admin/export-button";
import { DollarSign, TrendingUp, Users, CheckCircle } from "lucide-react";

interface ProjectRow {
  id: string;
  reference_code: string;
  client_name: string;
  status: string;
  agreed_price: number;
  discount_amount: number;
  additional_charges: number;
  writer_share: number;
  admin_share: number;
  created_at: string;
  packages: { name: string } | null;
  profiles: { full_name: string } | null;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default async function PaymentsPage() {
  const supabase = await createClient();

  // Fetch all completed/paid projects
  const { data: projectsData } = await supabase
    .from("projects")
    .select(`
      id,
      reference_code,
      client_name,
      status,
      agreed_price,
      discount_amount,
      additional_charges,
      writer_share,
      admin_share,
      created_at,
      packages!projects_package_id_fkey (name),
      profiles!projects_writer_id_fkey (full_name)
    `)
    .in("status", ["complete", "paid"])
    .order("created_at", { ascending: false });

  const projects = (projectsData as ProjectRow[] | null) || [];

  // Calculate totals
  const totalRevenue = projects.reduce((sum, p) => sum + p.agreed_price - p.discount_amount + p.additional_charges, 0);
  const totalWriterPayments = projects.reduce((sum, p) => sum + p.writer_share, 0);
  const totalProfit = projects.reduce((sum, p) => sum + p.admin_share, 0);
  const paidProjects = projects.filter((p) => p.status === "paid");
  const pendingProjects = projects.filter((p) => p.status === "complete");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-muted-foreground">
            Track project payments and revenue
          </p>
        </div>
        <ExportButton projects={projects} />
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {projects.length} completed projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Writer Payments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalWriterPayments)}
            </div>
            <p className="text-xs text-muted-foreground">60% share</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalProfit)}
            </div>
            <p className="text-xs text-muted-foreground">40% share</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settled</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingProjects.length} pending payment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profit Summary */}
      <ProfitSummary projects={projects} />

      {/* Payment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentTable projects={projects} />
        </CardContent>
      </Card>
    </div>
  );
}
