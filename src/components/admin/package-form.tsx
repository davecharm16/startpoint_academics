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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Plus, AlertCircle } from "lucide-react";

const packageSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  features: z.string().optional(),
  is_active: z.boolean(),
  display_order: z.number().int().min(0),
});

type PackageFormData = z.infer<typeof packageSchema>;

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

interface PackageFormProps {
  package?: Package;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function PackageForm({ package: pkg, trigger, onSuccess }: PackageFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!pkg;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: pkg?.name || "",
      slug: pkg?.slug || "",
      description: pkg?.description || "",
      price: pkg?.price || 0,
      features: pkg?.features?.join("\n") || "",
      is_active: pkg?.is_active ?? true,
      display_order: pkg?.display_order || 0,
    },
  });

  const isActive = watch("is_active");

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!isEditing && name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
      setValue("slug", slug);
    }
  };

  const onSubmit = async (data: PackageFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      const featuresArray = data.features
        ? data.features.split("\n").filter((f) => f.trim())
        : [];

      const packageData = {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        price: data.price,
        features: featuresArray,
        is_active: data.is_active,
        display_order: data.display_order,
      };

      if (isEditing && pkg) {
        const { error: updateError } = await (supabase
          .from("packages") as ReturnType<typeof supabase.from>)
          .update(packageData as never)
          .eq("id", pkg.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await (supabase
          .from("packages") as ReturnType<typeof supabase.from>)
          .insert(packageData as never);

        if (insertError) throw insertError;
      }

      setIsOpen(false);
      reset();
      router.refresh();
      onSuccess?.();
    } catch (err) {
      console.error("Package save error:", err);
      setError("Failed to save package. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Package
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Package" : "New Package"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update package details. Price changes won't affect existing projects."
              : "Create a new service package."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name", { onChange: handleNameChange })}
                placeholder="e.g., Basic Essay"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                {...register("slug")}
                placeholder="e.g., basic-essay"
                disabled={isEditing}
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Brief description of this package..."
              rows={2}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Price (PHP)</Label>
              <Input
                id="price"
                type="number"
                {...register("price", { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                {...register("display_order", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea
              id="features"
              {...register("features")}
              placeholder="Professional writing&#10;Plagiarism check&#10;Free revisions"
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label>Active</Label>
              <p className="text-sm text-muted-foreground">
                Show this package on the public site
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={(checked) => setValue("is_active", checked)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Update Package"
              ) : (
                "Create Package"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
