import { headers } from "next/headers";
import Stripe from "stripe";
import { env } from "@/env.mjs";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Error constructing Stripe event:", error);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

  console.log("STRIPE_WEBHOOK_SECRET:", env.STRIPE_WEBHOOK_SECRET);

  const session = event.data.object as Stripe.Checkout.Session;

  // Check if the session is not null
  if (!session) {
    console.error("Invalid session");
    return new Response("Invalid session", { status: 400 });
  }

  const authSession = await auth();
  if (!authSession || !authSession.user || !authSession.user.id) {
    console.error("Not authorized");
    return new NextResponse(JSON.stringify({ error: 'Not authorized' }), { status: 401 });
  }

  console.log("authSession:", authSession);

  const userId = authSession.user.id;
  console.log("User ID:", userId);

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    await supabase
      .schema("next_auth")
      .from("users")
      .update({
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000
        ),
      })
      .eq("id", userId);
  }

  return new Response(null, { status: 200 });
}
