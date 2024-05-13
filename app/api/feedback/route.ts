// app/api/post-feedback/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user || !session.user.email) {
    return new NextResponse(JSON.stringify({ error: "Not authorized" }), {
      status: 401,
    });
  }
  const userEmail = session.user.email;

  try {
    const { feedback } = await req.json();

    console.log("Feedback submitted:", feedback);
    console.log("User email:", userEmail);

    const { error } = await supabase
      .schema("next_auth")
      .from("feedback")
      .insert({ feedback, email: userEmail });

    if (error) throw error;

    return new NextResponse(
      JSON.stringify({ message: "Feedback submitted successfully" }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to submit feedback" }),
      { status: 500 },
    );
  }
}
