import type { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import OpenAI from "openai";
import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';
import { ElevenLabsClient, play } from "elevenlabs";
//import ffmpeg from 'ffmpeg-static';
import ffmpegPath from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createClient } from '@supabase/supabase-js';

// Setting the ffmpeg and ffprobe paths
ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH || '');
ffmpeg.setFfprobePath(process.env.FFPROBE_PATH || '');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

console.log('Using ffmpeg at:', process.env.FFMPEG_PATH);
console.log('Using ffprobe at:', process.env.FFPROBE_PATH);

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
  const { aiProvider, duration, guidanceLevel, ttsProvider, voice } = await req.json();

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
    Your task is to create a script for a ${averageDuration} minutes guided meditation session focusing on mindfulness and breath control.
    The meditation should have ${sectionCount} sections and ${pauseCount} pauses total. Please follow these specific guidelines:
    1. The script should be ${charCount} characters long to align with the ${averageDuration} minutes duration of the session.
    2. Include a total of ${pauseCount} '---PAUSE---' markers at carefully considered transition points to create periods of silent reflection or focused breathing exercises.
    These pauses are crucial for the meditation's structure and flow. There should be a total of ${pauseCount} '---PAUSE---' markers. One for each pause.
    3. Before each '---PAUSE---' marker, gently guide the listener into the pause using phrases that encourage a smooth transition.
    For example:
    - 'Let's now gently turn our attention to our breath, allowing ourselves to fully experience the rhythm of each inhale and exhale.'
    - 'At this moment, let's simply be with our breath, feeling the calmness with each breath cycle.'
    These guiding phrases should serve as soft introductions to the '---PAUSE---' markers, ensuring participants are thoughtfully led into each pause without abruptness.
    4. Use simple, clear, and approachable language throughout the script to make the meditation accessible, engaging and relaxing for everyone.
    5. The output should only contain the meditation script, without any additional commentary.
    6. The script should provide '${guidanceLevel}' level guidance, adjust the depth of instructions to guide the listener accordingly.
    7. The final section will gently conclude the session, guiding towards reawakening and reconnection with the surroundings. This closing section should include instructions for slowly opening the eyes, feeling the body, and becoming aware of the sounds and sensations in the environment, signaling the end of the meditation.
    Remember, the script's strict adherence to the ${charCount} character count, it should be ${sectionCount} sections total, and the strategic placement of ${pauseCount} '---PAUSE---' markers with gentle introductory phrases are essential for creating an impactful and seamless meditation experience.
  `;

  try {
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

    // Generate and concatenate meditation audio files with pauses
    const segments = meditationScript.split('---PAUSE---');
    const meditationsDir = path.join(process.cwd(), 'public', 'meditations');
    await fs.promises.mkdir(meditationsDir, { recursive: true });

    const audioFiles = [];
    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        const audioFileName = `segment-${i}-${Date.now()}.mp3`;
        const audioFilePath = path.join(meditationsDir, audioFileName);

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
                output_format: "mp3",
            });
            await fs.promises.writeFile(audioFilePath, audio);
        } else {
            throw new Error('Invalid TTS provider');
        }
        audioFiles.push(audioFilePath as never);
    }

    // Generate a silent audio file to use as a pause in MP3 format
    const silentAudioPath = path.join(meditationsDir, 'silent.mp3');
    await new Promise((resolve, reject) => {
        ffmpeg()
            .input('anullsrc') // Use anullsrc for generating silence
            .inputFormat('lavfi') // Specify lavfi as the input format
            .audioChannels(2) // Set to stereo
            .audioFrequency(44100) // Use a standard frequency for MP3 files
            .duration(pauseLengthMs / 1000) // Set the duration of silence
            .output(silentAudioPath)
            .audioCodec('libmp3lame') // Use the libmp3lame codec for MP3
            .on('end', () => {
                console.log('Silent audio file generated.');
                resolve(true);
            })
            .on('error', (err) => {
                console.error('Error generating silent audio:', err);
                reject(err);
            })
            .run();
    });


    // Concatenation using fluent-ffmpeg with re-encoding
    const outputFileName = `output-${Date.now()}.mp3`;
    const outputFilePath = path.join(meditationsDir, outputFileName);

    // Create a temporary concat file to describe the concatenation process for ffmpeg
    const concatFilePath = path.join(meditationsDir, 'concat.txt');
    const concatContent = audioFiles.map((file, index) => {
        return `file '${path.resolve(file)}'\n` + 
              (index < audioFiles.length - 1 ? `file '${path.resolve(silentAudioPath)}'\n` : '');
    }).join('');
    fs.writeFileSync(concatFilePath, concatContent);

    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(concatFilePath)
            .inputOptions(['-f', 'concat', '-safe', '0'])
            .outputOptions(['-acodec', 'libmp3lame', '-ar', '44100', '-ac', '2', '-b:a', '192k'])  // Re-encode to ensure all files are uniform
            .output(outputFilePath)
            .on('end', async () => {
              fs.unlinkSync(concatFilePath);  // Clean up temporary files
              console.log('Concatenation complete.');
          
              // Read the file into a Buffer
              const fileBuffer = fs.readFileSync(outputFilePath);
          
              // Upload the file to Supabase
              const { data, error } = await supabase.storage.from('meditations').upload(outputFileName, fileBuffer);
              if (error) {
                  console.error('Error uploading file to Supabase:', error);
                  reject(NextResponse.json({ error: 'Failed to upload meditation to Supabase. Please try again.' }, { status: 500 }));
              } else {
                  console.log('File uploaded to Supabase:', data);
                  resolve(NextResponse.json({ audioUrl: `/meditations/${outputFileName}` }));
              }
          })
            .on('error', (err) => {
                fs.unlinkSync(concatFilePath);  // Clean up even on error
                console.error('Error during concatenation:', err);
                reject(NextResponse.json({ error: 'Failed to generate meditation. Please try again.' }, { status: 500 }));
            })
        .run();
    });

} catch (error) {
    console.error('Error generating meditation:', error);
    return NextResponse.json({ error: 'Failed to generate meditation. Please try again.' }, { status: 500 });
}
}