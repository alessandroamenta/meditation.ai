import { NextResponse } from "next/server";
import Stripe from "stripe";

import { env } from "@/env.mjs";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
    const { priceId } = await request.json();
  
    try {
      const session = await stripe.checkout.sessions.create({
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
      });
  
      return NextResponse.json({ url: session.url });
    } catch (error) {
      console.error("Error creating Stripe Checkout session:", error);
      return NextResponse.json(
        { error: "Failed to create Checkout session" },
        { status: 500 }
      );
    }
  }