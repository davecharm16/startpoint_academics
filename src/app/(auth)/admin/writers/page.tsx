import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WriterForm } from "@/components/admin/writer-form";
import { WriterActions } from "@/components/admin/writer-actions";
import { Users, UserCheck, UserX, Briefcase } from "lucide-react";

interface WriterRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  max_concurrent_projects: number;
  created_at: string;
}

export default async function WritersPage() {
  const supabase = await createClient();

  // Fetch writers
  const { data: writersData } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, is_active, max_concurrent_projects, created_at")
    .eq("role", "writer")
    .order("full_name");

  const writersRaw = (writersData as WriterRow[] | null) || [];

  // Get current project counts for writers
  const writerIds = writersRaw.map((w) => w.id);
  const { data: projectCounts } = await supabase
    .from("projects")
    .select("writer_id")
    .in("writer_id", writerIds)
    .in("status", ["assigned", "in_progress", "review"]);

  const countByWriter = (projectCounts || []).reduce(
    (acc: Record<string, number>, p: { writer_id: string }) => {
      acc[p.writer_id] = (acc[p.writer_id] || 0) + 1;
      return acc;
    },
    {}
  );

  const writers = writersRaw.map((w) => ({
    ...w,
    current_projects: countByWriter[w.id] || 0,
  }));

  const activeCount = writers.filter((w) => w.is_active).length;
  const totalProjects = writers.reduce((sum, w) => sum + w.current_projects, 0);
  const availableWriters = writers.filter(
    (w) => w.is_active && w.current_projects < w.max_concurrent_projects
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Writers</h1>
          <p className="text-muted-foreground">
            Manage your writer team and workload
          </p>
        </div>
        <WriterForm />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Writers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{writers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <UserX className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableWriters}</div>
            <p className="text-xs text-muted-foreground">Below max capacity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
          </CardContent>
        </Card>
      </div>

      {/* Writers List */}
      <Card>
        <CardHeader>
          <CardTitle>Writer Roster</CardTitle>
        </CardHeader>
        <CardContent>
          {writers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No writers yet</h3>
              <p className="mt-2 text-muted-foreground">
                Add your first writer to get started.
              </p>
              <div className="mt-4">
                <WriterForm />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {writers.map((writer) => {
                const isAvailable =
                  writer.is_active &&
                  writer.current_projects < writer.max_concurrent_projects;
                const utilizationPercent =
                  (writer.current_projects / writer.max_concurrent_projects) * 100;

                return (
                  <div
                    key={writer.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      !writer.is_active ? "bg-muted/50 opacity-75" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          isAvailable
                            ? "bg-green-100 text-green-700"
                            : writer.is_active
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {writer.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{writer.full_name}</h3>
                          {!writer.is_active && (
                            <Badge variant="outline" className="text-xs">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {writer.email}
                        </p>
                        {writer.phone && (
                          <p className="text-sm text-muted-foreground">
                            {writer.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={
                              isAvailable
                                ? "bg-green-100 text-green-800"
                                : writer.is_active
                                ? "bg-yellow-100 text-yellow-800"
                                : ""
                            }
                          >
                            {writer.current_projects}/{writer.max_concurrent_projects}
                          </Badge>
                        </div>
                        <div className="mt-1 w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              utilizationPercent >= 100
                                ? "bg-red-500"
                                : utilizationPercent >= 75
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                          />
                        </div>
                      </div>
                      <WriterActions writer={writer} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
