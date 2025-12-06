"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Project {
  id: string;
  reference_code: string;
  client_name: string;
  topic: string;
  status: string;
  deadline: string;
  agreed_price: number;
  package_name?: string;
  writer_name?: string;
}

interface ProjectTableProps {
  projects: Project[];
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

export function ProjectTable({ projects }: ProjectTableProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No projects found.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Package</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Writer</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id} className="cursor-pointer">
              <TableCell>
                <Link
                  href={`/admin/projects/${project.id}`}
                  className="font-mono text-sm font-medium text-primary hover:underline"
                >
                  {project.reference_code}
                </Link>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{project.client_name}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {project.topic}
                  </p>
                </div>
              </TableCell>
              <TableCell>{project.package_name || "-"}</TableCell>
              <TableCell>
                <Badge
                  variant="secondary"
                  className={STATUS_COLORS[project.status] || ""}
                >
                  {project.status.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>{project.writer_name || "-"}</TableCell>
              <TableCell>
                {format(new Date(project.deadline), "MMM d, yyyy")}
              </TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(project.agreed_price)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
