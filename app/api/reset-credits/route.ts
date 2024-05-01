import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export async function POST(request: Request) {
  try {
    const { data: users, error } = await supabase
      .schema("next_auth")
      .from("users")
      .select("id, lastCreditReset, subscriptionPlan");

    if (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }

    const currentDate = new Date();
    const updatePromises = users.map(async (user) => {
      const lastResetDate = user.lastCreditReset ? new Date(user.lastCreditReset) : null;
      const daysSinceLastReset = lastResetDate
        ? Math.floor((currentDate.getTime() - lastResetDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      if (!lastResetDate || (daysSinceLastReset !== null && daysSinceLastReset >= 30)) {
        const credits = user.subscriptionPlan === "Pro Plan" ? 30 : 3;
        await supabase
          .schema("next_auth")
          .from("users")
          .update({ credits, lastCreditReset: currentDate.toISOString() })
          .eq("id", user.id);
      }
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ message: "Credits reset successfully" });
  } catch (error) {
    console.error("Error resetting credits:", error);
    return NextResponse.json({ error: "Failed to reset credits" }, { status: 500 });
  }
}
