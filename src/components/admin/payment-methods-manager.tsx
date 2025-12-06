"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, GripVertical } from "lucide-react";

const methodSchema = z.object({
  name: z.string().min(2, "Name is required"),
  account_number: z.string().optional(),
  account_name: z.string().optional(),
  additional_instructions: z.string().optional(),
  is_enabled: z.boolean(),
  display_order: z.number().int().min(0),
});

type MethodFormData = z.infer<typeof methodSchema>;

interface PaymentMethod {
  id: string;
  name: string;
  is_enabled: boolean;
  account_number: string | null;
  account_name: string | null;
  additional_instructions: string | null;
  display_order: number;
}

interface PaymentMethodsManagerProps {
  methods: PaymentMethod[];
}

export function PaymentMethodsManager({ methods }: PaymentMethodsManagerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MethodFormData>({
    resolver: zodResolver(methodSchema),
    defaultValues: {
      name: "",
      account_number: "",
      account_name: "",
      additional_instructions: "",
      is_enabled: true,
      display_order: methods.length,
    },
  });

  const isEnabled = watch("is_enabled");

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setEditingMethod(null);
      reset({
        name: "",
        account_number: "",
        account_name: "",
        additional_instructions: "",
        is_enabled: true,
        display_order: methods.length,
      });
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    reset({
      name: method.name,
      account_number: method.account_number || "",
      account_name: method.account_name || "",
      additional_instructions: method.additional_instructions || "",
      is_enabled: method.is_enabled,
      display_order: method.display_order,
    });
    setIsOpen(true);
  };

  const onSubmit = async (data: MethodFormData) => {
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const methodData = {
        name: data.name,
        account_number: data.account_number || null,
        account_name: data.account_name || null,
        additional_instructions: data.additional_instructions || null,
        is_enabled: data.is_enabled,
        display_order: data.display_order,
      };

      if (editingMethod) {
        const { error } = await (supabase
          .from("payment_methods") as ReturnType<typeof supabase.from>)
          .update({ ...methodData, updated_at: new Date().toISOString() } as never)
          .eq("id", editingMethod.id);

        if (error) throw error;
      } else {
        const { error } = await (supabase
          .from("payment_methods") as ReturnType<typeof supabase.from>)
          .insert(methodData as never);

        if (error) throw error;
      }

      handleOpenChange(false);
      router.refresh();
    } catch (err) {
      console.error("Payment method save error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (method: PaymentMethod) => {
    try {
      const supabase = createClient();
      const { error } = await (supabase
        .from("payment_methods") as ReturnType<typeof supabase.from>)
        .update({ is_enabled: !method.is_enabled } as never)
        .eq("id", method.id);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Toggle error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error } = await (supabase
        .from("payment_methods") as ReturnType<typeof supabase.from>)
        .delete()
        .eq("id", id);

      if (error) throw error;
      router.refresh();
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {methods.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            No payment methods configured yet
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {methods.map((method) => (
            <div
              key={method.id}
              className={`flex items-center justify-between p-3 border rounded-lg ${
                !method.is_enabled ? "bg-muted/50 opacity-75" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{method.name}</p>
                    {!method.is_enabled && (
                      <Badge variant="outline" className="text-xs">
                        Disabled
                      </Badge>
                    )}
                  </div>
                  {method.account_name && (
                    <p className="text-sm text-muted-foreground">
                      {method.account_name}
                      {method.account_number && ` - ${method.account_number}`}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={method.is_enabled}
                  onCheckedChange={() => handleToggle(method)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(method)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(method.id)}
                  disabled={deletingId === method.id}
                >
                  {deletingId === method.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? "Edit Payment Method" : "Add Payment Method"}
            </DialogTitle>
            <DialogDescription>
              {editingMethod
                ? "Update the payment method details"
                : "Add a new payment option for clients"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Method Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="e.g., GCash, BPI, Maya"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_name">Account Name</Label>
              <Input
                id="account_name"
                {...register("account_name")}
                placeholder="Account holder name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                {...register("account_number")}
                placeholder="Account/mobile number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_instructions">
                Additional Instructions
              </Label>
              <Textarea
                id="additional_instructions"
                {...register("additional_instructions")}
                placeholder="Any special instructions for this payment method"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                {...register("display_order", { valueAsNumber: true })}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Enabled</Label>
                <p className="text-sm text-muted-foreground">
                  Show this method to clients
                </p>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={(checked) => setValue("is_enabled", checked)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
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
                ) : editingMethod ? (
                  "Update Method"
                ) : (
                  "Add Method"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
