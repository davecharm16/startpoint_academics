"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Calendar } from "lucide-react";

interface EstimatedCompletionFormProps {
  projectId: string;
  currentDate: string | null;
  deadline: string;
}

export function EstimatedCompletionForm({
  projectId,
  currentDate,
  deadline,
}: EstimatedCompletionFormProps) {
  const router = useRouter();
  const [date, setDate] = useState(
    currentDate ? format(new Date(currentDate), "yyyy-MM-dd") : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!date) return;

    const selectedDate = new Date(date);
    const deadlineDate = new Date(deadline);

    // Validate date is before deadline
    if (selectedDate > deadlineDate) {
      setError("Estimated completion must be before the deadline");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      const { error: updateError } = await (supabase
        .from("projects") as ReturnType<typeof supabase.from>)
        .update({
          estimated_completion_at: selectedDate.toISOString(),
        } as never)
        .eq("id", projectId);

      if (updateError) throw updateError;

      // Create history entry
      const { data: { user } } = await supabase.auth.getUser();

      await (supabase
        .from("project_history") as ReturnType<typeof supabase.from>)
        .insert({
          project_id: projectId,
          action: "estimated_completion_set",
          notes: `Estimated completion set to ${format(selectedDate, "MMMM d, yyyy")}`,
          performed_by: user?.id,
        } as never);

      router.refresh();
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update estimated completion date");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      {currentDate && (
        <p className="text-sm text-muted-foreground">
          Current: {format(new Date(currentDate), "MMMM d, yyyy")}
        </p>
      )}
      <div className="flex gap-2">
        <Input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value);
            setError(null);
          }}
          max={format(new Date(deadline), "yyyy-MM-dd")}
        />
        <Button
          onClick={handleSubmit}
          disabled={!date || isSubmitting}
          size="icon"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Calendar className="h-4 w-4" />
          )}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Deadline: {format(new Date(deadline), "MMM d, yyyy")}
      </p>
    </div>
  );
}
