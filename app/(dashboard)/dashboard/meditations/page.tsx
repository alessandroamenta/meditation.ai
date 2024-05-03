import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/session";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";
import { UserNameForm } from "@/components/forms/user-name-form";
import MeditationsListWrapper from "@/components/dashboard/MeditationsListWrapper";

export const metadata = {
  title: "Meditations",
  description: "Manage meditations.",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Meditations" text="Your Meditation Library" />
      <MeditationsListWrapper />
    </DashboardShell>
  );
}
