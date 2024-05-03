// pages/api/voice-sample-urls.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
);

export async function GET() {
  try {
    const { data: openaiVoiceSamples, error: openaiError } =
      await supabase.storage.from("voice-samples").list("openai", {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    const { data: elevenlabsVoiceSamples, error: elevenlabsError } =
      await supabase.storage.from("voice-samples").list("elevenlabs", {
        limit: 100,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (openaiError || elevenlabsError) {
      console.error(
        "Error retrieving voice sample URLs:",
        openaiError || elevenlabsError,
      );
      return NextResponse.json(
        { error: "Failed to retrieve voice sample URLs" },
        { status: 500 },
      );
    }

    const openaiVoiceSampleUrls = openaiVoiceSamples?.map((sample) => ({
      voiceId: sample.name.replace(".mp3", ""),
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/voice-samples/openai/${sample.name}`,
    }));

    const elevenlabsVoiceSampleUrls = elevenlabsVoiceSamples?.map((sample) => ({
      voiceId: sample.name.replace(".mp3", ""),
      url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/voice-samples/elevenlabs/${sample.name}`,
    }));

    return NextResponse.json({
      openai: openaiVoiceSampleUrls,
      elevenlabs: elevenlabsVoiceSampleUrls,
    });
  } catch (error) {
    console.error("Error retrieving voice sample URLs:", error);
    return NextResponse.json(
      { error: "Failed to retrieve voice sample URLs" },
      { status: 500 },
    );
  }
}
