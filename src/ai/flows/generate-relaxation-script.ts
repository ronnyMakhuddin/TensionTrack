'use server';

/**
 * @fileOverview Generates a relaxation script based on a theme.
 *
 * - generateRelaxationScript - A function that generates a relaxation script.
 * - GenerateRelaxationScriptInput - The input type for the generateRelaxationScript function.
 * - GenerateRelaxationScriptOutput - The return type for the generateRelaxationScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRelaxationScriptInputSchema = z.object({
  theme: z.string().describe('The theme for the relaxation script, e.g., "a calm beach" or "a peaceful forest".'),
});
export type GenerateRelaxationScriptInput = z.infer<typeof GenerateRelaxationScriptInputSchema>;

const GenerateRelaxationScriptOutputSchema = z.object({
  script: z.string().describe('The generated relaxation script.'),
});
export type GenerateRelaxationScriptOutput = z.infer<typeof GenerateRelaxationScriptOutputSchema>;

export async function generateRelaxationScript(
  input: GenerateRelaxationScriptInput
): Promise<GenerateRelaxationScriptOutput> {
  return generateRelaxationScriptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRelaxationScriptPrompt',
  input: {schema: GenerateRelaxationScriptInputSchema},
  output: {schema: GenerateRelaxationScriptOutputSchema},
  prompt: `Anda adalah penulis skrip berbakat yang berspesialisasi dalam membuat visualisasi terpandu yang menenangkan dan skrip relaksasi.

Buat skrip singkat (sekitar 150-200 kata) berdasarkan tema yang diberikan oleh pengguna. Skrip harus deskriptif, menenangkan, dan menggunakan bahasa yang menenangkan. Mulailah dengan ajakan lembut untuk rileks dan akhiri dengan catatan positif.

Tema: {{{theme}}}
`,
});

const generateRelaxationScriptFlow = ai.defineFlow(
  {
    name: 'generateRelaxationScriptFlow',
    inputSchema: GenerateRelaxationScriptInputSchema,
    outputSchema: GenerateRelaxationScriptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
