import { createClient } from "@startpoint/supabase/server";
import { ProjectCard, type ClientProject } from "@/components/client/project-card";
import { ProjectsEmptyState } from "@/components/client/projects-empty-state";

interface ProjectRow {
  id: string;
  reference_code: string;
  topic: string;
  status: string;
  deadline: string;
  tracking_token: string;
  created_at: string;
  packages: { name: string } | null;
}

export default async function ClientProjectsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch projects where client_user_id matches OR client_email matches
  // This covers projects submitted before and after registration
  const { data: projectsData } = await supabase
    .from("projects")
    .select(`
      id,
      reference_code,
      topic,
      status,
      deadline,
      tracking_token,
      created_at,
      packages!projects_package_id_fkey (name)
    `)
    .or(`client_email.eq.${user.email},client_user_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const projects: ClientProject[] =
    (projectsData as ProjectRow[] | null)?.map((p) => ({
      id: p.id,
      reference_code: p.reference_code,
      topic: p.topic,
      status: p.status,
      deadline: p.deadline,
      tracking_token: p.tracking_token,
      created_at: p.created_at,
      package_name: p.packages?.name || null,
    })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Projects</h1>
        <p className="text-muted-foreground">
          View and track all your submitted projects
        </p>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <ProjectsEmptyState />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
