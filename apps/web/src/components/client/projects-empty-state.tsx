import Link from "next/link";
import { Button } from "@startpoint/ui";
import { Card, CardContent } from "@startpoint/ui";
import { FolderOpen } from "lucide-react";

export function ProjectsEmptyState() {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div data-testid="empty-state-icon">
          <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
        </div>
        <h3 className="mt-4 text-lg font-medium">No projects yet</h3>
        <p className="mt-2 text-muted-foreground">
          Once you submit a project, it will appear here for easy tracking.
        </p>
        <Button asChild className="mt-6">
          <Link href="/#packages">Submit Your First Project</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
