import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WriterNav } from "@/components/layout/writer-nav";

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export default async function WriterLayout({
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
    .select("id, full_name, email, role")
    .eq("id", user.id)
    .single();

  const profile = profileData as ProfileRow | null;

  if (!profile || profile.role !== "writer") {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <WriterNav user={profile} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
