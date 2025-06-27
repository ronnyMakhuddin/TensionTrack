'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BehaviorChangePlanInputSchema = z.object({
  patientProfile: z.any().optional().describe('Data profil pasien'),
  bpReadings: z.array(z.any()).describe('Riwayat tekanan darah'),
  activityLogs: z.array(z.any()).describe('Riwayat aktivitas'),
  sleepLogs: z.array(z.any()).describe('Riwayat tidur'),
  exerciseLogs: z.array(z.any()).describe('Riwayat latihan'),
  foodLogs: z.array(z.any()).describe('Riwayat makanan'),
  healthScore: z.number().describe('Health score pasien'),
  healthTrend: z.enum(['improving', 'declining', 'stable']).describe('Trend kesehatan'),
});

const BehaviorChangePlanOutputSchema = z.object({
  plan: z.string().describe('Plan perubahan perilaku yang terstruktur'),
});

export type BehaviorChangePlanInput = z.infer<typeof BehaviorChangePlanInputSchema>;
export type BehaviorChangePlanOutput = z.infer<typeof BehaviorChangePlanOutputSchema>;

export async function generateBehaviorChangePlan(input: BehaviorChangePlanInput): Promise<string> {
  const result = await behaviorChangePlanFlow(input);
  return result.plan;
}

const prompt = ai.definePrompt({
  name: 'behaviorChangePlanPrompt',
  input: { schema: BehaviorChangePlanInputSchema },
  output: { schema: BehaviorChangePlanOutputSchema },
  prompt: `Sebagai Ners Counselor yang ahli dalam manajemen hipertensi, buatkan plan perubahan perilaku yang personal dan terstruktur untuk pasien.

INFORMASI PASIEN:
- Nama: {{{patientProfile.name}}}
- Usia: {{{patientProfile.birthDate}}}
- Gender: {{{patientProfile.gender}}}

DATA KESEHATAN:
- Health Score: {{{healthScore}}}% 
- Trend: {{{healthTrend}}}
- Riwayat Tekanan Darah: {{{bpReadings}}}
- Riwayat Aktivitas: {{{activityLogs}}}
- Riwayat Tidur: {{{sleepLogs}}}
- Riwayat Latihan: {{{exerciseLogs}}}
- Riwayat Makanan: {{{foodLogs}}}

Buatkan plan perubahan perilaku yang:
1. SPESIFIK - dengan target yang jelas dan terukur
2. REALISTIS - sesuai dengan kondisi pasien
3. TERSTRUKTUR - dengan timeline dan prioritas
4. PERSONAL - berdasarkan data pasien
5. BERKELANJUTAN - dengan strategi maintenance

Format plan:
📋 PLAN PERUBAHAN PERILAKU
[Tanggal: {{currentDate}}]

🎯 TUJUAN UTAMA:
[3-5 tujuan utama berdasarkan analisis data]

📅 TIMELINE 30 HARI:
Minggu 1: [Fokus utama]
Minggu 2: [Fokus utama] 
Minggu 3: [Fokus utama]
Minggu 4: [Fokus utama]

📊 TARGET SPESIFIK:
- Tekanan Darah: [target spesifik]
- Aktivitas: [target spesifik]
- Tidur: [target spesifik]
- Latihan: [target spesifik]

💡 STRATEGI IMPLEMENTASI:
[5-7 strategi konkret]

⚠️ HALANGAN & SOLUSI:
[Identifikasi halangan dan solusi]

📈 MONITORING & EVALUASI:
[Cara monitoring progress]

🔔 REMINDER & MOTIVASI:
[Pesan motivasi dan reminder]

Buat plan yang detail, praktis, dan mudah diikuti oleh pasien.`,
});

const behaviorChangePlanFlow = ai.defineFlow(
  {
    name: 'behaviorChangePlanFlow',
    inputSchema: BehaviorChangePlanInputSchema,
    outputSchema: BehaviorChangePlanOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
); 