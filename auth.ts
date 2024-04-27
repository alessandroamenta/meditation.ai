import NextAuth from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import Google from "next-auth/providers/google";
import Twitter from "next-auth/providers/twitter";
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
    Twitter({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      //userinfo: "https://api.twitter.com/2/users/me?user.fields=profile_image_url,username",
      profile(profile) {
        return {
          id: profile.data.id,
          name: profile.data.name,
          email: profile.data.username, // Assign username to email field
          image: profile.data.profile_image_url,
        };
      },
    }),
  ],
  callbacks: {
      async session({ token, session }) {
        if (session?.user) {
          if (token.sub) {
            session.user.id = token.sub;
          }
          if (token.provider === "twitter") {
            session.user.username = token.email; // Assign username to session.user.username
          } else if (token.email) {
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