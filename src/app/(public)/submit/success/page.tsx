import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";

interface SuccessPageProps {
  searchParams: Promise<{
    ref?: string;
    token?: string;
  }>;
}

function SuccessContent({
  referenceCode,
  trackingToken,
}: {
  referenceCode: string;
  trackingToken: string;
}) {
  const trackingUrl = `/track/${trackingToken}`;

  return (
    <div className="container max-w-2xl py-12">
      <Card className="text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Submission Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Your project request has been submitted. We&apos;ll review your
            payment and get started right away.
          </p>

          {/* Reference Code */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Your Reference Code
            </p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-2xl font-bold text-primary">
                {referenceCode}
              </code>
              <CopyButton value={referenceCode} label="Copy reference code" />
            </div>
            <p className="text-xs text-muted-foreground">
              Save this code for your records
            </p>
          </div>

          {/* Tracking Link */}
          <div className="bg-primary/5 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Track Your Project
            </p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-sm text-primary break-all">
                {trackingUrl}
              </code>
              <CopyButton value={trackingUrl} label="Copy tracking link" />
            </div>
            <Button asChild className="mt-2">
              <Link href={trackingUrl}>
                Open Tracking Page
              </Link>
            </Button>
          </div>

          {/* Next Steps */}
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-semibold">What Happens Next?</h3>
            <ol className="text-left space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  1
                </span>
                <span>
                  Our team will review and validate your payment (usually within
                  a few hours)
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  2
                </span>
                <span>
                  Once validated, we&apos;ll assign a writer to your project
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  3
                </span>
                <span>
                  Track progress anytime using your tracking link above
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  4
                </span>
                <span>
                  Receive your completed work before the deadline
                </span>
              </li>
            </ol>
          </div>

          {/* Email Notice */}
          <div className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-4">
            A confirmation email has been sent to your email address with these
            details.
          </div>

          {/* Back to Home */}
          <Button variant="outline" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { ref, token } = await searchParams;

  if (!ref || !token) {
    return (
      <div className="container max-w-2xl py-12 text-center">
        <Card>
          <CardContent className="py-12">
            <p className="text-muted-foreground">
              Invalid submission. Please try submitting your request again.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/#packages">View Packages</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent referenceCode={ref} trackingToken={token} />
    </Suspense>
  );
}
