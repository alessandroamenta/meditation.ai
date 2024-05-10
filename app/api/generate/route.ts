import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from "@/auth";

export const runtime = "edge";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const secretToken = process.env.SECRET_TOKEN;

export async function POST(req: Request) {
  console.log('Received request to generate meditation');
  const { aiProvider, duration, guidanceLevel, ttsProvider, voice, meditationFocus } = await req.json();
  console.log('Request parameters:', { aiProvider, duration, guidanceLevel, ttsProvider, voice, meditationFocus });

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    console.log('No session found or user ID is missing');
    return new NextResponse(JSON.stringify({ error: "Not authorized" }), { status: 401 });
  }

  const userId = session.user.id;
  console.log(`User ID: ${userId}`);

  try {
    console.log('Fetching user credits from the database');
    const { data: userData, error: userError } = await supabase
      .schema('next_auth')
      .from('users')
      .select('credits')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user credits:', userError);
      return NextResponse.json({ error: 'Failed to fetch user credits. Please try again.' }, { status: 500 });
    }

    const availableCredits = userData.credits;
    console.log('Available credits:', availableCredits);

    if (availableCredits <= 0) {
      console.log('User has insufficient credits');
      return NextResponse.json({ error: 'You have reached your monthly meditation generation limit. Please upgrade your subscription or wait until next month.' }, { status: 403 });
    }

    console.log('Sending request to generate meditation');
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (secretToken) {
      headers["X-Secret-Token"] = secretToken;
    }

    fetch("https://dora-ai.onrender.com/generate", {
      method: "POST",
      headers,
      body: JSON.stringify({
        aiProvider,
        duration,
        guidanceLevel,
        ttsProvider,
        voice,
        meditationFocus,
      }),
    });

    // Start streaming the response immediately
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder.encode('Meditation generation started. Please wait...\n'));

        let audioData: ArrayBuffer | null = null;
        let audioGenerationFailed = false;

        while (!audioData && !audioGenerationFailed) {
          await new Promise((resolve) => setTimeout(resolve, 5000));

          const audioResponse = await fetch("https://dora-ai.onrender.com/audio");
          if (audioResponse.ok) {
            const contentType = audioResponse.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const audioMessage = await audioResponse.json();
              if (audioMessage.message === "Audio generation failed") {
                audioGenerationFailed = true;
                console.error('Audio generation failed');
                controller.enqueue(encoder.encode('Audio generation failed. Please try again.\n'));
              } else if (audioMessage.message !== "Audio not ready yet") {
                console.log('Unexpected JSON response:', audioMessage);
                controller.enqueue(encoder.encode('Unexpected response from the backend. Please try again.\n'));
              } else {
                console.log('Audio data not ready yet');
                controller.enqueue(encoder.encode('Audio data not ready yet. Waiting...\n'));
              }
            } else if (contentType && contentType.includes('audio/mpeg')) {
              audioData = await audioResponse.arrayBuffer();
              console.log('Audio data received');
              controller.enqueue(encoder.encode('Audio data received. Finalizing meditation...\n'));
            } else {
              console.error('Unexpected response content type:', contentType);
              controller.enqueue(encoder.encode('Unexpected response from the backend. Please try again.\n'));
            }
          } else {
            console.error('Error fetching audio data');
            controller.enqueue(encoder.encode('Error fetching audio data. Please try again.\n'));
          }
        }

        if (audioGenerationFailed) {
          controller.close();
          return;
        }

        if (!audioData) {
          console.error('Audio data is null');
          controller.enqueue(encoder.encode('Audio data is missing. Please try again.\n'));
          controller.close();
          return;
        }

        const outputFileName = `meditation-sesh-${Date.now()}.mp3`;
        console.log('Output file name:', outputFileName);

        console.log('Uploading audio file to Supabase private bucket');
        const { data, error } = await supabase.storage
          .from('private_meditations')
          .upload(`user_${userId}/${outputFileName}`, audioData, {
            cacheControl: '3600',
            upsert: false,
          });

        if (!error) {
          console.log('File uploaded to Supabase private bucket:', data);

          console.log('Inserting meditation into the database');
          const { data: meditationData, error: meditationError } = await supabase
            .from('meditations')
            .insert({
              user_id: userId,
              audio_path: outputFileName,
              display_name: outputFileName.replace('.mp3', ''),
              duration: duration,
              created_at: new Date().toISOString(),
            })
            .select('id');

          if (meditationError) {
            console.error('Error inserting meditation into table:', meditationError);
            controller.enqueue(encoder.encode('Failed to save meditation. Please try again.\n'));
          } else {
            console.log('Meditation inserted into table successfully');
            const meditationId = meditationData[0].id;
            console.log('Meditation ID:', meditationId);

            console.log('Updating user credits');
            const { data: updateData, error: updateError } = await supabase
              .schema('next_auth')
              .from('users')
              .update({ credits: availableCredits - 1 })
              .eq('id', userId);

            if (updateError) {
              console.error('Error updating user credits:', updateError);
            } else {
              console.log('User credits updated successfully');
            }

            console.log('Meditation generated and stored successfully');
            controller.enqueue(encoder.encode('Meditation generated and stored successfully.\n'));
            controller.enqueue(encoder.encode(`Meditation ID: ${meditationId}\n`));
          }
        } else {
          console.error('Error uploading file to Supabase private bucket:', error);
          controller.enqueue(encoder.encode('Failed to upload meditation to Supabase. Please try again.\n'));
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error generating meditation:', error);
    return NextResponse.json({ error: 'Failed to generate meditation. Please try again.' }, { status: 500 });
  }
}