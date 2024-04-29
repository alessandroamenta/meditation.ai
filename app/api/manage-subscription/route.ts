import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { env } from "@/env.mjs";
import { stripe } from "@/lib/stripe";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.email) {
      return new NextResponse(JSON.stringify({ error: "Not authorized" }), { status: 401 });
    }

    const userEmail = session.user.email;
    const { data: user, error } = await supabase
      .schema("next_auth")
      .from("users")
      .select("stripeCustomerId")
      .eq("email", userEmail)
      .single();

    if (error || !user || !user.stripeCustomerId) {
      return new NextResponse(JSON.stringify({ error: "User not found or not subscribed" }), { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating Stripe customer portal session:", error);
    return NextResponse.json({ error: "Failed to create customer portal session" }, { status: 500 });
  }
}
