"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Plus,
  AlertCircle,
  UserPlus,
  Check,
  Copy,
  Mail,
  MailX,
} from "lucide-react";

const writerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  max_concurrent_projects: z.number().int().min(1).max(10),
  is_active: z.boolean(),
});

type WriterFormData = z.infer<typeof writerSchema>;

interface Writer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  max_concurrent_projects: number;
}

interface CreateWriterResult {
  success: boolean;
  writer: {
    id: string;
    email: string;
    full_name: string;
  };
  tempPassword: string;
  emailSent: boolean;
}

interface WriterFormProps {
  writer?: Writer;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function WriterForm({ writer, trigger, onSuccess }: WriterFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createResult, setCreateResult] = useState<CreateWriterResult | null>(null);
  const [copied, setCopied] = useState(false);

  const isEditing = !!writer;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<WriterFormData>({
    resolver: zodResolver(writerSchema),
    defaultValues: {
      full_name: writer?.full_name || "",
      email: writer?.email || "",
      phone: writer?.phone || "",
      max_concurrent_projects: writer?.max_concurrent_projects || 3,
      is_active: writer?.is_active ?? true,
    },
  });

  const isActive = watch("is_active");

  const copyPassword = () => {
    if (createResult?.tempPassword) {
      navigator.clipboard.writeText(createResult.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setCreateResult(null);
    setError(null);
    setCopied(false);
    reset();
  };

  const onSubmit = async (data: WriterFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      if (isEditing && writer) {
        // Update existing writer profile
        const { error: updateError } = await (supabase
          .from("profiles") as ReturnType<typeof supabase.from>)
          .update({
            full_name: data.full_name,
            phone: data.phone || null,
            max_concurrent_projects: data.max_concurrent_projects,
            is_active: data.is_active,
          } as never)
          .eq("id", writer.id);

        if (updateError) throw updateError;

        handleClose();
        router.refresh();
        onSuccess?.();
      } else {
        // Create new writer via API route
        const response = await fetch("/api/admin/writers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.email,
            full_name: data.full_name,
            phone: data.phone || null,
            max_concurrent_projects: data.max_concurrent_projects,
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to create writer");
        }

        // Show success state with password
        setCreateResult(result);
        router.refresh();
        onSuccess?.();
      }
    } catch (err) {
      console.error("Writer save error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to save writer. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose();
      else setIsOpen(true);
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add Writer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {createResult ? (
          // Success state - show password
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                Writer Account Created
              </DialogTitle>
              <DialogDescription>
                {createResult.writer.full_name} has been added to your team.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Email Status */}
              <div className={`flex items-center gap-2 rounded-lg p-3 ${
                createResult.emailSent
                  ? "bg-green-50 text-green-700"
                  : "bg-yellow-50 text-yellow-700"
              }`}>
                {createResult.emailSent ? (
                  <>
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">Welcome email sent to {createResult.writer.email}</span>
                  </>
                ) : (
                  <>
                    <MailX className="h-4 w-4" />
                    <span className="text-sm">Email could not be sent - share password manually</span>
                  </>
                )}
              </div>

              {/* Temporary Password */}
              <div className="space-y-2">
                <Label>Temporary Password</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={createResult.tempPassword}
                    className="font-mono text-base tracking-wider"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={copyPassword}
                    title="Copy password"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Save this password now. It will not be shown again.
                </p>
              </div>

              {/* Security Note */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The writer will be required to change their password on first login.
                </AlertDescription>
              </Alert>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleClose}>Done</Button>
            </div>
          </>
        ) : (
          // Form state
          <>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Writer" : "Add Writer"}</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? "Update writer profile information"
                  : "Create a new writer account. They will receive an email with their login credentials."}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  {...register("full_name")}
                  placeholder="e.g., Juan Dela Cruz"
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="writer@example.com"
                  disabled={isEditing}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
                {!isEditing && (
                  <p className="text-xs text-muted-foreground">
                    Writer will use this email to log in
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="e.g., 09171234567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_concurrent_projects">Max Concurrent Projects</Label>
                <Input
                  id="max_concurrent_projects"
                  type="number"
                  {...register("max_concurrent_projects", { valueAsNumber: true })}
                  min={1}
                  max={10}
                />
                {errors.max_concurrent_projects && (
                  <p className="text-sm text-destructive">
                    {errors.max_concurrent_projects.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Maximum number of projects this writer can handle at once
                </p>
              </div>

              {isEditing && (
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <Label>Active Status</Label>
                    <p className="text-sm text-muted-foreground">
                      Inactive writers cannot be assigned new projects
                    </p>
                  </div>
                  <Switch
                    checked={isActive}
                    onCheckedChange={(checked) => setValue("is_active", checked)}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Saving..." : "Creating..."}
                    </>
                  ) : isEditing ? (
                    "Save Changes"
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Writer
                    </>
                  )}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
