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
  {
    icon: Music,
    title: "Terapi Suara Alam",
    description: "Mendengarkan suara alam dapat membantu menenangkan sistem saraf dan mengurangi stres.",
    steps: [
      "Pilih audio relaksasi yang sesuai dengan suasana hati Anda.",
      "Cari tempat yang nyaman dan tenang.",
      "Pejamkan mata dan fokus pada suara yang Anda dengarkan.",
      "Biarkan pikiran Anda mengikuti alur suara tanpa memikirkan hal lain.",
      "Lakukan selama 10-15 menit untuk hasil optimal.",
    ],
  },
];

const relaxationAudios = [
  {
    title: "Suara Hutan yang Menenangkan",
    description: "Dengarkan suara alam dari hutan yang lebat untuk menenangkan pikiran Anda.",
    src: "/audio/forest.mp3",
    youtubeId: "OdIJ2x3nxzQ",
  },
  {
    title: "Hujan Rintik-rintik",
    description: "Suara hujan yang lembut dapat menciptakan suasana tenang dan nyaman.",
    src: "/audio/rain.mp3",
    youtubeId: "mPZkdNFkNps",
  },
  {
    title: "Kicauan Burung Pagi",
    description: "Dengarkan kicauan burung yang merdu untuk memulai hari dengan semangat.",
    src: "/audio/birds.mp3",
    youtubeId: "1ZYbU82GVz4",
  },
  {
    title: "Daily Calm",
    description: "Panduan relaksasi harian untuk menenangkan pikiran dan mengurangi stres.",
    src: "/audio/meditation.mp3",
    youtubeId: "ZToicYcHIOU",
  },
  {
    title: "Relaxing Nature Sounds",
    description: "Suara alam yang menenangkan untuk membantu tidur lebih nyenyak.",
    src: "/audio/night.mp3",
    youtubeId: "eKFTSSKCzWA",
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
                <div className="flex flex-col items-center gap-2">
                  {audio.youtubeId ? (
                    <div className="w-full sm:w-[300px] aspect-video">
                      <iframe
                        className="w-full h-full rounded"
                        src={`https://www.youtube.com/embed/${audio.youtubeId}?autoplay=0&controls=1`}
                        title={audio.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <>
                      <audio controls src={audio.src} className="w-full sm:w-[300px]">
                        Browser Anda tidak mendukung elemen audio.
                      </audio>
                      <p className="text-xs text-muted-foreground text-center">
                        Audio akan tersedia setelah file ditambahkan ke folder /public/audio/
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
