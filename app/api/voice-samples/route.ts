// pages/api/voice-samples.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const voiceId = searchParams.get("voiceId");
  const ttsProvider = searchParams.get("ttsProvider");

  if (!voiceId || !ttsProvider) {
    return NextResponse.json(
      { error: "Missing voiceId or ttsProvider" },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await supabase.storage
      .from("voice-samples")
      .download(`${ttsProvider}/${voiceId}.mp3`);

    if (error) {
      console.error("Error downloading voice sample:", error);
      return NextResponse.json(
        { error: "Failed to retrieve voice sample" },
        { status: 500 },
      );
    }

    return new NextResponse(data, {
      headers: {
        "Content-Type": "audio/mpeg",
      },
    });
  } catch (error) {
    console.error("Error retrieving voice sample:", error);
    return NextResponse.json(
      { error: "Failed to retrieve voice sample" },
      { status: 500 },
    );
  }
}
