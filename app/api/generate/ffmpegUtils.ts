// ffmpegUtils.ts

import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Setting the ffmpeg and ffprobe paths
ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH || '');
ffmpeg.setFfprobePath(process.env.FFPROBE_PATH || '');

console.log('Using ffmpeg at:', process.env.FFMPEG_PATH);
console.log('Using ffprobe at:', process.env.FFPROBE_PATH);

// Helper function to get the duration of an audio file
export const getAudioDuration = async (audioFilePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(audioFilePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        const durationSecs = metadata.format.duration as number;
        const minutes = Math.floor(durationSecs / 60);
        const seconds = Math.floor(durationSecs % 60);
        const formattedDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        resolve(formattedDuration);
      }
    });
  });
};

export const generateSilentAudio = async (pauseLengthMs: number, silentAudioPath: string) => {
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
};

export const concatenateAudioFiles = async (audioFiles: string[], silentAudioPath: string, outputFilePath: string) => {
  return new Promise((resolve, reject) => {
    // Create a temporary concat file to describe the concatenation process for ffmpeg
    const concatFilePath = path.join(os.tmpdir(), 'concat.txt');
    const concatContent = audioFiles.map((file, index) => {
      return `file '${path.resolve(file)}'\n` +
        (index < audioFiles.length - 1 ? `file '${path.resolve(silentAudioPath)}'\n` : '');
    }).join('');
    fs.writeFileSync(concatFilePath, concatContent);

    ffmpeg()
      .input(concatFilePath)
      .inputOptions(['-f', 'concat', '-safe', '0'])
      .outputOptions(['-acodec', 'libmp3lame', '-ar', '44100', '-ac', '2', '-b:a', '192k']) // Re-encode to ensure all files are uniform
      .output(outputFilePath)
      .on('end', () => {
        fs.unlinkSync(concatFilePath); // Clean up temporary files
        console.log('Concatenation complete.');
        resolve(true);
      })
      .on('error', (err) => {
        fs.unlinkSync(concatFilePath); // Clean up even on error
        console.error('Error during concatenation:', err);
        reject(err);
      })
      .run();
  });
};