import NextAuth from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import Google from "next-auth/providers/google";
import { env } from "@/env.mjs";
import { createClient } from "@supabase/supabase-js";
import CredentialsProvider from "next-auth/providers/credentials";

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL || "", env.SUPABASE_SERVICE_ROLE_KEY || "");

export const {
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: SupabaseAdapter({
    url: env.NEXT_PUBLIC_SUPABASE_URL || "",
    secret: env.SUPABASE_SERVICE_ROLE_KEY || "",
  }),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const { email } = credentials as { email: string };
        const { data, error } = await supabase
          .schema("next_auth")  
          .from("users")
          .select("*")
          .eq("email", email)
          .single();

        if (error || !data) {
          console.error("Error finding user:", error);
          throw new Error("An error occurred. Please try again later.");
        }

        return data;
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (session?.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }
        if (token.email) {
          session.user.email = token.email;
        }
        session.user.name = token.name;
        session.user.image = token.picture;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      console.log("this is the token", token);
      return token;
    },
  },
});