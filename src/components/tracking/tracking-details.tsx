"use client";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timeline } from "@/components/tracking/timeline";
import { FileText, Download, ExternalLink } from "lucide-react";

interface Project {
  id: string;
  reference_code: string;
  client_name: string;
  topic: string;
  requirements: string;
  deadline: string;
  special_instructions: string | null;
  status: string;
  delivery_link: string | null;
}

interface TimelineEvent {
  id: string;
  action: string;
  old_status: string | null;
  new_status: string | null;
  notes: string | null;
  performed_by_name: string | null;
  created_at: string;
}

interface TrackingDetailsProps {
  project: Project;
  timelineEvents: TimelineEvent[];
}

export function TrackingDetails({
  project,
  timelineEvents,
}: TrackingDetailsProps) {
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

  const isComplete = project.status === "complete" || project.status === "paid";

  return (
    <div className="space-y-6">
      {/* File Delivery */}
      {isComplete && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Download className="h-5 w-5" />
              Your Project is Ready!
            </CardTitle>
          </CardHeader>
          <CardContent>
            {project.delivery_link ? (
              <div className="space-y-3">
                <p className="text-green-700">
                  Your completed work is available for download.
                </p>
                <Button asChild className="w-full sm:w-auto">
                  <a
                    href={project.delivery_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Access Deliverables
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-green-700">
                Your project is complete! The delivery link will be available
                shortly. Please check back soon.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Project Brief */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Project Brief
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Client</p>
            <p className="font-medium">{project.client_name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Topic</p>
            <p className="font-medium">{project.topic}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Deadline</p>
            <p className="font-medium">
              {format(new Date(project.deadline), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          {requirementsData.expected_outputs && (
            <div>
              <p className="text-sm text-muted-foreground">Expected Outputs</p>
              <p className="mt-1">{requirementsData.expected_outputs}</p>
            </div>
          )}
          {project.special_instructions && (
            <div>
              <p className="text-sm text-muted-foreground">Special Instructions</p>
              <p className="mt-1 p-3 bg-muted/50 rounded-md whitespace-pre-wrap">
                {project.special_instructions}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      {timelineEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Timeline events={timelineEvents} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
