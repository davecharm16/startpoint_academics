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
import { PackageForm } from "./package-form";
import { MoreHorizontal, Pencil, Eye, EyeOff, Trash2, Loader2 } from "lucide-react";

interface Package {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  features: string[];
  is_active: boolean;
  display_order: number;
}

interface PackageActionsProps {
  package: Package;
}

export function PackageActions({ package: pkg }: PackageActionsProps) {
  const router = useRouter();
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleToggleActive = async () => {
    setIsToggling(true);
    try {
      const supabase = createClient();
      const { error } = await (supabase
        .from("packages") as ReturnType<typeof supabase.from>)
        .update({ is_active: !pkg.is_active } as never)
        .eq("id", pkg.id);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Toggle error:", err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const supabase = createClient();
      const { error } = await (supabase
        .from("packages") as ReturnType<typeof supabase.from>)
        .delete()
        .eq("id", pkg.id);

      if (error) throw error;
      setShowDeleteDialog(false);
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setIsDeleting(false);
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
          <PackageForm
            package={pkg}
            trigger={
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            }
          />
          <DropdownMenuItem onClick={handleToggleActive} disabled={isToggling}>
            {isToggling ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : pkg.is_active ? (
              <EyeOff className="mr-2 h-4 w-4" />
            ) : (
              <Eye className="mr-2 h-4 w-4" />
            )}
            {pkg.is_active ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Package</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{pkg.name}&rdquo;? This action cannot be
              undone. Projects using this package will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
