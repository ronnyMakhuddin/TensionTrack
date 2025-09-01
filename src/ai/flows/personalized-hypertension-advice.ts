'use server';

/**
 * @fileOverview Provides personalized advice for hypertension management based on lifestyle data.
 *
 * - personalizedHypertensionAdvice - A function that generates personalized advice for managing hypertension.
 * - PersonalizedHypertensionAdviceInput - The input type for the personalizedHypertensionAdvice function.
 * - PersonalizedHypertensionAdviceOutput - The return type for the personalizedHypertensionAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedHypertensionAdviceInputSchema = z.object({
  healthHistory: z
    .string()
    .describe('Deskripsi riwayat kesehatan pengguna.'),
  dietData: z
    .string()
    .describe(
      'Deskripsi diet pengguna, termasuk makanan dan camilan khas.'
    ),
  activityLevel: z
    .string()
    .describe(
      'Deskripsi aktivitas harian khas pengguna, termasuk olahraga.'
    ),
  stressLevels: z
    .string()
    .describe('Deskripsi tingkat stres khas pengguna dan mekanisme koping.'),
  bloodPressureReadings: z
    .string()
    .describe('Deskripsi pembacaan tekanan darah pengguna baru-baru ini.'),
});
export type PersonalizedHypertensionAdviceInput = z.infer<
  typeof PersonalizedHypertensionAdviceInputSchema
>;

const PersonalizedHypertensionAdviceOutputSchema = z.object({
  advice: z
    .string()
    .describe(
      'Rekomendasi yang dipersonalisasi dan dapat ditindaklanjuti untuk mengelola hipertensi berdasarkan data gaya hidup yang diberikan.'
    ),
  suggestedStepGoal: z
    .number()
    .describe('Target langkah harian yang disarankan untuk pengguna.'),
  suggestedDurationGoal: z
    .number()
    .describe(
      'Target durasi aktivitas harian (dalam menit) yang disarankan untuk pengguna.'
    ),
});
export type PersonalizedHypertensionAdviceOutput = z.infer<
  typeof PersonalizedHypertensionAdviceOutputSchema
>;

export async function personalizedHypertensionAdvice(
  input: PersonalizedHypertensionAdviceInput
): Promise<PersonalizedHypertensionAdviceOutput> {
  return personalizedHypertensionAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedHypertensionAdvicePrompt',
  input: {schema: PersonalizedHypertensionAdviceInputSchema},
  output: {schema: PersonalizedHypertensionAdviceOutputSchema},
  prompt: `Anda adalah asisten AI yang membantu memberikan saran yang dipersonalisasi untuk mengelola hipertensi.

  Berdasarkan data gaya hidup pengguna, termasuk riwayat kesehatan, diet, tingkat aktivitas, tingkat stres, dan pembacaan tekanan darah, berikan rekomendasi yang dapat ditindaklanjuti untuk mengelola hipertensi mereka.

  Riwayat Kesehatan: {{{healthHistory}}}
  Data Diet: {{{dietData}}}
  Tingkat Aktivitas: {{{activityLevel}}}
  Tingkat Stres: {{{stressLevels}}}
  Pembacaan Tekanan Darah: {{{bloodPressureReadings}}}

  Berikan rekomendasi yang jelas, ringkas, dan dapat ditindaklanjuti yang dapat dengan mudah diterapkan pengguna dalam kehidupan sehari-hari mereka.
  Selain itu, berikan target tantangan harian yang dipersonalisasi. Sarankan jumlah langkah harian (suggestedStepGoal) dan durasi aktivitas harian dalam menit (suggestedDurationGoal) yang sesuai. Target harus realistis dan dapat dicapai untuk pengguna, dengan mempertimbangkan tingkat aktivitas mereka saat ini. Jika pengguna sudah sangat aktif, berikan tantangan yang sesuai. Jika mereka tidak aktif, mulailah dengan target yang lebih kecil.
`,
});

const personalizedHypertensionAdviceFlow = ai.defineFlow(
  {
    name: 'personalizedHypertensionAdviceFlow',
    inputSchema: PersonalizedHypertensionAdviceInputSchema,
    outputSchema: PersonalizedHypertensionAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
