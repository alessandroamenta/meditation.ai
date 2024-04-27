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
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const { email } = credentials as { email: string };
        console.log('Received credentials:', { email });
      
        // First, check if the user exists
        const { data: existingUser, error: findUserError } = await supabase
          .schema("next_auth")
          .from("users")
          .select("*")
          .eq("email", email)
          .single();
      
        if (findUserError) {
          console.error("Error finding user:", findUserError.message, findUserError.code);
          throw new Error("An error occurred. Please try again later.");
        }
      
        console.log("Existing user data:", existingUser);
      
        // If the user exists, return the user data
        if (existingUser) {
          return existingUser;
        }
      
        console.log("Creating new user with email:", email);
      
        // If the user doesn't exist, create a new user record
        const { data: newUser, error: createUserError } = await supabase
          .schema("next_auth")
          .from("users")
          .insert({ email })
          .select("*")
          .single();
      
        if (createUserError) {
          console.error("Error creating user:", createUserError.message, createUserError.code);
          throw new Error("An error occurred while creating a new user.");
        }
      
        console.log("New user created successfully:", newUser);
      
        // Return the newly created user data
        return newUser;
      }
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