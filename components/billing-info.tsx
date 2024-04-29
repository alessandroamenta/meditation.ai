"use client"

import * as React from "react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { pricingData } from "@/config/subscriptions"
import { SubscriptionPlan } from "types"
import { Icons } from "@/components/shared/icons"

interface BillingInfoProps extends React.HTMLAttributes<HTMLFormElement> {
  subscriptionPlan: SubscriptionPlan;
}

export function BillingInfo({ subscriptionPlan }: BillingInfoProps) {
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

  const handleManageSubscription = async () => {
    try {
      const response = await fetch("/api/manage-subscription");
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        console.error("Failed to create customer portal session");
      }
    } catch (error) {
      console.error("Error creating customer portal session:", error);
    }
  };

  const isFreeTrial = subscriptionPlan.title === "Free Trial";
  const isProPlan = subscriptionPlan.title === "Pro";

  return (
    <div className="mx-auto grid max-w-screen-lg gap-5 bg-inherit py-5 md:grid-cols-2 lg:grid-cols-2">
      {pricingData.map((offer) => (
        <Card key={offer.title} className="relative flex flex-col overflow-hidden rounded-xl border">
          <div className="min-h-[150px] items-start space-y-4 bg-secondary/70 p-6">
            <p className="flex font-urban text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {offer.title}
            </p>

            <div className="flex flex-row">
              <div className="flex items-end">
                <div className="flex text-left text-3xl font-semibold leading-6">
                  <span>${offer.prices.monthly}</span>
                </div>
                <div className="-mb-1 ml-2 text-left text-sm font-medium">
                  <div>/mo</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-full flex-col justify-between gap-16 p-6">
            <ul className="space-y-2 text-left text-sm font-medium leading-normal">
              {offer.benefits.map((feature) => (
                <li className="flex items-start" key={feature}>
                  <Icons.check className="mr-3 size-5 shrink-0" />
                  <p>{feature}</p>
                </li>
              ))}

              {offer.limitations.length > 0 &&
                offer.limitations.map((feature) => (
                  <li className="flex items-start text-muted-foreground" key={feature}>
                    <Icons.close className="mr-3 size-5 shrink-0" />
                    <p>{feature}</p>
                  </li>
                ))}
            </ul>

            <CardFooter className="flex flex-col items-start space-y-2 md:flex-row md:justify-between md:space-x-0">
              {isFreeTrial && offer.title === "Free Trial" ? (
                <span className={cn(buttonVariants({ variant: "default" }))}>Current plan</span>
              ) : isProPlan && offer.title === "Free Trial" ? (
                <span className={cn(buttonVariants({ variant: "default" }))}>Basic plan</span>
              ) : isProPlan && offer.title === "Pro" ? (
                <button className={cn(buttonVariants())} onClick={handleManageSubscription}>
                  Manage Subscription
                </button>
              ) : isFreeTrial && offer.title === "Pro" ? (
                <button className={cn(buttonVariants())} onClick={handleUpgrade}>
                  Upgrade now
                </button>
              ) : (
                <Link
                  href="/dashboard"
                  className={cn(buttonVariants({ variant: "default" }))}
                >
                  Go to dashboard
                </Link>
              )}
            </CardFooter>
          </div>
        </Card>
      ))}
    </div>
  );
}
