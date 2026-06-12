import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db, users } from "@/lib/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string))
          .limit(1);

        if (!user) return null;
        if (user.status !== "activo") return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!valid) return null;

        return {
          id:          user.id,
          email:       user.email,
          name:        user.displayName,
          image:       user.avatarUrl,
          role:        user.role,
          notionOpId:  user.notionOperatorId,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id       = (user as any).id;
        token.role     = (user as any).role;
        token.notionOpId = (user as any).notionOpId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).id       = token.id;
        (session.user as any).role     = token.role;
        (session.user as any).notionOpId = token.notionOpId;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
