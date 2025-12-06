import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { ProjectTable } from "@/components/admin/project-table";
import { ProjectFilters } from "@/components/admin/project-filters";

interface ProjectRow {
  id: string;
  reference_code: string;
  client_name: string;
  topic: string;
  status: string;
  deadline: string;
  agreed_price: number;
  packages: { name: string } | null;
  profiles: { full_name: string } | null;
}

interface Writer {
  id: string;
  full_name: string;
}

interface Package {
  id: string;
  name: string;
}

interface ProjectsPageProps {
  searchParams: Promise<{
    status?: string;
    writer?: string;
    package?: string;
  }>;
}

async function ProjectsContent({
  searchParams,
}: {
  searchParams: {
    status?: string;
    writer?: string;
    package?: string;
  };
}) {
  const supabase = await createClient();

  // Build query with filters
  let query = supabase
    .from("projects")
    .select(`
      id,
      reference_code,
      client_name,
      topic,
      status,
      deadline,
      agreed_price,
      packages!projects_package_id_fkey (name),
      profiles!projects_writer_id_fkey (full_name)
    `)
    .order("created_at", { ascending: false });

  // Apply filters
  if (searchParams.status) {
    query = query.eq("status", searchParams.status);
  }

  if (searchParams.writer) {
    if (searchParams.writer === "unassigned") {
      query = query.is("writer_id", null);
    } else {
      query = query.eq("writer_id", searchParams.writer);
    }
  }

  if (searchParams.package) {
    query = query.eq("package_id", searchParams.package);
  }

  const { data: projectsData } = await query;

  const projects = projectsData as ProjectRow[] | null;

  // Transform data
  const transformedProjects =
    projects?.map((p) => ({
      id: p.id,
      reference_code: p.reference_code,
      client_name: p.client_name,
      topic: p.topic,
      status: p.status,
      deadline: p.deadline,
      agreed_price: p.agreed_price,
      package_name: p.packages?.name,
      writer_name: p.profiles?.full_name,
    })) || [];

  return <ProjectTable projects={transformedProjects} />;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Get writers for filter
  const { data: writersData } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("role", "writer")
    .eq("is_active", true)
    .order("full_name");

  const writers = writersData as Writer[] | null;

  // Get packages for filter
  const { data: packagesData } = await supabase
    .from("packages")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  const packages = packagesData as Package[] | null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground">
          View and manage all projects
        </p>
      </div>

      <Suspense fallback={<div>Loading filters...</div>}>
        <ProjectFilters
          writers={writers || []}
          packages={packages || []}
        />
      </Suspense>

      <Suspense fallback={<div>Loading projects...</div>}>
        <ProjectsContent searchParams={params} />
      </Suspense>
    </div>
  );
}
