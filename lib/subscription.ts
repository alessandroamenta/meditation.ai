import { pricingData } from "@/config/subscriptions";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";
import { SubscriptionPlan } from "types";

export async function getUserSubscriptionPlan(
  userId: string
): Promise<SubscriptionPlan> {
  const { data: user, error } = await supabase
    .schema("next_auth")
    .from("users")
    .select("stripeSubscriptionId, stripeCurrentPeriodEnd, stripeCustomerId, stripePriceId")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error("User not found");
  }

  if (!user) {
    throw new Error("User not found")
  }

  // Check if user is on a paid plan.
  const isPaid =
    user.stripePriceId &&
    user.stripeCurrentPeriodEnd?.getTime() + 86_400_000 > Date.now() ? true : false;

  // Find the pricing data corresponding to the user's plan
  const userPlan =
    pricingData.find((plan) => plan.stripeIds.monthly === user.stripePriceId) ||
    pricingData.find((plan) => plan.stripeIds.yearly === user.stripePriceId);

  // If the user is on a paid plan and the userPlan is found, return the userPlan
  // Otherwise, return the "Free Trial" plan
  const plan = isPaid && userPlan ? userPlan : pricingData.find((plan) => plan.title === "Free Trial");

  // Check if plan is defined before returning
  if (plan) {
    console.log("Subscription plan:", plan);
    return plan;
  } else {
    throw new Error("No subscription plan found");
  }
}