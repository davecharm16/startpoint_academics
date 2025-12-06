"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";

interface Writer {
  id: string;
  full_name: string;
}

interface Package {
  id: string;
  name: string;
}

interface ProjectFiltersProps {
  writers: Writer[];
  packages: Package[];
}

const STATUSES = [
  { value: "submitted", label: "Submitted" },
  { value: "validated", label: "Validated" },
  { value: "assigned", label: "Assigned" },
  { value: "in_progress", label: "In Progress" },
  { value: "review", label: "Review" },
  { value: "complete", label: "Complete" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
  { value: "rejected", label: "Rejected" },
];

export function ProjectFilters({ writers, packages }: ProjectFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status") || "";
  const currentWriter = searchParams.get("writer") || "";
  const currentPackage = searchParams.get("package") || "";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/projects?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/admin/projects");
  };

  const hasFilters = currentStatus || currentWriter || currentPackage;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Select
        value={currentStatus || "all"}
        onValueChange={(value) => updateFilter("status", value)}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUSES.map((status) => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentWriter || "all"}
        onValueChange={(value) => updateFilter("writer", value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All writers" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All writers</SelectItem>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {writers.map((writer) => (
            <SelectItem key={writer.id} value={writer.id}>
              {writer.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={currentPackage || "all"}
        onValueChange={(value) => updateFilter("package", value)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All packages" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All packages</SelectItem>
          {packages.map((pkg) => (
            <SelectItem key={pkg.id} value={pkg.id}>
              {pkg.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Clear filters
        </Button>
      )}
    </div>
  );
}
