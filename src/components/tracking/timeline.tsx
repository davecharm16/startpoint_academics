import { format } from "date-fns";
import { CheckCircle, Clock, AlertCircle, User, FileText } from "lucide-react";

interface TimelineEvent {
  id: string;
  action: string;
  old_status: string | null;
  new_status: string | null;
  notes: string | null;
  performed_by_name: string | null;
  created_at: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  showPerformer?: boolean;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case "submitted":
      return <FileText className="h-4 w-4" />;
    case "validated":
    case "complete":
    case "paid":
      return <CheckCircle className="h-4 w-4" />;
    case "rejected":
    case "cancelled":
      return <AlertCircle className="h-4 w-4" />;
    case "note":
      return <User className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case "submitted":
      return "bg-gray-100 text-gray-600";
    case "validated":
      return "bg-blue-100 text-blue-600";
    case "assigned":
      return "bg-purple-100 text-purple-600";
    case "in_progress":
      return "bg-yellow-100 text-yellow-600";
    case "review":
      return "bg-orange-100 text-orange-600";
    case "complete":
    case "paid":
      return "bg-green-100 text-green-600";
    case "rejected":
    case "cancelled":
      return "bg-red-100 text-red-600";
    case "note":
      return "bg-blue-100 text-blue-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
};

const formatAction = (event: TimelineEvent) => {
  if (event.action === "note") {
    return "Added a note";
  }
  if (event.old_status && event.new_status) {
    return `Status changed from ${event.old_status.replace("_", " ")} to ${event.new_status.replace("_", " ")}`;
  }
  if (event.new_status) {
    return `Status set to ${event.new_status.replace("_", " ")}`;
  }
  return event.action.charAt(0).toUpperCase() + event.action.slice(1).replace("_", " ");
};

export function Timeline({ events, showPerformer = true }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No history available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div key={event.id} className="flex gap-4">
          {/* Icon */}
          <div className="flex flex-col items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full ${getActionColor(
                event.action
              )}`}
            >
              {getActionIcon(event.action)}
            </div>
            {index < events.length - 1 && (
              <div className="w-px flex-1 bg-border mt-2" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 pb-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">{formatAction(event)}</p>
              <time className="text-xs text-muted-foreground">
                {format(new Date(event.created_at), "MMM d, yyyy h:mm a")}
              </time>
            </div>
            {showPerformer && event.performed_by_name && (
              <p className="text-xs text-muted-foreground mt-0.5">
                by {event.performed_by_name}
              </p>
            )}
            {event.notes && (
              <p className="mt-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                {event.notes}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
