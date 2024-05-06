//'use client';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg: FFmpeg;

const loadFFmpeg = async () => {
  console.log('Loading FFmpeg...');
  ffmpeg = new FFmpeg();
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';
  try {
    await ffmpeg.load({
      coreURL: `${baseURL}/ffmpeg-core.js`,
      wasmURL: `${baseURL}/ffmpeg-core.wasm`,
    });
    console.log('FFmpeg loaded successfully');
  } catch (error) {
    console.error('Error loading FFmpeg:', error);
    throw error;
  }
};

export const getAudioDuration = async (audioFilePath: string) => {
  console.log('Getting audio duration...');
  console.log('Audio file path:', audioFilePath);

  if (!ffmpeg) {
    console.log('FFmpeg not loaded. Loading FFmpeg...');
    await loadFFmpeg();
  }

  try {
    console.log('Writing input audio file to FFmpeg virtual file system...');
    await ffmpeg.writeFile('input.mp3', await fetchFile(audioFilePath));
    console.log('Input audio file written to FFmpeg virtual file system');

    console.log('Executing FFmpeg command to get audio duration...');
    const output = await ffmpeg.exec([
      '-i',
      'input.mp3',
      '-f',
      'null',
      '-v',
      'error',
      '-select_streams',
      'a:0',
      '-show_entries',
      'stream=duration',
      '-of',
      'default=noprint_wrappers=1:nokey=1',
    ]);
    console.log('FFmpeg command executed successfully');
    console.log('FFmpeg output:', output);

    const durationSecs = parseFloat(output.toString());
    console.log('Duration in seconds:', durationSecs);

    const minutes = Math.floor(durationSecs / 60);
    const seconds = Math.floor(durationSecs % 60);
    const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    console.log(`Audio duration: ${formattedDuration}`);
    return formattedDuration;
  } catch (error) {
    console.error('Error getting audio duration:', error);
    throw error;
  }
};

export const generateSilentAudio = async (pauseLengthMs: number, silentAudioPath: string) => {
  console.log('Generating silent audio...');
  console.log('Pause length (ms):', pauseLengthMs);
  console.log('Silent audio file path:', silentAudioPath);

  if (!ffmpeg) {
    console.log('FFmpeg not loaded. Loading FFmpeg...');
    await loadFFmpeg();
  }

  try {
    console.log('Executing FFmpeg command to generate silent audio...');
    await ffmpeg.exec([
      '-f',
      'lavfi',
      '-i',
      'anullsrc=r=44100:cl=stereo',
      '-t',
      `${pauseLengthMs / 1000}`,
      '-acodec',
      'libmp3lame',
      '-ar',
      '44100',
      '-ac',
      '2',
      '-b:a',
      '192k',
      silentAudioPath,
    ]);
    console.log('Silent audio file generated successfully');
  } catch (error) {
    console.error('Error generating silent audio:', error);
    throw error;
  }
};

export const concatenateAudioFiles = async (audioFiles: string[], silentAudioPath: string, outputFilePath: string) => {
  console.log('Concatenating audio files...');
  console.log('Audio files:', audioFiles);
  console.log('Silent audio file path:', silentAudioPath);
  console.log('Output file path:', outputFilePath);

  if (!ffmpeg) {
    console.log('FFmpeg not loaded. Loading FFmpeg...');
    await loadFFmpeg();
  }

  try {
    console.log('Writing input audio files to FFmpeg virtual file system...');
    for (const file of audioFiles) {
      await ffmpeg.writeFile(`input_${audioFiles.indexOf(file)}.mp3`, await fetchFile(file));
    }
    console.log('Input audio files written to FFmpeg virtual file system');

    console.log('Writing silent audio file to FFmpeg virtual file system...');
    await ffmpeg.writeFile('silent.mp3', await fetchFile(silentAudioPath));
    console.log('Silent audio file written to FFmpeg virtual file system');

    console.log('Creating concatenation list file...');
    const concatList = audioFiles.map((file, index) => `file 'input_${index}.mp3'`).join('\n') +
      `\nfile 'silent.mp3'\n`.repeat(audioFiles.length - 1);
    await ffmpeg.writeFile('concat.txt', new TextEncoder().encode(concatList));
    console.log('Concatenation list file created');

    console.log('Executing FFmpeg command to concatenate audio files...');
    await ffmpeg.exec([
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      'concat.txt',
      '-acodec',
      'libmp3lame',
      '-ar',
      '44100',
      '-ac',
      '2',
      '-b:a',
      '192k',
      outputFilePath,
    ]);
    console.log('Audio files concatenated successfully');
  } catch (error) {
    console.error('Error concatenating audio files:', error);
    throw error;
  }
};