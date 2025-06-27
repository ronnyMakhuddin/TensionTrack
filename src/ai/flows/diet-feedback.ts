'use server';

/**
 * @fileOverview Memberikan umpan balik tentang catatan diet untuk manajemen hipertensi.
 *
 * - dietFeedback - Fungsi yang menghasilkan umpan balik diet.
 * - DietFeedbackInput - Tipe input untuk fungsi dietFeedback.
 * - DietFeedbackOutput - Tipe output untuk fungsi dietFeedback.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DietFeedbackInputSchema = z.object({
  foodLogs: z
    .string()
    .describe(
      'Daftar makanan yang dicatat oleh pengguna, dipisahkan oleh baris baru.'
    ),
});
export type DietFeedbackInput = z.infer<typeof DietFeedbackInputSchema>;

const DietFeedbackOutputSchema = z.object({
  feedback: z
    .string()
    .describe(
      'Umpan balik yang membangun dan dapat ditindaklanjuti tentang kualitas diet pengguna untuk manajemen hipertensi.'
    ),
});
export type DietFeedbackOutput = z.infer<typeof DietFeedbackOutputSchema>;

export async function dietFeedback(
  input: DietFeedbackInput
): Promise<DietFeedbackOutput> {
  return dietFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dietFeedbackPrompt',
  input: {schema: DietFeedbackInputSchema},
  output: {schema: DietFeedbackOutputSchema},
  prompt: `Anda adalah seorang ahli gizi yang berspesialisasi dalam membantu pasien mengelola hipertensi melalui diet.

  Analisis catatan makanan berikut yang disediakan oleh pengguna. Berikan umpan balik yang membangun, mendukung, dan dapat ditindaklanjuti.

  Fokus pada:
  1.  Identifikasi pilihan makanan yang baik (misalnya, kaya kalium, rendah natrium).
  2.  Identifikasi area untuk perbaikan (misalnya, makanan tinggi natrium, makanan olahan).
  3.  Berikan saran spesifik untuk penggantian atau modifikasi yang lebih sehat.
  4.  Jaga agar nada tetap positif dan memotivasi. Hindari membuat pengguna merasa bersalah.
  5.  Format umpan balik dengan poin-poin agar mudah dibaca.

  Catatan Makanan Pengguna:
  {{{foodLogs}}}
`,
});

const dietFeedbackFlow = ai.defineFlow(
  {
    name: 'dietFeedbackFlow',
    inputSchema: DietFeedbackInputSchema,
    outputSchema: DietFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
