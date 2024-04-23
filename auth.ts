import NextAuth from "next-auth";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { env } from "@/env.mjs";
import { createClient } from "@supabase/supabase-js";
import { getUserByEmail } from "@/lib/user";
import MagicLinkEmail from "@/emails/magic-link-email";
import { siteConfig } from "@/config/site";
import crypto from "crypto";

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
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      async generateVerificationToken() {
        return crypto.randomBytes(32).toString("hex");
      },
      async sendVerificationRequest({ identifier, url, provider, token }) {
        const user = await getUserByEmail(identifier);
        if (!user || !user.name) return;

        const userVerified = user?.emailVerified ? true : false;
        const authSubject = userVerified
          ? `Sign-in link for ${siteConfig.name}`
          : "Activate your account";

        try {
          const { host } = new URL(url);
          const transport = provider.server.createTransport();
          await transport.sendMail({
            to: identifier,
            from: provider.from,
            subject: authSubject,
            html: MagicLinkEmail({
              firstName: user?.name as string,
              actionUrl: `${url}?token=${token}`,
              mailType: userVerified ? "login" : "register",
              siteName: siteConfig.name,
            }),
          });
        } catch (error) {
          throw new Error("Failed to send verification email.");
        }
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