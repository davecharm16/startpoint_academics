import Link from "next/link";
import { differenceInHours } from "date-fns";
import { format } from "date-fns";
import { Card, CardContent } from "@startpoint/ui";
import { Badge } from "@startpoint/ui";
import { Calendar, ArrowRight } from "lucide-react";

export interface ClientProject {
  id: string;
  reference_code: string;
  topic: string;
  status: string;
  deadline: string;
  tracking_token: string;
  created_at: string;
  package_name: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800",
  assigned: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-orange-100 text-orange-800",
  review: "bg-purple-100 text-purple-800",
  complete: "bg-green-100 text-green-800",
  paid: "bg-green-100 text-green-800",
};

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  assigned: "Assigned",
  in_progress: "In Progress",
  review: "Under Review",
  complete: "Complete",
  paid: "Paid",
};

function truncateTopic(topic: string, maxLength: number = 60): string {
  if (topic.length <= maxLength) return topic;
  return topic.slice(0, maxLength - 3) + "...";
}

interface ProjectCardProps {
  project: ClientProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const hoursUntilDeadline = differenceInHours(
    new Date(project.deadline),
    new Date()
  );
  const isOverdue = hoursUntilDeadline <= 0;
  const isUrgent = hoursUntilDeadline <= 48 && hoursUntilDeadline > 0;

  return (
    <Link href={`/track/${project.tracking_token}`} className="block">
      <Card
        className={`transition-shadow hover:shadow-md ${
          isOverdue
            ? "border-red-300 bg-red-50/50"
            : isUrgent
            ? "border-orange-300 bg-orange-50/50"
            : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-medium">
                  {project.reference_code}
                </span>
                <Badge
                  variant="secondary"
                  className={
                    STATUS_COLORS[project.status] || "bg-gray-100 text-gray-800"
                  }
                >
                  {STATUS_LABELS[project.status] || project.status}
                </Badge>
              </div>
              <h3 className="font-medium">
                {truncateTopic(project.topic)}
              </h3>
              {project.package_name && (
                <p className="text-sm text-muted-foreground">
                  {project.package_name}
                </p>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground ml-2 mt-1 flex-shrink-0" />
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
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
