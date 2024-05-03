import { NextResponse } from 'next/server';
import OpenAI from "openai";
import Anthropic from '@anthropic-ai/sdk';
import { ElevenLabsClient } from "elevenlabs";
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { auth } from "@/auth";
import os from 'os';
import { getAudioDuration, generateSilentAudio, concatenateAudioFiles } from './ffmpegUtils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(req: Request) {
  console.log('Received request to generate meditation');
  const { aiProvider, duration, guidanceLevel, ttsProvider, voice, meditationFocus } = await req.json();

  // Retrieve the session using auth()
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    console.log('No session found or user ID is missing');
    return new NextResponse(JSON.stringify({ error: "Not authorized" }), { status: 401 });
  }

  const userId = session.user.id; // This is the authenticated user's ID
  console.log(`User ID: ${userId}`); // Log the user ID to the console

  // Define meditation duration and guidance level options and heuristics from Python script
  const durationOptions = { "2-5min": 4, "5-10min": 7, "10+min": 10 };
  const heuristics = {
    "4low": [1000, 2, 90],
    "4medium": [2000, 2, 60],
    "4high": [2000, 4, 30],
    "7low": [2000, 2, 165],
    "7medium": [3500, 4, 60],
    "7high": [4000, 6, 40],
    "10low": [2500, 3, 180],
    "10medium": [4000, 5, 85],
    "10high": [5000, 6, 50],
  };

  const averageDuration = durationOptions[duration];
  const heuristicKey = `${averageDuration}${guidanceLevel}`;
  const [charCount, pauseCount, pauseLength] = heuristics[heuristicKey];
  const sectionCount = pauseCount + 1;
  const pauseLengthMs = pauseLength * 1000;

  // Construct the prompt as per the logic in your Python script
  const prompt = `
  Your task is to create a script for a ${averageDuration} minutes guided meditation session focusing on ${meditationFocus}.
  The meditation should have ${sectionCount} sections and ${pauseCount} pauses total. Please follow these specific guidelines:
  1. Use ellipses (...) and commas strategically throughout the script to create natural pauses and a slower pace, with a particular emphasis on the beginning and end of the meditation. It is crucial to add a significant number of ellipses and commas, especially when starting the meditation script, to establish a slower and more relaxed pace. Additionally, when providing instructions related to breathing or other focus-specific techniques, use at least twice as many ellipses to allow ample time for the listener to follow along. For example:
      'Take a deep breath in..............................................and slowly exhale.......................................'
      'As you settle into a comfortable position.............................., allow your body to relax............................., letting go of any tension or stress............................................'
      'Without trying to change it......................, simply observe......................... how your chest or belly rises........................ and falls.......................... with each breath.............................. Feel the air entering through your nostrils......................., cool and refreshing........................, and then warming as it exits.................................... Let's fully immerse in this sensation of breathing for a moment........................................................'
      Intelligently determine the appropriate number of ellipses to add based on the specific scenario and instructions being given, ensuring a consistently slow and relaxed pace throughout the entire meditation script, with extra emphasis on the beginning, end, and focus-specific instructions.
  2. The script should be ${charCount} characters long to align with the ${averageDuration} minutes duration of the session.
  3. Include a total of ${pauseCount} '---PAUSE---' markers at carefully considered transition points to create periods of silent reflection or focused breathing exercises.
      These pauses are crucial for the meditation's structure and flow. There should be a total of ${pauseCount} '---PAUSE---' markers. One for each pause.
  4. Before each '---PAUSE---' marker, gently guide the listener into the pause using phrases that encourage a smooth transition.
      For example:
      - 'Let's now gently turn our attention to our breath, allowing ourselves to fully experience the rhythm of each inhale and exhale.'
      - 'At this moment, let's simply be with our breath, feeling the calmness with each breath cycle.'
      - 'Now, let's take a moment to extend this feeling of warmth and compassion to ourselves and others...'
      - 'As we rest in this space of loving-kindness, allow yourself to be enveloped by a sense of peace and connection...'
      These guiding phrases should serve as soft introductions to the '---PAUSE---' markers, ensuring participants are thoughtfully led into each pause without abruptness, while maintaining relevance to the chosen focus.
  5. IMPORTANT: The output should only contain the meditation script, without any additional commentary.
  6. Use simple, clear, and approachable language throughout the script to make the meditation accessible, engaging and relaxing for everyone.
  7. The script should provide '${guidanceLevel}' level guidance, adjust the depth of instructions to guide the listener accordingly.
  8. The final section will gently conclude the session, guiding towards reawakening and reconnection with the surroundings. This closing section should include instructions for slowly opening the eyes, feeling the body, and becoming aware of the sounds and sensations in the environment, signaling the end of the meditation, while tying back to the main theme of the selected focus.
  Remember, the script's strict adherence to the ${charCount} character count, it should be ${sectionCount} sections total, and the strategic placement of ${pauseCount} '---PAUSE---' markers with gentle introductory phrases are essential for creating an impactful and seamless meditation experience. The use of ellipses and commas, especially at the beginning, will further enhance the slow and calming nature of the meditation.
`;

  try {
    // Check user's available credits
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
      return NextResponse.json({ error: 'You have reached your monthly meditation generation limit. Please upgrade your subscription or wait until next month.' }, { status: 403 });
    }

    let meditationScript = '';

    if (aiProvider === 'openai') {
      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: "You are an expert meditation guide." },
          { role: "user", content: prompt }
        ],
        max_tokens: charCount,
        temperature: 0.5,
      });
      meditationScript = response.choices[0].message.content as string;
    } else if (aiProvider === 'anthropic') {
      const response = await anthropic.messages.create({
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: [{
            type: 'text',
            text: prompt,
          }],
        }],
        model: 'claude-3-haiku-20240307',
        system: 'You are an expert meditation guide.',
        temperature: 0.5,
      });
      meditationScript = response.content[0].text;
    } else {
      throw new Error('Invalid AI provider');
    }
    console.log('Generated Meditation Script:');
    console.log(meditationScript);

    // Generate and concatenate meditation audio files with pauses
    const segments = meditationScript.split('---PAUSE---');
    const audioFiles = [];

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const audioFileName = `segment-${i}-${Date.now()}.mp3`;
      const audioFilePath = path.join(os.tmpdir(), audioFileName);

      if (ttsProvider === 'openai') {
        const audio = await openai.audio.speech.create({
          model: "tts-1",
          input: segment,
          voice: voice,
          response_format: 'mp3',
        });
        const buffer = Buffer.from(await audio.arrayBuffer());
        await fs.promises.writeFile(audioFilePath, buffer);
      } else if (ttsProvider === 'elevenlabs') {
        const audio = await elevenlabs.generate({
          voice: voice,
          text: segment,
          model_id: "eleven_monolingual_v1",
          output_format: "mp3_44100_128",
        });
        await fs.promises.writeFile(audioFilePath, audio);
      } else {
        throw new Error('Invalid TTS provider');
      }

      audioFiles.push(audioFilePath as never);
    }

    // Generate a silent audio file to use as a pause in MP3 format
    const silentAudioPath = path.join(os.tmpdir(), 'silent.mp3');
    await generateSilentAudio(pauseLengthMs, silentAudioPath);

    // Concatenation using fluent-ffmpeg with re-encoding
    const outputFileName = `meditation-sesh-${Date.now()}.mp3`;
    const outputFilePath = path.join(os.tmpdir(), outputFileName);

    await concatenateAudioFiles(audioFiles as string[], silentAudioPath, outputFilePath);

    // Get the duration of the generated audio file
    const duration = await getAudioDuration(outputFilePath);

    // Read the file into a Buffer
    const fileBuffer = fs.readFileSync(outputFilePath);

    // Upload the file to Supabase's private bucket
    const { data, error } = await supabase.storage
      .from('private_meditations')
      .upload(`user_${userId}/${outputFileName}`, fileBuffer, {
        cacheControl: '3600',
        upsert: false,
      });

    if (!error) {
      console.log('File uploaded to Supabase private bucket:', data);

      // Insert a new row into the meditations table
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
        const meditationId = meditationData[0].id; // Get the generated meditation ID
        // Decrement user's credits by 1
        const { data: updateData, error: updateError } = await supabase
          .schema('next_auth')
          .from('users')
          .update({ credits: availableCredits - 1 })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating user credits:', updateError);
          // You may want to handle this error differently, depending on your requirements
        }
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