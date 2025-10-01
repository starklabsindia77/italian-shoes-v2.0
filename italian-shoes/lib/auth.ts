import type { NextAuthOptions, DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Extend types for session & token
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "USER";
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "ADMIN" | "USER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "USER";
  }
}

/**
 * NextAuth configuration
 * - Credentials login (email/password)
 * - JWT sessions with role in token & session
 * - Sign-in page at /login
 */
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, // ensure set in .env
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toLowerCase().trim();
        const password = credentials?.password ?? "";

        if (!email || !password) {
          console.warn("auth/missing-credentials");
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) {
          console.warn("auth/no-user-or-password", email);
          return null;
        }

        const ok = await compare(password, user.passwordHash);
        if (!ok) {
          console.warn("auth/bad-password", email);
          return null;
        }

        // Typed return object for NextAuth
        return {
          id: user.id,
          name: user.name ?? null,
          email: user.email,
          role: user.role as "ADMIN" | "USER",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // First sign-in
        token.role = user.role;
      } else if (token?.email) {
        // Subsequent requests: keep DB role in sync
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { role: true },
          });
          if (dbUser) token.role = dbUser.role as "ADMIN" | "USER";
        } catch {
          // ignore DB lookup failures
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role ?? "USER";
      }
      return session;
    },
  },
};

/** Convenience helper to read the server session with our options */
export const getServerAuthSession = () => getServerSession(authOptions);

/** Throw if not signed in; returns the session otherwise */
export async function requireUser() {
  const session = await getServerAuthSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}

/** Throw if not ADMIN; returns the session otherwise */
export async function requireAdmin() {
  const session = await getServerAuthSession();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function auth() {
  return getServerAuthSession();
}
