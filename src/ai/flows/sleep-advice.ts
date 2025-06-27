'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SleepAdviceInputSchema = z.object({
  sleepHistory: z.string().describe('Riwayat tidur pengguna dalam format yang mudah dibaca'),
  averageSleepDuration: z.number().describe('Rata-rata durasi tidur dalam jam'),
  sleepQuality: z.string().describe('Kualitas tidur yang dilaporkan pengguna'),
  healthConditions: z.string().describe('Kondisi kesehatan yang mempengaruhi tidur'),
  lifestyleFactors: z.string().describe('Faktor gaya hidup yang mempengaruhi tidur'),
});

export type SleepAdviceInput = z.infer<typeof SleepAdviceInputSchema>;

const SleepAdviceOutputSchema = z.object({
  sleepAssessment: z.string().describe('Penilaian kualitas tidur pengguna'),
  recommendations: z.array(z.string()).describe('Rekomendasi untuk meningkatkan kualitas tidur'),
  sleepHygieneTips: z.array(z.string()).describe('Tips kebersihan tidur yang spesifik'),
  suggestedSleepDuration: z.object({
    min: z.number().describe('Durasi tidur minimal yang disarankan dalam jam'),
    max: z.number().describe('Durasi tidur maksimal yang disarankan dalam jam'),
    optimal: z.number().describe('Durasi tidur optimal yang disarankan dalam jam'),
  }),
  warningSigns: z.array(z.string()).describe('Tanda-tanda masalah tidur yang perlu diperhatikan'),
});

export type SleepAdviceOutput = z.infer<typeof SleepAdviceOutputSchema>;

export async function sleepAdvice(
  input: SleepAdviceInput
): Promise<SleepAdviceOutput> {
  return sleepAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'sleepAdvicePrompt',
  input: { schema: SleepAdviceInputSchema },
  output: { schema: SleepAdviceOutputSchema },
  prompt: `Anda adalah ahli tidur yang membantu memberikan saran untuk meningkatkan kualitas tidur.

Berdasarkan data tidur pengguna, berikan penilaian dan rekomendasi yang dapat ditindaklanjuti untuk mengoptimalkan pola tidur mereka.

Data Pengguna:
- Riwayat Tidur: {{{sleepHistory}}}
- Rata-rata Durasi: {{{averageSleepDuration}}} jam
- Kualitas Tidur: {{{sleepQuality}}}
- Kondisi Kesehatan: {{{healthConditions}}}
- Faktor Gaya Hidup: {{{lifestyleFactors}}}

Berikan saran yang:
1. Spesifik dan dapat diterapkan
2. Mempertimbangkan kondisi kesehatan pengguna
3. Fokus pada kebersihan tidur yang baik
4. Memberikan target durasi tidur yang realistis
5. Mengidentifikasi tanda-tanda masalah tidur yang perlu diperhatikan

Gunakan bahasa yang mudah dipahami dan berikan rekomendasi yang praktis untuk kehidupan sehari-hari.`,
});

const sleepAdviceFlow = ai.defineFlow(
  {
    name: 'sleepAdviceFlow',
    inputSchema: SleepAdviceInputSchema,
    outputSchema: SleepAdviceOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
); 