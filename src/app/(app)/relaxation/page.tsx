"use client";

import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wind, BrainCircuit, Music } from "lucide-react";

const techniques = [
  {
    icon: Wind,
    title: "Pernapasan Diafragma (Pernapasan Perut)",
    description: "Teknik ini membantu memperlambat detak jantung dan menstabilkan tekanan darah. Ini adalah salah satu cara termudah untuk mulai mengurangi stres.",
    steps: [
      "Duduk atau berbaring dengan nyaman.",
      "Letakkan satu tangan di dada dan tangan lainnya di perut Anda.",
      "Tarik napas perlahan melalui hidung, rasakan perut Anda mengembang. Usahakan dada tetap diam.",
      "Hembuskan napas perlahan melalui mulut. Rasakan perut Anda mengempis.",
      "Ulangi selama 5-10 menit setiap hari.",
    ],
  },
  {
    icon: BrainCircuit,
    title: "Meditasi Mindfulness",
    description: "Mindfulness membantu Anda fokus pada saat ini dan mengurangi pikiran yang cemas. Ini melatih pikiran Anda untuk menjadi lebih tenang.",
    steps: [
      "Cari tempat yang tenang di mana Anda tidak akan terganggu.",
      "Duduk dengan nyaman dengan punggung lurus.",
      "Pejamkan mata Anda dan fokus pada sensasi napas Anda saat masuk dan keluar.",
      "Jika pikiran Anda mengembara, dengan lembut kembalikan perhatian Anda ke napas Anda.",
      "Mulailah dengan 5 menit sehari dan secara bertahap tingkatkan durasinya.",
    ],
  },
];

const relaxationAudios = [
  {
    title: "Suara Hutan yang Menenangkan",
    description: "Dengarkan suara alam dari hutan yang lebat untuk menenangkan pikiran Anda.",
    src: "https://cdn.pixabay.com/audio/2022/10/18/audio_b2a7516e34.mp3",
  },
  {
    title: "Aliran Sungai yang Tenang",
    description: "Biarkan suara gemericik air sungai membawa Anda ke keadaan rileks.",
    src: "https://cdn.pixabay.com/audio/2022/08/17/audio_34b0f31908.mp3",
  },
  {
    title: "Ombak Laut yang Lembut",
    description: "Suara ombak yang berirama di pantai dapat membantu mengurangi stres dan kecemasan.",
    src: "https://cdn.pixabay.com/audio/2024/05/27/audio_1679720d20.mp3",
  },
];


export default function RelaxationPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengelolaan Stres"
        description="Temukan teknik untuk membantu Anda rileks dan tenang."
      />
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {techniques.map((technique) => (
          <Card key={technique.title}>
            <CardHeader>
               <div className="flex items-center gap-4">
                <technique.icon className="h-8 w-8 text-primary" />
                <CardTitle>{technique.title}</CardTitle>
              </div>
              <CardDescription>{technique.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
                {technique.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Music className="h-8 w-8 text-primary" />
            <CardTitle>Audio Relaksasi</CardTitle>
          </div>
          <CardDescription>Dengarkan suara yang menenangkan ini untuk membantu Anda rileks.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {relaxationAudios.map((audio) => (
              <div key={audio.title} className="p-4 border rounded-lg bg-background flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-grow">
                  <p className="font-medium">{audio.title}</p>
                  <p className="text-sm text-muted-foreground">{audio.description}</p>
                </div>
                <audio controls src={audio.src} className="w-full sm:w-[300px]">
                  Browser Anda tidak mendukung elemen audio.
                </audio>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
