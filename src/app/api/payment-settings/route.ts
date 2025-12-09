import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: settings, error } = await supabase
      .from("payment_settings")
      .select("*")
      .single();

    if (error) {
      console.error("Error fetching payment settings:", error);
      return NextResponse.json(
        { error: "Failed to fetch payment settings" },
        { status: 500 }
      );
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Payment settings API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
