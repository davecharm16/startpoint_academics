import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

export default async function AdminLayout({
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const profileData = profile as { full_name: string; role: string } | null;

  if (!profileData || profileData.role !== "admin") {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar userName={profileData.full_name} />
      <main className="lg:pl-64">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
