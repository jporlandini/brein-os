import type { NextAuthConfig } from "next-auth";

/**
 * Auth config sin bcryptjs — safe para Edge Runtime (middleware).
 * El provider de Credentials completo vive en auth.ts (Node.js only).
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as { role?: string })?.role;

      const isLoginPage    = nextUrl.pathname === "/login";
      const isOperatorPath = nextUrl.pathname.startsWith("/operator");
      const isPortalPath   = nextUrl.pathname.startsWith("/portal");
      const isApiPath      = nextUrl.pathname.startsWith("/api");

      if (isApiPath) return true;

      if (isLoggedIn && isLoginPage) {
        return Response.redirect(
          new URL(role === "cliente" ? "/portal" : "/operator", nextUrl)
        );
      }

      if (!isLoggedIn && (isOperatorPath || isPortalPath)) {
        return Response.redirect(new URL("/login", nextUrl));
      }

      if (isLoggedIn && isOperatorPath && role === "cliente") {
        return Response.redirect(new URL("/portal", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id         = (user as Record<string, unknown>).id as string;
        token.role       = (user as Record<string, unknown>).role as string;
        token.notionOpId = (user as Record<string, unknown>).notionOpId as string;
      }
      return token;
    },
    session({ session, token }) {
      const u = session.user as unknown as Record<string, unknown>;
      u.id         = token.id;
      u.role       = token.role;
      u.notionOpId = token.notionOpId;
      return session;
    },
  },
  providers: [],
};
