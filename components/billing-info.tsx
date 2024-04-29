"use client"

import * as React from "react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { pricingData } from "@/config/subscriptions"
import { SubscriptionPlan } from "types"

interface BillingInfoProps extends React.HTMLAttributes<HTMLFormElement> {
  subscriptionPlan: SubscriptionPlan;
}

export function BillingInfo({
  subscriptionPlan
}: BillingInfoProps) {
  console.log("Subscription plan in BillingInfo:", subscriptionPlan);

  const handleUpgrade = async () => {
    const proPlan = pricingData.find((plan) => plan.title === "Pro");
  
    if (!proPlan || !proPlan.stripeIds.monthly) {
      console.error("Stripe monthly price ID is missing for the Pro plan");
      return;
    }
  
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: proPlan.stripeIds.monthly,
        }),
      });
  
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error("Failed to create Checkout session");
      }
    } catch (error) {
      console.error("Error creating Checkout session:", error);
    }
  };
  

  const handleManageSubscription = () => {
    // Redirect to the Stripe customer portal for managing the subscription
    window.location.href = "/billing";
  };

  const isFreeTrial = subscriptionPlan.title === "Free Trial";
  const isProPlan = subscriptionPlan.title === "Pro";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Plan</CardTitle>
        <CardDescription>
          You are currently on the <strong>{subscriptionPlan.title}</strong>{" "}
          plan.
        </CardDescription>
      </CardHeader>
      <CardContent>{subscriptionPlan.description}</CardContent>
      <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
        {isFreeTrial ? (
          <button
            className={cn(buttonVariants())}
            onClick={handleUpgrade}
          >
            Upgrade now
          </button>
        ) : isProPlan ? (
          <button
            className={cn(buttonVariants())}
            onClick={handleManageSubscription}
          >
            Manage Subscription
          </button>
        ) : null}
      </CardFooter>
    </Card>
  )
}
