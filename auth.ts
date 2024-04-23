import NextAuth from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import Google from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "@/env.mjs";
import { createClient } from "@supabase/supabase-js";

export const { 
  handlers: { GET, POST },
  auth,
} = NextAuth({
  adapter: SupabaseAdapter({
    url: env.NEXT_PUBLIC_SUPABASE_URL || '',
    secret: env.SUPABASE_SERVICE_ROLE_KEY || '',
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
      name: 'Magic Link',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL || '', env.SUPABASE_SERVICE_ROLE_KEY || '');
    
        if (credentials?.email) {
          const { data, error } = await supabase
            .from('"next_auth"."users"')
            .select('*')
            .eq('email', credentials.email)
            .single();
      
          if (error) {
            if (error.code === 'PGRST116') {
              // User not found, return null
              return null;
            }
            throw new Error(error.message);
          }
      
          if (data) {
            return data;
          }
        }
      
        return null;
      },
    }),
  ],
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
