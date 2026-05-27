import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const APP_ROUTES = [
  "/dashboard",
  "/revenue",
  "/alerts",
  "/deliveries",
  "/suggestions",
  "/profile",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("sso_access_token")?.value;
  const role = request.cookies.get("sso_role")?.value;

  // Protect app routes — redirect to login when not authenticated
  const isAppRoute = APP_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/"),
  );
  if (isAppRoute && !accessToken) {
    const loginUrl = new URL("/login", request.url);
    const res = NextResponse.redirect(loginUrl);
    for (const name of ["sso_role", "sso_name", "sso_email", "sso_sub"]) {
      res.cookies.delete(name);
    }
    return res;
  }

  // Inject X-User-Role into backend API proxy requests
  if (pathname.startsWith("/api/v1/") && role) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("X-User-Role", role);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals, static files, and auth API routes
    "/((?!api/auth|_next/static|_next/image|favicon.ico|Big_C_mini_logo.ico).*)",
  ],
};
