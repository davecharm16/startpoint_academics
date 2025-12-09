import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Generates a unique reference code for a project
 * Format: SA-YYYY-NNNNN (e.g., SA-2025-00001)
 */
export async function generateReferenceCode(): Promise<string> {
  const supabase = createAdminClient();
  const year = new Date().getFullYear();
  const prefix = `SA-${year}-`;

  // Get the highest reference code for this year
  const { data: dataResult } = await supabase
    .from("projects")
    .select("reference_code")
    .like("reference_code", `${prefix}%`)
    .order("reference_code", { ascending: false })
    .limit(1)
    .single();

  const data = dataResult as { reference_code: string } | null;

  let nextNumber = 1;

  if (data?.reference_code) {
    // Extract the number part from the reference code
    const match = data.reference_code.match(/SA-\d{4}-(\d{5})/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  const sequence = String(nextNumber).padStart(5, "0");
  return `${prefix}${sequence}`;
}
