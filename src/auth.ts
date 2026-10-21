// Auth.js, seeded with a single owner account in Phase 1 (PRD §5.6, §7.1).
// Phase 2 adds sign-up and OAuth providers here; the tenantId-on-session contract stays the same.
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";

declare module "next-auth" {
  interface Session {
    user: { id: string; tenantId: string } & DefaultSession["user"];
  }
  interface User {
    tenantId: string;
  }
}

const credentials = z.object({ email: z.email(), password: z.string().min(1) });

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/console/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentials.safeParse(raw);
        if (!parsed.success) return null;
        const user = await db.query.users.findFirst({
          where: eq(schema.users.email, parsed.data.email.toLowerCase()),
        });
        if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null;
        return { id: user.id, email: user.email, tenantId: user.tenantId };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.tenantId = user.tenantId;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub!;
      session.user.tenantId = token.tenantId as string;
      return session;
    },
  },
});
