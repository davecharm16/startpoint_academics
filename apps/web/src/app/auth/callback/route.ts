import { createClient } from "@startpoint/supabase/server";
import { NextResponse } from "next/server";

/**
 * Auth callback route handler.
 *
 * Supabase redirects here after:
 * - Password reset email link click (type=recovery)
 * - Email confirmation
 * - Other auth events
 *
 * The URL contains a `code` parameter that needs to be exchanged
 * for a session using `exchangeCodeForSession`.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Password recovery flow - redirect to change-password page
      if (type === "recovery") {
        return NextResponse.redirect(new URL("/auth/change-password?mode=reset", origin));
      }

      // Default: redirect to home (the middleware will handle role-based redirect)
      return NextResponse.redirect(new URL("/", origin));
    }
  }

  // If code exchange fails or no code provided, redirect to login with error
  return NextResponse.redirect(
    new URL("/auth/login?error=invalid_link", request.url)
  );
}
