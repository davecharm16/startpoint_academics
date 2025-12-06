"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Check } from "lucide-react";

interface Writer {
  id: string;
  full_name: string;
  email: string;
  current_projects: number;
  max_concurrent_projects: number;
}

interface WriterAssignmentDialogProps {
  projectId: string;
  projectReference: string;
  currentWriterId?: string;
  writers: Writer[];
  trigger?: React.ReactNode;
}

export function WriterAssignmentDialog({
  projectId,
  projectReference,
  currentWriterId,
  writers,
  trigger,
}: WriterAssignmentDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWriterId, setSelectedWriterId] = useState<string | null>(
    currentWriterId || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssign = async () => {
    if (!selectedWriterId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      // Update project with writer assignment
      const { error: updateError } = await (supabase
        .from("projects") as ReturnType<typeof supabase.from>)
        .update({
          writer_id: selectedWriterId,
          status: "assigned",
          assigned_at: new Date().toISOString(),
        } as never)
        .eq("id", projectId);

      if (updateError) throw updateError;

      // Create history entry
      await (supabase
        .from("project_history") as ReturnType<typeof supabase.from>)
        .insert({
          project_id: projectId,
          action: "assigned",
          new_status: "assigned",
          notes: `Writer assigned`,
        } as never);

      // Send email notifications (non-blocking)
      fetch("/api/notifications/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          writerId: selectedWriterId,
        }),
      }).catch(console.error);

      setIsOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Assignment error:", err);
      setError("Failed to assign writer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || <Button size="sm">Assign Writer</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Writer</DialogTitle>
          <DialogDescription>
            Select a writer for project {projectReference}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            {writers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active writers available.
              </p>
            ) : (
              writers.map((writer) => {
                const isAvailable =
                  writer.current_projects < writer.max_concurrent_projects;
                const isSelected = selectedWriterId === writer.id;
                const isCurrent = currentWriterId === writer.id;

                return (
                  <button
                    key={writer.id}
                    type="button"
                    onClick={() => setSelectedWriterId(writer.id)}
                    disabled={!isAvailable && !isCurrent}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : isAvailable || isCurrent
                        ? "border-border hover:border-primary/50"
                        : "border-border bg-muted/50 opacity-60"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {isSelected ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{writer.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {writer.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={isAvailable ? "secondary" : "outline"}
                        className={
                          isAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }
                      >
                        {writer.current_projects}/{writer.max_concurrent_projects}
                      </Badge>
                      {isCurrent && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Current
                        </p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedWriterId || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : currentWriterId ? (
                "Reassign"
              ) : (
                "Assign Writer"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
