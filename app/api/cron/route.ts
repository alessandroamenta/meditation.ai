import cron from "node-cron";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Schedule the credit reset job to run every day at midnight
    cron.schedule("0 0 * * *", async () => {
      console.log("Running credit reset job");
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/reset-credits`, {
        method: "POST",
      });
      console.log("Credit reset job completed");
    });

    console.log("Cron job scheduled successfully");
    return NextResponse.json({ message: "Cron job scheduled successfully" });
  } catch (error) {
    console.error("Error scheduling cron job:", error);
    return NextResponse.json(
      { error: "Failed to schedule cron job" },
      { status: 500 },
    );
  }
}
