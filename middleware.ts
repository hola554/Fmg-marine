
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Skip Supabase operations if environment variables are not set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

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

  // Refresh session if expired - required for Server Components
  await supabase.auth.getUser();

  // Protect routes that require authentication
  const protectedRoutes = ["/dashboard", "/jobs", "/refund", "/company-files", "/documents"];
  // const authRoutes = ["/auth/login", "/auth/signup"];
  // const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route));
  // const isAuthRoute = authRoutes.some(route => request.nextUrl.pathname === route);

  // if (isProtectedRoute) {
  //   const { data: { user } } = await supabase.auth.getUser();

  //   if (!user) {
  //     // Redirect to login if not authenticated
  //     return NextResponse.redirect(new URL("/auth/login", request.url));
  //   }
  // }

  // if (isAuthRoute) {
  //   const { data: { user } } = await supabase.auth.getUser();

  //   if (user) {
  //     // Redirect to dashboard if already authenticated
  //     return NextResponse.redirect(new URL("/dashboard", request.url));
  //   }
  // }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
