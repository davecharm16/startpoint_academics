import Link from "next/link";
import { differenceInHours, format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock } from "lucide-react";

interface AtRiskProject {
  id: string;
  reference_code: string;
  topic: string;
  deadline: string;
  status: string;
  writer_name?: string;
}

interface AtRiskAlertsProps {
  projects: AtRiskProject[];
}

export function AtRiskAlerts({ projects }: AtRiskAlertsProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-700">
          <AlertTriangle className="h-5 w-5" />
          At-Risk Projects ({projects.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-orange-600 mb-4">
          These projects have deadlines within 48 hours and may need attention.
        </p>
        <div className="space-y-3">
          {projects.map((project) => {
            const hoursRemaining = differenceInHours(
              new Date(project.deadline),
              new Date()
            );

            return (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-white border border-orange-200 hover:border-orange-300 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">
                      {project.reference_code}
                    </span>
                    <Badge variant="outline" className="text-orange-700 border-orange-300">
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {project.topic}
                  </p>
                  {project.writer_name && (
                    <p className="text-xs text-muted-foreground">
                      Assigned to: {project.writer_name}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-orange-600">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {hoursRemaining > 0 ? `${hoursRemaining}h left` : "Overdue"}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(project.deadline), "MMM d, h:mm a")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
