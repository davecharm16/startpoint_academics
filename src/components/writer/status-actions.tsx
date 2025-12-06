"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, Play, Send, RotateCcw } from "lucide-react";

interface WriterStatusActionsProps {
  projectId: string;
  currentStatus: string;
}

const STATUS_TRANSITIONS: Record<string, { next: string; label: string; icon: React.ReactNode }[]> = {
  assigned: [
    { next: "in_progress", label: "Start Working", icon: <Play className="mr-2 h-4 w-4" /> },
  ],
  in_progress: [
    { next: "review", label: "Submit for Review", icon: <Send className="mr-2 h-4 w-4" /> },
  ],
  review: [
    { next: "in_progress", label: "Back to Working", icon: <RotateCcw className="mr-2 h-4 w-4" /> },
  ],
};

export function WriterStatusActions({
  projectId,
  currentStatus,
}: WriterStatusActionsProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const availableTransitions = STATUS_TRANSITIONS[currentStatus] || [];

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);

    try {
      const supabase = createClient();

      // Update project status
      const { error: updateError } = await (supabase
        .from("projects") as ReturnType<typeof supabase.from>)
        .update({
          status: newStatus,
          last_activity_at: new Date().toISOString(),
        } as never)
        .eq("id", projectId);

      if (updateError) throw updateError;

      // Create history entry
      const { data: { user } } = await supabase.auth.getUser();

      await (supabase
        .from("project_history") as ReturnType<typeof supabase.from>)
        .insert({
          project_id: projectId,
          action: "status_change",
          old_status: currentStatus,
          new_status: newStatus,
          performed_by: user?.id,
        } as never);

      router.refresh();
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (availableTransitions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No status changes available
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {availableTransitions.map((transition) => (
        <Button
          key={transition.next}
          onClick={() => handleStatusChange(transition.next)}
          disabled={isUpdating}
          className="w-full"
          variant={transition.next === "review" ? "default" : "outline"}
        >
          {isUpdating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            transition.icon
          )}
          {transition.label}
        </Button>
      ))}
    </div>
  );
}
