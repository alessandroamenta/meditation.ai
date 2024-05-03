import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/auth";
import { env } from "@/env.mjs";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return new NextResponse(JSON.stringify({ error: "Not authorized" }), {
      status: 401,
    });
  }

  const userId = session.user.id;
  console.log("User ID (create-checkout-session):", userId);

  const { priceId } = await request.json();

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
      metadata: {
        userId: userId,
      },
    });

    console.log("Checkout Session Metadata:", checkoutSession.metadata);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating Stripe Checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create Checkout session" },
      { status: 500 },
    );
  }
}
