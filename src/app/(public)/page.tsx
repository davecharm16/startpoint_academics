import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, MapPin, Star, ArrowRight } from "lucide-react";
import type { Package } from "@/types/database";

// Revalidate every hour for ISR
export const revalidate = 3600;

export default async function Home() {
  const supabase = await createClient();

  // Fetch active packages from database
  const { data } = await supabase
    .from("packages")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  const packages = (data ?? []) as Package[];

  // Format price in Philippine Peso
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="container py-12">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold text-primary md:text-5xl">
          Startpoint Academics
        </h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto">
          Professional academic writing services with transparent pricing and
          real-time project tracking.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Button size="lg" asChild>
            <a href="#packages">View Packages</a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#about">Learn More</a>
          </Button>
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Our Packages</h2>

        {packages.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {packages.map((pkg, index) => {
              // Parse features from JSONB
              const features = Array.isArray(pkg.features)
                ? (pkg.features as string[])
                : [];

              // Highlight the second package (index 1) as featured
              const isFeatured = index === 1;

              return (
                <Link key={pkg.id} href={`/packages/${pkg.slug}`} className="block">
                <Card
                  className={`h-full transition-shadow hover:shadow-lg cursor-pointer ${isFeatured ? "border-accent border-2" : ""}`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {pkg.name}
                      {isFeatured && (
                        <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                          Popular
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(pkg.price)}
                    </p>
                    {pkg.description && (
                      <p className="text-muted-foreground text-sm">
                        {pkg.description}
                      </p>
                    )}

                    {/* Show first 3 features */}
                    {features.length > 0 && (
                      <ul className="space-y-1 text-sm">
                        {features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {feature}
                            </span>
                          </li>
                        ))}
                        {features.length > 3 && (
                          <li className="text-muted-foreground text-xs">
                            +{features.length - 3} more features
                          </li>
                        )}
                      </ul>
                    )}

                    <Button
                      className={`w-full ${
                        isFeatured
                          ? "bg-accent text-accent-foreground hover:bg-accent/90"
                          : ""
                      }`}
                    >
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          // Fallback if no packages in database
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No packages available at the moment. Please check back later.
            </p>
          </div>
        )}
      </section>

      {/* Trust Signals / About Section */}
      <section
        id="about"
        className="py-16 bg-muted/50 -mx-4 px-4 md:-mx-8 md:px-8 rounded-lg"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Transparent Pricing</h3>
              <p className="text-muted-foreground text-sm mt-2">
                No hidden fees. See exactly what you pay for.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Real-time Tracking</h3>
              <p className="text-muted-foreground text-sm mt-2">
                Always know where your project stands.
              </p>
            </div>
            <div>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Quality Guaranteed</h3>
              <p className="text-muted-foreground text-sm mt-2">
                Original, plagiarism-free content.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-6">
          Choose a package above and submit your requirements today.
        </p>
        <Button size="lg" asChild>
          <a href="#packages">Browse Packages</a>
        </Button>
      </section>
    </div>
  );
}
