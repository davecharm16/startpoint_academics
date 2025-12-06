"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { WriterForm } from "./writer-form";
import { MoreHorizontal, Pencil, UserX, UserCheck, Loader2 } from "lucide-react";

interface Writer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  max_concurrent_projects: number;
  current_projects: number;
}

interface WriterActionsProps {
  writer: Writer;
}

export function WriterActions({ writer }: WriterActionsProps) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  const handleToggleActive = async () => {
    // If deactivating and has projects, show warning
    if (writer.is_active && writer.current_projects > 0) {
      setShowDeactivateDialog(true);
      return;
    }

    await toggleActive();
  };

  const toggleActive = async () => {
    setIsToggling(true);
    try {
      const supabase = createClient();
      const { error } = await (supabase
        .from("profiles") as ReturnType<typeof supabase.from>)
        .update({ is_active: !writer.is_active } as never)
        .eq("id", writer.id);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      setIsToggling(false);
      setShowDeactivateDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <WriterForm
            writer={writer}
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>
            }
          />
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleToggleActive} disabled={isToggling}>
            {isToggling ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : writer.is_active ? (
              <UserX className="mr-2 h-4 w-4" />
            ) : (
              <UserCheck className="mr-2 h-4 w-4" />
            )}
            {writer.is_active ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Writer</AlertDialogTitle>
            <AlertDialogDescription>
              {writer.full_name} currently has {writer.current_projects} active project
              {writer.current_projects !== 1 ? "s" : ""}. Deactivating will prevent new
              assignments but existing projects will remain assigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isToggling}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={toggleActive} disabled={isToggling}>
              {isToggling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                "Deactivate Anyway"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
