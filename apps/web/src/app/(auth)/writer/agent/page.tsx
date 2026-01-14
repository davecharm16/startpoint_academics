import { redirect } from "next/navigation";
import { createClient } from "@startpoint/supabase/server";
import { AgentWorkspace } from "@/components/agent/agent-workspace";

interface Project {
  id: string;
  reference_code: string;
  topic: string;
  status: string;
  requirements: string;
  deadline: string;
}

export default async function WriterAgentPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  // Get writer's assigned projects (with workable statuses)
  const { data: projects, error: projectsError } = await supabase
    .from("projects")
    .select("id, reference_code, topic, status, requirements, deadline")
    .eq("writer_id", user.id)
    .in("status", ["assigned", "in_progress", "review", "revision"])
    .order("deadline", { ascending: true });

  if (projectsError) {
    console.error("Error fetching projects:", projectsError);
  }

  return (
    <AgentWorkspace projects={(projects as Project[]) || []} />
  );
}
