// app/(dashboard)/dashboard/page.tsx
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder"
import { DashboardHeader } from "@/components/dashboard/header"
import { DashboardShell } from "@/components/dashboard/shell"
import { Button } from "@/components/ui/button"
import MeditationSection from "@/components/dashboard/MeditationSection"

export const metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect("/login")
  }

  const userName = user?.name ? user.name.split(" ")[0] : "friend";

  return (
    <DashboardShell>
      <DashboardHeader heading={`Hi, ${userName}!`} text="Ready to get some headspace? Create any meditation with AI.">
        <Button>Fake button</Button>
      </DashboardHeader>
      <div>
        {/* 
        <EmptyPlaceholder>
          <EmptyPlaceholder.Icon name="home" />
          <EmptyPlaceholder.Title>No content created</EmptyPlaceholder.Title>
          <EmptyPlaceholder.Description>
            You don&apos;t have any content yet. Start creating content.
          </EmptyPlaceholder.Description>
          <Button variant="outline">Fake button</Button>
        </EmptyPlaceholder>
        */}
        <MeditationSection />
      </div>
    </DashboardShell>
  )
}