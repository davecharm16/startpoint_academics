import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: methods, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("is_enabled", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error fetching payment methods:", error);
      return NextResponse.json(
        { error: "Failed to fetch payment methods" },
        { status: 500 }
      );
    }

    return NextResponse.json(methods);
  } catch (error) {
    console.error("Payment methods API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
