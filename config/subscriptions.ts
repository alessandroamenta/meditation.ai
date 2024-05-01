import { SubscriptionPlan } from "@/types";
import { env } from "@/env.mjs"

export const pricingData: SubscriptionPlan[] = [
  {
    title: 'Free Trial',
    description: 'For Trying it out',
    benefits: [
      'Up to 3 monthly generations',
      'Meditation library to replay saved sessions',
    ],
    limitations: [
      'No priority access to new features.',
      'Limited customer support',
    ],
    prices: {
      monthly: 0,
      yearly: 0,
    },
    stripeIds: {
      monthly: null,
      yearly: null,
    },
  },
  {
    title: 'Pro',
    description: 'Unlock Advanced Features',
    benefits: [
      'Up to 30 monthly generations',
      'Meditation library to replay saved sessions',
      'Priority access to new features',
      'Customer support',
    ],
    limitations: [],
    prices: {
      monthly: 10,
      yearly: 0,
    },
    stripeIds: {
      monthly: env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID,
      yearly: null,
    },
  },
];
