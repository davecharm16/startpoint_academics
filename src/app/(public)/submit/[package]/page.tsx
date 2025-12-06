import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { IntakeForm } from "@/components/forms/intake-form";
import type { Package } from "@/types/database";

interface SubmitPageProps {
  params: Promise<{ package: string }>;
}

export async function generateMetadata({
  params,
}: SubmitPageProps): Promise<Metadata> {
  const { package: packageSlug } = await params;
  const supabase = await createClient();
  const { data: pkg } = await supabase
    .from("packages")
    .select("name")
    .eq("slug", packageSlug)
    .eq("is_active", true)
    .single();

  if (!pkg) {
    return {
      title: "Package Not Found | Startpoint Academics",
    };
  }

  const packageData = pkg as { name: string };

  return {
    title: `Submit ${packageData.name} Request | Startpoint Academics`,
    description: `Submit your ${packageData.name} project request with Startpoint Academics.`,
  };
}

export default async function SubmitPage({ params }: SubmitPageProps) {
  const { package: packageSlug } = await params;
  const supabase = await createClient();

  // Fetch package details
  const { data: packageData, error: packageError } = await supabase
    .from("packages")
    .select("*")
    .eq("slug", packageSlug)
    .eq("is_active", true)
    .single();

  if (packageError || !packageData) {
    notFound();
  }

  const pkg = packageData as Package;

  // Fetch payment settings
  const { data: paymentSettings } = await supabase
    .from("payment_settings")
    .select("*")
    .single();

  // Fetch enabled payment methods
  const { data: paymentMethods } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("is_enabled", true)
    .order("display_order", { ascending: true });

  return (
    <div className="container max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      <IntakeForm
        packageData={pkg}
        paymentSettings={paymentSettings}
        paymentMethods={paymentMethods ?? []}
      />
    </div>
  );
}
