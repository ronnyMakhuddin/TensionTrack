'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ActivityAdviceInputSchema = z.object({
  activityHistory: z.string().describe('Riwayat aktivitas pengguna dalam format yang mudah dibaca'),
  activityTypes: z.array(z.string()).describe('Jenis-jenis aktivitas yang dilakukan pengguna'),
  unhealthyHabits: z.array(z.string()).describe('Kebiasaan tidak sehat yang dilakukan pengguna'),
  healthConditions: z.string().describe('Kondisi kesehatan yang mempengaruhi aktivitas'),
  lifestyleFactors: z.string().describe('Faktor gaya hidup yang mempengaruhi aktivitas'),
  bloodPressureReadings: z.string().describe('Riwayat tekanan darah pengguna'),
});

export type ActivityAdviceInput = z.infer<typeof ActivityAdviceInputSchema>;

const ActivityAdviceOutputSchema = z.object({
  activityAssessment: z.string().describe('Penilaian pola aktivitas pengguna'),
  healthImpact: z.object({
    positive: z.array(z.string()).describe('Dampak positif dari aktivitas yang dilakukan'),
    negative: z.array(z.string()).describe('Dampak negatif dari aktivitas yang dilakukan'),
  }),
  recommendations: z.object({
    increase: z.array(z.string()).describe('Aktivitas yang perlu ditingkatkan'),
    reduce: z.array(z.string()).describe('Aktivitas yang perlu dikurangi'),
    replace: z.array(z.string()).describe('Aktivitas pengganti yang lebih sehat'),
  }),
  specificAdvice: z.object({
    smoking: z.string().optional().describe('Saran khusus untuk merokok'),
    alcohol: z.string().optional().describe('Saran khusus untuk konsumsi alkohol'),
    exercise: z.string().optional().describe('Saran khusus untuk olahraga'),
    stress: z.string().optional().describe('Saran khusus untuk manajemen stres'),
  }),
  warningSigns: z.array(z.string()).describe('Tanda-tanda masalah kesehatan yang perlu diperhatikan'),
  motivationTips: z.array(z.string()).describe('Tips motivasi untuk perubahan gaya hidup'),
});

export type ActivityAdviceOutput = z.infer<typeof ActivityAdviceOutputSchema>;

export async function activityAdvice(
  input: ActivityAdviceInput
): Promise<ActivityAdviceOutput> {
  return activityAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'activityAdvicePrompt',
  input: { schema: ActivityAdviceInputSchema },
  output: { schema: ActivityAdviceOutputSchema },
  prompt: `Anda adalah ahli kesehatan yang membantu memberikan saran untuk mengoptimalkan pola aktivitas dan gaya hidup.

Berdasarkan data aktivitas pengguna, berikan penilaian dan rekomendasi yang dapat ditindaklanjuti untuk meningkatkan kesehatan mereka, dengan fokus khusus pada pengelolaan hipertensi.

Data Pengguna:
- Riwayat Aktivitas: {{{activityHistory}}}
- Jenis Aktivitas: {{{activityTypes}}}
- Kebiasaan Tidak Sehat: {{{unhealthyHabits}}}
- Kondisi Kesehatan: {{{healthConditions}}}
- Faktor Gaya Hidup: {{{lifestyleFactors}}}
- Riwayat Tekanan Darah: {{{bloodPressureReadings}}}

Berikan saran yang:
1. Mengidentifikasi dampak positif dan negatif dari setiap aktivitas
2. Memberikan rekomendasi spesifik untuk aktivitas yang perlu ditingkatkan/dikurangi
3. Menyarankan aktivitas pengganti yang lebih sehat
4. Memberikan saran khusus untuk kebiasaan tidak sehat (merokok, alkohol, dll)
5. Mempertimbangkan kondisi hipertensi dalam rekomendasi
6. Memberikan tips motivasi untuk perubahan gaya hidup
7. Mengidentifikasi tanda-tanda masalah kesehatan yang perlu diperhatikan

Gunakan bahasa yang mudah dipahami dan berikan rekomendasi yang praktis untuk kehidupan sehari-hari.`,
});

const activityAdviceFlow = ai.defineFlow(
  {
    name: 'activityAdviceFlow',
    inputSchema: ActivityAdviceInputSchema,
    outputSchema: ActivityAdviceOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
); 