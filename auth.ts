import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/db"
import authConfig from "@/auth.config"
import { getUserById } from "@/lib/user"
import { SupabaseAdapter } from "@auth/supabase-adapter"

export const { 
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  }),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    // error: "/auth/error",
  },
  callbacks: {
    async session({ token, session }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }
  
        if (token.email) {
          session.user.email = token.email;
        }

        session.user.name = token.name;
        session.user.image = token.picture;
      }

      return session
    },

    async jwt({ token }) {
      if (!token.sub) return token;

      const dbUser = await getUserById(token.sub);

      if (!dbUser) return token;

      token.name = dbUser.name;
      token.email = dbUser.email;
      token.picture = dbUser.image;

      return token;
    },
  },
  ...authConfig,
  // debug: process.env.NODE_ENV !== "production"
})