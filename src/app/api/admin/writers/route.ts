import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is admin
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const profile = profileData as { role: string } | null;

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { email, full_name, phone, max_concurrent_projects } = body;

    if (!email || !full_name) {
      return NextResponse.json(
        { error: "Email and full name are required" },
        { status: 400 }
      );
    }

    // Use admin client to create user
    const adminClient = createAdminClient();

    // Generate a random temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + "A1!";

    // Create user in auth
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name,
        },
      });

    if (authError) {
      console.error("Auth creation error:", authError);
      if (authError.message.includes("already been registered")) {
        return NextResponse.json(
          { error: "A user with this email already exists" },
          { status: 400 }
        );
      }
      throw authError;
    }

    if (!authData.user) {
      throw new Error("User creation failed");
    }

    // Create profile with writer role
    const { error: profileError } = await (adminClient
      .from("profiles") as ReturnType<typeof adminClient.from>)
      .insert({
        id: authData.user.id,
        email,
        full_name,
        phone: phone || null,
        role: "writer",
        max_concurrent_projects: max_concurrent_projects || 3,
        is_active: true,
      } as never);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // Try to clean up the auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    // Send password reset email so writer can set their own password
    await adminClient.auth.admin.generateLink({
      type: "recovery",
      email,
    });

    return NextResponse.json({
      success: true,
      message: "Writer created successfully",
      writerId: authData.user.id,
    });
  } catch (error) {
    console.error("Writer creation error:", error);
    return NextResponse.json(
      { error: "Failed to create writer" },
      { status: 500 }
    );
  }
}
