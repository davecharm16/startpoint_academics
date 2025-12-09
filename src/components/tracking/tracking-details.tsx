"use client";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Timeline } from "@/components/tracking/timeline";
import { FileDownloads } from "@/components/tracking/file-downloads";
import { FileText } from "lucide-react";

interface Project {
  id: string;
  reference_code: string;
  tracking_token: string;
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

  return (
    <div className="space-y-6">
      {/* File Downloads */}
      <FileDownloads
        trackingToken={project.tracking_token}
        projectStatus={project.status}
      />

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
