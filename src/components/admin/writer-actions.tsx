"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WriterForm } from "./writer-form";
import { MoreHorizontal, Pencil, UserX, UserCheck, Loader2, KeyRound, Copy, Check, Mail } from "lucide-react";

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
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState<{
    tempPassword: string;
    emailSent: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleResetPassword = async () => {
    setIsResetting(true);
    try {
      const response = await fetch(`/api/admin/writers/${writer.id}/reset-password`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to reset password");
      }

      const result = await response.json();
      setResetResult({
        tempPassword: result.tempPassword,
        emailSent: result.emailSent,
      });
    } catch (err) {
      console.error("Reset password error:", err);
      alert(err instanceof Error ? err.message : "Failed to reset password");
      setShowResetDialog(false);
    } finally {
      setIsResetting(false);
    }
  };

  const copyPassword = async () => {
    if (resetResult) {
      await navigator.clipboard.writeText(resetResult.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const closeResetDialog = () => {
    setShowResetDialog(false);
    setResetResult(null);
    setCopied(false);
  };

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
          <DropdownMenuItem onClick={() => setShowResetDialog(true)}>
            <KeyRound className="mr-2 h-4 w-4" />
            Reset Password
          </DropdownMenuItem>
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

      {/* Reset Password Dialog */}
      <Dialog open={showResetDialog} onOpenChange={(open) => !open && closeResetDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {resetResult ? "Password Reset Successful" : "Reset Password"}
            </DialogTitle>
            <DialogDescription>
              {resetResult
                ? `New temporary password for ${writer.full_name}`
                : `Generate a new temporary password for ${writer.full_name}. They will be required to change it on next login.`}
            </DialogDescription>
          </DialogHeader>

          {resetResult ? (
            <div className="space-y-4">
              {/* Email Status */}
              <div
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  resetResult.emailSent
                    ? "bg-green-50 text-green-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                <Mail className="h-4 w-4" />
                <span className="text-sm">
                  {resetResult.emailSent
                    ? "Password reset email sent successfully"
                    : "Email failed to send - please share password manually"}
                </span>
              </div>

              {/* Password Display */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Temporary Password</label>
                <div className="flex gap-2">
                  <Input
                    value={resetResult.tempPassword}
                    readOnly
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyPassword}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Save this password - it will not be shown again
                </p>
              </div>

              <DialogFooter>
                <Button onClick={closeResetDialog}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <DialogFooter>
              <Button variant="outline" onClick={closeResetDialog} disabled={isResetting}>
                Cancel
              </Button>
              <Button onClick={handleResetPassword} disabled={isResetting}>
                {isResetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <KeyRound className="mr-2 h-4 w-4" />
                    Reset Password
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
