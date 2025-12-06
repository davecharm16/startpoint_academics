"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle } from "lucide-react";

interface Project {
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

interface PaymentTableProps {
  projects: Project[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function PaymentTable({ projects }: PaymentTableProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "complete" | "paid">("all");
  const [markingPaid, setMarkingPaid] = useState<string | null>(null);

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((p) => p.status === filter);

  const handleMarkPaid = async (projectId: string) => {
    setMarkingPaid(projectId);

    try {
      const supabase = createClient();

      // Update project status to paid
      const { error: updateError } = await (supabase
        .from("projects") as ReturnType<typeof supabase.from>)
        .update({ status: "paid" } as never)
        .eq("id", projectId);

      if (updateError) throw updateError;

      // Create audit log
      const { data: { user } } = await supabase.auth.getUser();

      await (supabase
        .from("project_history") as ReturnType<typeof supabase.from>)
        .insert({
          project_id: projectId,
          action: "marked_paid",
          old_status: "complete",
          new_status: "paid",
          notes: "Project marked as paid",
          performed_by: user?.id,
        } as never);

      router.refresh();
    } catch (err) {
      console.error("Mark paid error:", err);
    } finally {
      setMarkingPaid(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter:</span>
        <Select
          value={filter}
          onValueChange={(value: "all" | "complete" | "paid") => setFilter(value)}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All ({projects.length})</SelectItem>
            <SelectItem value="complete">
              Pending ({projects.filter((p) => p.status === "complete").length})
            </SelectItem>
            <SelectItem value="paid">
              Paid ({projects.filter((p) => p.status === "paid").length})
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No projects found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">Reference</th>
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Writer</th>
                <th className="pb-3 font-medium text-right">Amount</th>
                <th className="pb-3 font-medium text-right">Writer (60%)</th>
                <th className="pb-3 font-medium text-right">Admin (40%)</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProjects.map((project) => {
                const netAmount =
                  project.agreed_price -
                  project.discount_amount +
                  project.additional_charges;

                return (
                  <tr key={project.id} className="text-sm">
                    <td className="py-3 font-mono">{project.reference_code}</td>
                    <td className="py-3">{project.client_name}</td>
                    <td className="py-3">
                      {project.profiles?.full_name || "—"}
                    </td>
                    <td className="py-3 text-right">
                      {formatCurrency(netAmount)}
                      {(project.discount_amount > 0 ||
                        project.additional_charges > 0) && (
                        <span className="block text-xs text-muted-foreground">
                          {project.discount_amount > 0 &&
                            `-${formatCurrency(project.discount_amount)}`}
                          {project.additional_charges > 0 &&
                            `+${formatCurrency(project.additional_charges)}`}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {formatCurrency(project.writer_share)}
                    </td>
                    <td className="py-3 text-right font-medium text-green-600">
                      {formatCurrency(project.admin_share)}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant="secondary"
                        className={
                          project.status === "paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {project.status === "paid" ? "Paid" : "Pending"}
                      </Badge>
                    </td>
                    <td className="py-3">
                      {project.status === "complete" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkPaid(project.id)}
                          disabled={markingPaid === project.id}
                        >
                          {markingPaid === project.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Mark Paid
                            </>
                          )}
                        </Button>
                      )}
                      {project.status === "paid" && (
                        <span className="text-xs text-muted-foreground">
                          Settled
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
