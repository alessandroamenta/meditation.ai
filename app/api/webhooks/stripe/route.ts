import { headers } from "next/headers";
import Stripe from "stripe";
import { env } from "@/env.mjs";
import { stripe } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import { dispatchCreditsUpdatedEvent } from "@/lib/events";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    console.error("Error constructing Stripe event:", error);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

  console.log("STRIPE_WEBHOOK_SECRET:", env.STRIPE_WEBHOOK_SECRET);

  const session = event.data.object as Stripe.Checkout.Session;

  // Check if the session and session.metadata are not null
  if (!session || !session.metadata) {
    console.error("Invalid session or metadata");
    return new Response("Invalid session or metadata", { status: 400 });
  }

  console.log("Session Metadata:", session.metadata);

  const userId = session.metadata.userId;
  console.log("User ID (webhook):", userId);

  if (event.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    const proPlanPriceId = env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID;
    const credits =
      subscription.items.data[0].price.id === proPlanPriceId ? 30 : 3;

    await supabase
      .schema("next_auth")
      .from("users")
      .update({
        credits: credits,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.current_period_end * 1000,
        ),
        subscriptionPlan:
          subscription.items.data[0].price.id === proPlanPriceId
            ? "Pro Plan"
            : "Free Trial",
      })
      .eq("id", userId);
    dispatchCreditsUpdatedEvent();
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;

    await supabase
      .schema("next_auth")
      .from("users")
      .update({
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
        subscriptionPlan: "Free Trial",
      })
      .eq("stripeSubscriptionId", subscription.id);
  }

  return new Response(null, { status: 200 });
}
