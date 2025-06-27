'use server';

/**
 * @fileOverview Generates relaxation audio from a script.
 *
 * - relaxationAudio - A function that generates relaxation audio.
 * - RelaxationAudioOutput - The return type for the relaxationAudio function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const RelaxationAudioOutputSchema = z.object({
  media: z.string().describe("The generated audio as a data URI in WAV format."),
});
export type RelaxationAudioOutput = z.infer<typeof RelaxationAudioOutputSchema>;

export async function relaxationAudio(script: string): Promise<RelaxationAudioOutput> {
  return relaxationAudioFlow(script);
}

const relaxationAudioFlow = ai.defineFlow(
  {
    name: 'relaxationAudioFlow',
    inputSchema: z.string(),
    outputSchema: RelaxationAudioOutputSchema,
  },
  async (query) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: query,
    });

    if (!media) {
      throw new Error('No media returned from TTS model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
