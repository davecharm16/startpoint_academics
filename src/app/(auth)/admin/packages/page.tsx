import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PackageForm } from "@/components/admin/package-form";
import { PackageActions } from "@/components/admin/package-actions";
import { Package, DollarSign } from "lucide-react";

interface PackageRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  features: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default async function PackagesPage() {
  const supabase = await createClient();

  const { data: packagesData } = await supabase
    .from("packages")
    .select("*")
    .order("display_order", { ascending: true });

  const packages = (packagesData as PackageRow[] | null) || [];

  const activeCount = packages.filter((p) => p.is_active).length;
  const totalPackages = packages.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Packages</h1>
          <p className="text-muted-foreground">
            Manage service packages and pricing
          </p>
        </div>
        <PackageForm />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPackages}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Live
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Badge variant="outline">Hidden</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPackages - activeCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Package List */}
      <Card>
        <CardHeader>
          <CardTitle>All Packages</CardTitle>
        </CardHeader>
        <CardContent>
          {packages.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No packages yet</h3>
              <p className="mt-2 text-muted-foreground">
                Create your first package to get started.
              </p>
              <div className="mt-4">
                <PackageForm />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    !pkg.is_active ? "bg-muted/50 opacity-75" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        pkg.is_active
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{pkg.name}</h3>
                        <Badge
                          variant={pkg.is_active ? "secondary" : "outline"}
                          className={
                            pkg.is_active
                              ? "bg-green-100 text-green-800"
                              : ""
                          }
                        >
                          {pkg.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {pkg.description || `/${pkg.slug}`}
                      </p>
                      {pkg.features.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {pkg.features.length} feature{pkg.features.length !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(pkg.price)}</p>
                      <p className="text-xs text-muted-foreground">
                        Order: {pkg.display_order}
                      </p>
                    </div>
                    <PackageActions package={pkg} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
