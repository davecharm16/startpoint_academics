import { redirect } from "next/navigation";
import { createClient } from "@startpoint/supabase/server";
import { ClientNav } from "@/components/layout/client-nav";

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
  referral_code: string | null;
}

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, referral_code")
    .eq("id", user.id)
    .single();

  const profile = profileData as ProfileRow | null;

  if (!profile || profile.role !== "client") {
    // Redirect non-client roles to their respective dashboards
    if (profile?.role === "admin") {
      redirect("/admin");
    }
    if (profile?.role === "writer") {
      redirect("/writer");
    }
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <ClientNav
        user={{
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          referral_code: profile.referral_code || undefined,
        }}
      />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
