import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { auth } from "@/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

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
    const response = await fetch("https://dora-ai.onrender.com/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        aiProvider,
        duration,
        guidanceLevel,
        ttsProvider,
        voice,
        meditationFocus,
      }),
    });

    if (!response.ok) {
      console.error('Failed to generate meditation');
      throw new Error("Failed to generate meditation");
    }

    const { message } = await response.json();
    console.log('Response from meditation generation:', message);

    console.log('Polling backend for audio data');
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
            throw new Error("Failed to generate audio");
          } else if (audioMessage.message !== "Audio not ready yet") {
            console.log('Unexpected JSON response:', audioMessage);
            throw new Error("Unexpected JSON response from backend");
          } else {
            console.log('Audio data not ready yet');
          }
        } else if (contentType && contentType.includes('audio/mpeg')) {
          audioData = await audioResponse.arrayBuffer();
          console.log('Audio data received');
        } else {
          console.error('Unexpected response content type:', contentType);
          throw new Error("Unexpected response content type from backend");
        }
      } else {
        console.error('Error fetching audio data');
        throw new Error("Failed to fetch audio data");
      }
    }
  
    if (audioGenerationFailed) {
      return NextResponse.json({ error: 'Failed to generate meditation audio. Please try again.' }, { status: 500 });
    }
  
    if (!audioData) {
      console.error('Audio data is null');
      return NextResponse.json({ error: 'Audio data is missing. Please try again.' }, { status: 500 });
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
        return NextResponse.json({ error: 'Failed to save meditation. Please try again.' }, { status: 500 });
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
        return NextResponse.json({ message: 'Meditation generated and stored successfully.', meditationId });
      }
    } else {
      console.error('Error uploading file to Supabase private bucket:', error);
      return NextResponse.json({ error: 'Failed to upload meditation to Supabase. Please try again.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error generating meditation:', error);
    return NextResponse.json({ error: 'Failed to generate meditation. Please try again.' }, { status: 500 });
  }
}

export const runtime = "edge"
