"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, CheckCircle, XCircle, Ban } from "lucide-react";

interface ProjectStatusActionsProps {
  projectId: string;
  currentStatus: string;
}

const ADMIN_STATUS_ACTIONS: Record<string, {
  newStatus: string;
  label: string;
  variant: "default" | "destructive" | "outline";
  icon: React.ReactNode;
  description: string;
  sendCompletionEmail?: boolean;
}[]> = {
  review: [
    {
      newStatus: "complete",
      label: "Mark as Complete",
      variant: "default",
      icon: <CheckCircle className="mr-2 h-4 w-4" />,
      description: "This will mark the project as complete and notify the client that their files are ready for download.",
      sendCompletionEmail: true,
    },
    {
      newStatus: "in_progress",
      label: "Return to Writer",
      variant: "outline",
      icon: <XCircle className="mr-2 h-4 w-4" />,
      description: "This will return the project to the writer for revisions.",
    },
  ],
  submitted: [
    {
      newStatus: "cancelled",
      label: "Cancel Project",
      variant: "destructive",
      icon: <Ban className="mr-2 h-4 w-4" />,
      description: "This will cancel the project. This action cannot be undone.",
    },
  ],
  validated: [
    {
      newStatus: "cancelled",
      label: "Cancel Project",
      variant: "destructive",
      icon: <Ban className="mr-2 h-4 w-4" />,
      description: "This will cancel the project. This action cannot be undone.",
    },
  ],
};

export function ProjectStatusActions({
  projectId,
  currentStatus,
}: ProjectStatusActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const availableActions = ADMIN_STATUS_ACTIONS[currentStatus] || [];

  const handleStatusChange = async (newStatus: string, sendCompletionEmail?: boolean) => {
    setIsUpdating(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Update project status
      const updateData: Record<string, string> = {
        status: newStatus,
      };

      if (newStatus === "complete") {
        updateData.completed_at = new Date().toISOString();
      }

      const { error: updateError } = await (supabase
        .from("projects") as ReturnType<typeof supabase.from>)
        .update(updateData as never)
        .eq("id", projectId);

      if (updateError) throw updateError;

      // Create history entry
      await (supabase
        .from("project_history") as ReturnType<typeof supabase.from>)
        .insert({
          project_id: projectId,
          action: newStatus === "complete" ? "completed" : "status_change",
          old_status: currentStatus,
          new_status: newStatus,
          performed_by: user?.id,
          notes: newStatus === "complete"
            ? "Project marked as complete by admin"
            : `Status changed to ${newStatus}`,
        } as never);

      // Send completion email if applicable
      if (sendCompletionEmail) {
        fetch("/api/notifications/completion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId }),
        }).catch(console.error);
      }

      router.refresh();
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (availableActions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium mb-3">Admin Actions</h4>
      {availableActions.map((action) => (
        <AlertDialog key={action.newStatus}>
          <AlertDialogTrigger asChild>
            <Button
              variant={action.variant}
              disabled={isUpdating}
              className="w-full"
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                action.icon
              )}
              {action.label}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{action.label}</AlertDialogTitle>
              <AlertDialogDescription>
                {action.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleStatusChange(action.newStatus, action.sendCompletionEmail)}
              >
                Confirm
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ))}
    </div>
  );
}
