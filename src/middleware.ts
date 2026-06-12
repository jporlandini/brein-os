import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req as any;
  const isLoggedIn = !!session;
  const role = session?.user?.role;

  const isLoginPage    = nextUrl.pathname === "/login";
  const isOperatorPath = nextUrl.pathname.startsWith("/operator");
  const isPortalPath   = nextUrl.pathname.startsWith("/portal");
  const isApiPath      = nextUrl.pathname.startsWith("/api");

  // Allow public API routes
  if (isApiPath) return NextResponse.next();

  // Redirect logged-in users away from login
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(
      new URL(role === "cliente" ? "/portal" : "/operator", nextUrl)
    );
  }

  // Require auth for protected routes
  if (!isLoggedIn && (isOperatorPath || isPortalPath)) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Role guard: clients cannot access operator dashboard
  if (isLoggedIn && isOperatorPath && role === "cliente") {
    return NextResponse.redirect(new URL("/portal", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
