import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentSettingsForm } from "@/components/admin/payment-settings-form";
import { PaymentMethodsManager } from "@/components/admin/payment-methods-manager";
import { Settings, CreditCard } from "lucide-react";

interface PaymentSettingsRow {
  id: string;
  downpayment_type: "percentage" | "fixed";
  downpayment_value: number;
  minimum_downpayment: number | null;
  screenshot_required: boolean;
  reference_required: boolean;
  accepted_file_types: string[];
  updated_at: string;
}

interface PaymentMethodRow {
  id: string;
  name: string;
  is_enabled: boolean;
  account_number: string | null;
  account_name: string | null;
  additional_instructions: string | null;
  display_order: number;
}

export default async function SettingsPage() {
  const supabase = await createClient();

  // Fetch payment settings (single row)
  const { data: settingsData } = await supabase
    .from("payment_settings")
    .select("*")
    .single();

  const settings = settingsData as PaymentSettingsRow | null;

  // Fetch payment methods
  const { data: methodsData } = await supabase
    .from("payment_methods")
    .select("*")
    .order("display_order", { ascending: true });

  const methods = (methodsData as PaymentMethodRow[] | null) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure payment requirements and methods
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Payment Settings
            </CardTitle>
            <CardDescription>
              Configure downpayment requirements for new submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentSettingsForm settings={settings} />
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Manage available payment options for clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentMethodsManager methods={methods} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
