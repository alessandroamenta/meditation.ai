import { CardSkeleton } from "@/components/shared/card-skeleton";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardShell } from "@/components/dashboard/shell";

export default function DashboardSettingsLoading() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Meditations" text="Your Meditation Library" />
      <div className="grid gap-10">
        <CardSkeleton />
      </div>
    </DashboardShell>
  );
}
