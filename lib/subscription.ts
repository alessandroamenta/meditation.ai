import { pricingData } from "@/config/subscriptions";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { SubscriptionPlan } from "types";
import { env } from "@/env.mjs";

export async function getUserSubscriptionPlan(
  userId: string,
): Promise<SubscriptionPlan> {
  const { data: user, error } = await supabase
    .schema("next_auth")
    .from("users")
    .select(
      "stripeSubscriptionId, stripeCurrentPeriodEnd, stripeCustomerId, stripePriceId, subscriptionPlan",
    )
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error("User not found");
  }

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user is on a paid plan.
  const isPaid =
    user.stripePriceId &&
    (user.stripeCurrentPeriodEnd instanceof Date
      ? user.stripeCurrentPeriodEnd.getTime() + 86_400_000 > Date.now()
      : false);

  const plan = {
    title: user.subscriptionPlan,
    description:
      user.subscriptionPlan === "Pro Plan"
        ? "Unlock Advanced Features"
        : "For Trying it out",
    benefits:
      user.subscriptionPlan === "Pro Plan"
        ? [
            "Up to 30 monthly generations",
            "Meditation library to replay saved sessions",
            "Priority access to new features",
            "Customer support",
          ]
        : [
            "Up to 3 monthly generations",
            "Meditation library to replay saved sessions",
          ],
    limitations:
      user.subscriptionPlan === "Pro Plan"
        ? []
        : ["No priority access to new features.", "Limited customer support"],
    prices: {
      monthly: user.subscriptionPlan === "Pro Plan" ? 10 : 0,
      yearly: 0,
    },
    stripeIds: {
      monthly:
        user.subscriptionPlan === "Pro Plan"
          ? env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID
          : null,
      yearly: null,
    },
  };

  console.log("Subscription plan:", plan);
  return plan;
}
