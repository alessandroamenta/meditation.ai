import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/session"
import { getUserSubscriptionPlan } from "@/lib/subscription"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BillingInfo } from "@/components/billing-info"
import { DashboardHeader } from "@/components/dashboard/header"
import { Icons } from "@/components/shared/icons"
import { DashboardShell } from "@/components/dashboard/shell"

export const metadata = {
  title: "Billing",
  description: "Manage billing and your subscription plan.",
}

export default async function BillingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const userId = user.id;
  const subscriptionPlan = await getUserSubscriptionPlan(userId);
  console.log("Subscription plan in BillingPage:", subscriptionPlan);

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Billing"
        text="Manage billing and your subscription plan."
      />
      <div className="grid gap-8">
        <Alert className="!pl-14">
          <Icons.warning />
          <AlertTitle>This app is in beta.</AlertTitle>
          <AlertDescription>
          Please be patient, if there are any bugs 🐞, let us know and we will fix them as soon as possible! 👨‍💻
          </AlertDescription>
        </Alert>
        <BillingInfo userId={userId} subscriptionPlan={subscriptionPlan} />
      </div>
    </DashboardShell>
  );
}
