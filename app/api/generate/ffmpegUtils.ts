// ffmpegUtils.ts

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

// Helper function to get the duration of an audio file
export const getAudioDuration = async (audioFilePath: string): Promise<string> => {
    await ffmpeg.load();
    await ffmpeg.writeFile(audioFilePath, await fetchFile(audioFilePath));
  
    return new Promise((resolve, reject) => {
      let durationOutput = '';
      ffmpeg.on('log', (log) => {
        durationOutput += log.message;
      });
  
      ffmpeg.exec(['-i', audioFilePath, '-f', 'null', '-']).then(() => {
        const durationRegex = /Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/;
        const match = durationOutput.match(durationRegex);
        if (match) {
          const [, hours, minutes, seconds] = match;
          const formattedDuration = `${hours}:${minutes}:${seconds.split('.')[0]}`;
          resolve(formattedDuration);
        } else {
          reject(new Error('Unable to determine audio duration'));
        }
      }).catch((error) => {
        reject(error);
      });
    });
  };

export const generateSilentAudio = async (pauseLengthMs: number, silentAudioPath: string): Promise<void> => {
  await ffmpeg.load();
  await ffmpeg.exec([
    '-f', 'lavfi',
    '-i', `anullsrc=r=44100:cl=stereo`,
    '-t', `${pauseLengthMs / 1000}`,
    '-acodec', 'libmp3lame',
    silentAudioPath,
  ]);
};

export const concatenateAudioFiles = async (audioFiles: string[], silentAudioPath: string, outputFilePath: string): Promise<void> => {
  await ffmpeg.load();

  // Write audio files and silent audio file to ffmpeg's virtual filesystem
  for (const audioFile of audioFiles) {
    await ffmpeg.writeFile(audioFile, await fetchFile(audioFile));
  }
  await ffmpeg.writeFile(silentAudioPath, await fetchFile(silentAudioPath));

  // Create the concat list file
  let concatList = '';
  for (let i = 0; i < audioFiles.length; i++) {
    concatList += `file '${audioFiles[i]}'\n`;
    if (i < audioFiles.length - 1) {
      concatList += `file '${silentAudioPath}'\n`;
    }
  }
  await ffmpeg.writeFile('concat.txt', concatList);

  // Perform the concatenation
  await ffmpeg.exec([
    '-f', 'concat',
    '-safe', '0',
    '-i', 'concat.txt',
    '-acodec', 'libmp3lame',
    '-ar', '44100',
    '-ac', '2',
    '-b:a', '192k',
    outputFilePath,
  ]);
};