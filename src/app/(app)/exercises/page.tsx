import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const exercises = [
  {
    title: "Jalan Kaki Cepat",
    description: "Jalan kaki adalah cara yang bagus untuk meningkatkan kesehatan jantung. Usahakan untuk berjalan cepat setidaknya 30 menit setiap hari.",
    details: "Mulailah dengan pemanasan 5 menit. Pertahankan kecepatan di mana Anda masih bisa berbicara tetapi sedikit terengah-engah. Akhiri dengan pendinginan 5 menit.",
    videoId: "pG-p82_p8aA",
  },
  {
    title: "Yoga untuk Relaksasi",
    description: "Yoga dapat membantu menurunkan tekanan darah dengan mengurangi stres dan meningkatkan fleksibilitas.",
    details: "Fokus pada pose yang menenangkan seperti Child's Pose, Cat-Cow, dan Corpse Pose. Gabungkan dengan pernapasan dalam untuk hasil maksimal. Cari kelas yoga pemula online atau di komunitas Anda.",
    videoId: "V_T02l9Hn2A",
  },
  {
    title: "Latihan Pernapasan Dalam",
    description: "Teknik pernapasan yang tepat dapat menenangkan sistem saraf Anda dan menurunkan tekanan darah secara instan.",
    details: "Duduk atau berbaring dengan nyaman. Tarik napas dalam-dalam melalui hidung selama 4 hitungan, tahan selama 4 hitungan, dan hembuskan perlahan melalui mulut selama 6-8 hitungan. Ulangi selama 5-10 menit.",
    videoId: "1L3s2qD3j0U",
  },
   {
    title: "Bersepeda",
    description: "Bersepeda adalah latihan aerobik berdampak rendah yang sangat baik untuk sistem kardiovaskular Anda.",
    details: "Anda bisa menggunakan sepeda stasioner di dalam ruangan atau bersepeda di luar. Mulailah dengan kecepatan sedang selama 20-30 menit, 3-4 kali seminggu. Sesuaikan resistensi atau medan sesuai tingkat kebugaran Anda.",
    videoId: "gC_L9q_1a4o",
  },
];

export default function ExercisesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Program Latihan Terpandu"
        description="Temukan latihan yang aman dan efektif untuk membantu mengelola hipertensi."
      />
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {exercises.map((exercise) => (
          <Card key={exercise.title}>
            <CardHeader>
              <CardTitle>{exercise.title}</CardTitle>
              <CardDescription>{exercise.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-lg border">
                 <iframe
                    className="h-full w-full"
                    src={`https://www.youtube.com/embed/${exercise.videoId}`}
                    title={exercise.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
              </div>
              <p className="text-sm text-muted-foreground">{exercise.details}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
