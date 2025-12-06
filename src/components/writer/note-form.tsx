"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

interface WriterNoteFormProps {
  projectId: string;
}

export function WriterNoteForm({ projectId }: WriterNoteFormProps) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!note.trim()) return;

    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // Create history entry with note
      const { error } = await (supabase
        .from("project_history") as ReturnType<typeof supabase.from>)
        .insert({
          project_id: projectId,
          action: "note",
          notes: note.trim(),
          performed_by: user?.id,
        } as never);

      if (error) throw error;

      // Update project last_activity_at
      await (supabase
        .from("projects") as ReturnType<typeof supabase.from>)
        .update({ last_activity_at: new Date().toISOString() } as never)
        .eq("id", projectId);

      setNote("");
      router.refresh();
    } catch (err) {
      console.error("Note submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note or update for this project..."
        rows={3}
      />
      <Button
        onClick={handleSubmit}
        disabled={!note.trim() || isSubmitting}
        size="sm"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Add Note
          </>
        )}
      </Button>
    </div>
  );
}
