"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";

interface PriceAdjustmentsProps {
  projectId: string;
  agreedPrice: number;
  discountAmount: number;
  additionalCharges: number;
  writerShare: number;
  adminShare: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function PriceAdjustments({
  projectId,
  agreedPrice,
  discountAmount,
  additionalCharges,
}: PriceAdjustmentsProps) {
  const router = useRouter();
  const [discount, setDiscount] = useState(discountAmount);
  const [charges, setCharges] = useState(additionalCharges);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate updated values
  const netAmount = agreedPrice - discount + charges;
  const newWriterShare = Math.round(netAmount * 0.6);
  const newAdminShare = netAmount - newWriterShare;

  const hasChanges = discount !== discountAmount || charges !== additionalCharges;

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const supabase = createClient();

      const { error } = await (supabase
        .from("projects") as ReturnType<typeof supabase.from>)
        .update({
          discount_amount: discount,
          additional_charges: charges,
          writer_share: newWriterShare,
          admin_share: newAdminShare,
        } as never)
        .eq("id", projectId);

      if (error) throw error;

      // Create audit log
      const { data: { user } } = await supabase.auth.getUser();

      const notes = [];
      if (discount !== discountAmount) {
        notes.push(
          `Discount: ${formatCurrency(discountAmount)} → ${formatCurrency(discount)}`
        );
      }
      if (charges !== additionalCharges) {
        notes.push(
          `Additional charges: ${formatCurrency(additionalCharges)} → ${formatCurrency(charges)}`
        );
      }

      await (supabase
        .from("project_history") as ReturnType<typeof supabase.from>)
        .insert({
          project_id: projectId,
          action: "price_adjustment",
          notes: notes.join("; "),
          performed_by: user?.id,
        } as never);

      router.refresh();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="discount">Discount (PHP)</Label>
          <Input
            id="discount"
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value) || 0)}
            min={0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="charges">Additional Charges (PHP)</Label>
          <Input
            id="charges"
            type="number"
            value={charges}
            onChange={(e) => setCharges(Number(e.target.value) || 0)}
            min={0}
          />
        </div>
      </div>

      {/* Preview */}
      <div className="p-3 bg-muted/50 rounded-md text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Agreed Price</span>
          <span>{formatCurrency(agreedPrice)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        {charges > 0 && (
          <div className="flex justify-between text-orange-600">
            <span>Additional</span>
            <span>+{formatCurrency(charges)}</span>
          </div>
        )}
        <div className="flex justify-between font-medium pt-2 border-t">
          <span>Net Amount</span>
          <span>{formatCurrency(netAmount)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Writer (60%)</span>
          <span>{formatCurrency(newWriterShare)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Admin (40%)</span>
          <span>{formatCurrency(newAdminShare)}</span>
        </div>
      </div>

      {hasChanges && (
        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Adjustments
            </>
          )}
        </Button>
      )}
    </div>
  );
}
