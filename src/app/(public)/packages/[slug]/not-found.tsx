import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function PackageNotFound() {
  return (
    <div className="container py-24 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
      <h1 className="text-3xl font-bold text-primary mb-4">Package Not Found</h1>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        The package you&apos;re looking for doesn&apos;t exist or may have been
        removed. Please check our available packages below.
      </p>
      <Button asChild>
        <Link href="/#packages">View All Packages</Link>
      </Button>
    </div>
  );
}
