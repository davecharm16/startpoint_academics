import { createRouteClient } from "@/lib/supabase/route";

/**
 * Generates a unique reference code for a project
 * Format: SA-YYYY-NNNNN (e.g., SA-2025-00001)
 */
export async function generateReferenceCode(): Promise<string> {
  const supabase = createRouteClient();
  const year = new Date().getFullYear();

  // Get count of projects this year
  const { count } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .gte("created_at", `${year}-01-01`);

  const sequence = String((count ?? 0) + 1).padStart(5, "0");
  return `SA-${year}-${sequence}`;
}
