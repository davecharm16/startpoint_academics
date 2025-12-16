import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createClient as createBuildClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import type { Package, Database } from "@/types/database";

interface PackagePageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all active packages (build-time, no cookies)
export async function generateStaticParams() {
  // Use direct client for build-time static generation
  const supabase = createBuildClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
  );

  const { data: packages } = await supabase
    .from("packages")
    .select("slug")
    .eq("is_active", true);

  if (!packages) return [];

  return packages.map((pkg: { slug: string }) => ({ slug: pkg.slug }));
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: PackagePageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: pkg } = await supabase
    .from("packages")
    .select("name, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!pkg) {
    return {
      title: "Package Not Found | Startpoint Academics",
      description: "The requested package could not be found.",
    };
  }

  const packageData = pkg as { name: string; description: string | null };

  return {
    title: `${packageData.name} | Startpoint Academics`,
    description:
      packageData.description ?? "Professional academic writing services",
    openGraph: {
      title: `${packageData.name} | Startpoint Academics`,
      description:
        packageData.description ?? "Professional academic writing services",
      type: "website",
    },
  };
}

export default async function PackageDetailPage({ params }: PackagePageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    notFound();
  }

  const pkg = data as Package;

  // Parse features from JSONB
  const features = Array.isArray(pkg.features)
    ? (pkg.features as string[])
    : [];

  // Format price in Philippine Peso
  const formattedPrice = new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pkg.price);

  return (
    <div className="container py-12">
      {/* Back Navigation */}
      <Link
        href="/#packages"
        className="inline-flex items-center text-muted-foreground hover:text-primary mb-8 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Packages
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-primary">{pkg.name}</h1>
            {pkg.description && (
              <p className="mt-4 text-xl text-muted-foreground">
                {pkg.description}
              </p>
            )}
          </div>

          {/* Features Section */}
          {features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>What&apos;s Included</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm flex-shrink-0">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Submit Your Requirements</p>
                    <p className="text-sm text-muted-foreground">
                      Fill out the intake form with your project details and
                      deadline.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm flex-shrink-0">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Confirm Payment</p>
                    <p className="text-sm text-muted-foreground">
                      Make the downpayment and upload your proof of payment.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm flex-shrink-0">
                    3
                  </span>
                  <div>
                    <p className="font-medium">Track Progress</p>
                    <p className="text-sm text-muted-foreground">
                      Use your tracking code to monitor your project in
                      real-time.
                    </p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm flex-shrink-0">
                    4
                  </span>
                  <div>
                    <p className="font-medium">Receive Your Work</p>
                    <p className="text-sm text-muted-foreground">
                      Get your completed project delivered on time.
                    </p>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Pricing Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8 border-2 border-accent">
            <CardHeader className="text-center pb-2">
              <p className="text-sm text-muted-foreground">Starting at</p>
              <CardTitle className="text-4xl font-bold text-primary">
                {formattedPrice}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                asChild
              >
                <Link href={`/submit/${pkg.slug}`}>
                  Get Started
                </Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                No hidden fees. Transparent pricing.
              </p>
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Original, plagiarism-free content</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Free revisions included</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>Real-time progress tracking</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
