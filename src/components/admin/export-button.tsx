"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, Loader2 } from "lucide-react";

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

interface ExportButtonProps {
  projects: Project[];
}

export function ExportButton({ projects }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const generateCSV = (data: Project[], filename: string) => {
    setIsExporting(true);

    try {
      // CSV headers
      const headers = [
        "Reference",
        "Client",
        "Package",
        "Writer",
        "Status",
        "Agreed Price",
        "Discount",
        "Additional Charges",
        "Net Amount",
        "Writer Share (60%)",
        "Admin Share (40%)",
        "Date",
      ];

      // CSV rows
      const rows = data.map((project) => {
        const netAmount =
          project.agreed_price -
          project.discount_amount +
          project.additional_charges;

        return [
          project.reference_code,
          project.client_name,
          project.packages?.name || "",
          project.profiles?.full_name || "",
          project.status,
          project.agreed_price,
          project.discount_amount,
          project.additional_charges,
          netAmount,
          project.writer_share,
          project.admin_share,
          format(new Date(project.created_at), "yyyy-MM-dd"),
        ];
      });

      // Add totals row
      const totals = [
        "TOTALS",
        "",
        "",
        "",
        "",
        data.reduce((sum, p) => sum + p.agreed_price, 0),
        data.reduce((sum, p) => sum + p.discount_amount, 0),
        data.reduce((sum, p) => sum + p.additional_charges, 0),
        data.reduce(
          (sum, p) =>
            sum + p.agreed_price - p.discount_amount + p.additional_charges,
          0
        ),
        data.reduce((sum, p) => sum + p.writer_share, 0),
        data.reduce((sum, p) => sum + p.admin_share, 0),
        "",
      ];

      // Build CSV string
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row
            .map((cell) => {
              // Escape quotes and wrap in quotes if contains comma
              const str = String(cell);
              if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                return `"${str.replace(/"/g, '""')}"`;
              }
              return str;
            })
            .join(",")
        ),
        totals.join(","),
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = () => {
    const filename = `payments-all-${format(new Date(), "yyyy-MM-dd")}.csv`;
    generateCSV(projects, filename);
  };

  const handleExportPending = () => {
    const pending = projects.filter((p) => p.status === "complete");
    const filename = `payments-pending-${format(new Date(), "yyyy-MM-dd")}.csv`;
    generateCSV(pending, filename);
  };

  const handleExportPaid = () => {
    const paid = projects.filter((p) => p.status === "paid");
    const filename = `payments-paid-${format(new Date(), "yyyy-MM-dd")}.csv`;
    generateCSV(paid, filename);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting || projects.length === 0}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export CSV
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportAll}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export All ({projects.length})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPending}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Pending ({projects.filter((p) => p.status === "complete").length})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportPaid}>
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export Paid ({projects.filter((p) => p.status === "paid").length})
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
