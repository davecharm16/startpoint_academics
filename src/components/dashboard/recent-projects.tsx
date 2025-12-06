import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecentProject {
  id: string;
  reference_code: string;
  client_name: string;
  topic: string;
  status: string;
  created_at: string;
  package_name?: string;
}

interface RecentProjectsProps {
  projects: RecentProject[];
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

export function RecentProjects({ projects }: RecentProjectsProps) {
  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No projects yet. Projects will appear here once clients submit them.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Projects</CardTitle>
        <Link
          href="/admin/projects"
          className="text-sm text-primary hover:underline"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/admin/projects/${project.id}`}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">
                    {project.reference_code}
                  </span>
                  <Badge
                    variant="secondary"
                    className={STATUS_COLORS[project.status] || ""}
                  >
                    {project.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {project.topic}
                </p>
                <p className="text-xs text-muted-foreground">
                  {project.client_name}
                  {project.package_name && ` • ${project.package_name}`}
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(project.created_at), {
                  addSuffix: true,
                })}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
