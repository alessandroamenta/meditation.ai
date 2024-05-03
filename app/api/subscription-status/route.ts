// app/api/subscription-status/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { env } from "@/env.mjs";
import { stripe } from "@/lib/stripe";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

export async function GET(request: Request) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return new NextResponse(JSON.stringify({ error: "Not authorized" }), {
      status: 401,
    });
  }

  const userId = session.user.id;

  try {
    const { data: user, error } = await supabase
      .schema("next_auth")
      .from("users")
      .select("stripeSubscriptionId")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user's Stripe subscription ID:", error);
      return new NextResponse(
        JSON.stringify({ error: "Failed to fetch user's subscription status" }),
        { status: 500 },
      );
    }

    if (!user.stripeSubscriptionId) {
      return new NextResponse(
        JSON.stringify({ subscriptionStatus: "inactive" }),
        { status: 200 },
      );
    }

    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId,
    );

    if (
      subscription.status === "active" ||
      subscription.status === "trialing"
    ) {
      return new NextResponse(
        JSON.stringify({ subscriptionStatus: "active" }),
        { status: 200 },
      );
    } else {
      return new NextResponse(
        JSON.stringify({ subscriptionStatus: "inactive" }),
        { status: 200 },
      );
    }
  } catch (error) {
    console.error("Error fetching user's subscription status:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch user's subscription status" }),
      { status: 500 },
    );
  }
}
