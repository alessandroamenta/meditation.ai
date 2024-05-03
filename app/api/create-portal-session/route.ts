import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { env } from "@/env.mjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return new NextResponse(JSON.stringify({ error: "Not authorized" }), {
      status: 401,
    });
  }

  const userId = session.user.id;

  try {
    const { data: user } = await supabase
      .schema("next_auth")
      .from("users")
      .select("stripeCustomerId")
      .eq("id", userId)
      .single();

    if (!user || !user.stripeCustomerId) {
      return new NextResponse(
        JSON.stringify({
          error: "User not found or missing Stripe customer ID",
        }),
        { status: 404 },
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?cancellation=true`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating Customer Portal session:", error);
    return NextResponse.json(
      { error: "Failed to create Customer Portal session" },
      { status: 500 },
    );
  }
}
