import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: "",
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected routes handling
  if (pathname.startsWith("/admin") || pathname.startsWith("/writer")) {
    // Not logged in - redirect to login
    if (!user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Get user profile for role check
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active, must_change_password")
      .eq("id", user.id)
      .single();

    // No profile found or inactive - sign out and redirect
    if (!profile || !profile.is_active) {
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Force password change if required
    if (profile.must_change_password) {
      return NextResponse.redirect(new URL("/auth/change-password", request.url));
    }

    // Admin routes - require admin role
    if (pathname.startsWith("/admin") && profile.role !== "admin") {
      // If writer trying to access admin, redirect to writer dashboard
      if (profile.role === "writer") {
        return NextResponse.redirect(new URL("/writer", request.url));
      }
      // Otherwise redirect to login
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Writer routes - require writer role
    if (pathname.startsWith("/writer") && profile.role !== "writer") {
      // If admin trying to access writer, redirect to admin dashboard
      if (profile.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      // Otherwise redirect to login
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Change password page - require user to be logged in with must_change_password flag
  if (pathname === "/auth/change-password") {
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("must_change_password, role")
      .eq("id", user.id)
      .single();

    // If user doesn't need to change password, redirect to dashboard
    if (profile && !profile.must_change_password) {
      const redirectTo = profile.role === "admin" ? "/admin" : "/writer";
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  // Login page - redirect logged in users to their dashboard
  if (pathname === "/auth/login" && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (profile?.role === "writer") {
      return NextResponse.redirect(new URL("/writer", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
