import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const exercises = [
  {
    title: "Yoga untuk Relaksasi",
    description: "Yoga dapat membantu menurunkan tekanan darah dengan mengurangi stres dan meningkatkan fleksibilitas.",
    details: "Fokus pada pose yang menenangkan seperti Child's Pose, Cat-Cow, dan Corpse Pose. Gabungkan dengan pernapasan dalam untuk hasil maksimal. Cari kelas yoga pemula online atau di komunitas Anda.",
    videoId: "4pLUleLdwY4",
  },
  {
    title: "Latihan Pernapasan Dalam",
    description: "Teknik pernapasan yang tepat dapat menenangkan sistem saraf Anda dan menurunkan tekanan darah secara instan.",
    details: "Duduk atau berbaring dengan nyaman. Tarik napas dalam-dalam melalui hidung selama 4 hitungan, tahan selama 4 hitungan, dan hembuskan perlahan melalui mulut selama 6-8 hitungan. Ulangi selama 5-10 menit.",
    videoId: "8VwufJrUhic",
  },
  {
    title: "Tai Chi untuk Kesehatan Jantung",
    description: "Tai Chi adalah latihan gerakan lambat yang dapat meningkatkan kesehatan jantung dan menurunkan tekanan darah.",
    details: "Latihan ini menggabungkan gerakan lembut dengan pernapasan dalam. Mulailah dengan gerakan dasar dan tingkatkan secara bertahap. Praktikkan 20-30 menit setiap hari untuk hasil optimal.",
    videoId: "cEOS2zoyQw4",
  },
  {
    title: "Latihan Kekuatan Ringan",
    description: "Latihan kekuatan dengan beban ringan dapat membantu mengontrol tekanan darah dan meningkatkan kesehatan jantung.",
    details: "Gunakan dumbbell ringan atau resistance band. Fokus pada gerakan yang terkontrol dan pernapasan yang tepat. Lakukan 2-3 set dengan 10-15 repetisi untuk setiap latihan.",
    videoId: "U0bhE67HuDY",
  },
  {
    title: "Peregangan untuk Relaksasi",
    description: "Peregangan dapat membantu mengurangi ketegangan otot dan menurunkan tekanan darah.",
    details: "Lakukan peregangan lembut untuk semua kelompok otot utama. Tahan setiap pose selama 15-30 detik. Fokus pada pernapasan dalam selama peregangan.",
    videoId: "2L2lnxIcNmo",
  },
  {
    title: "Meditasi untuk Kesehatan Jantung",
    description: "Meditasi dapat membantu menurunkan stres dan tekanan darah dengan menenangkan pikiran dan tubuh.",
    details: "Duduk dengan nyaman dan tutup mata. Fokus pada pernapasan Anda. Jika pikiran mengembara, kembalikan fokus ke napas. Mulailah dengan 5-10 menit dan tingkatkan secara bertahap.",
    videoId: "inpok4MKVLM",
  },
  {
    title: "Latihan Aerobik Ringan",
    description: "Latihan aerobik ringan seperti berjalan di tempat atau mengangkat lutut dapat meningkatkan kesehatan jantung tanpa membebani tubuh.",
    details: "Lakukan gerakan sederhana seperti berjalan di tempat, mengangkat lutut, atau gerakan lengan. Mulailah dengan 10 menit dan tingkatkan secara bertahap hingga 30 menit.",
    videoId: "ml6cT4AZdqI",
  },
  {
    title: "Latihan Keseimbangan",
    description: "Latihan keseimbangan dapat membantu meningkatkan stabilitas dan mengurangi risiko jatuh, terutama penting untuk penderita hipertensi.",
    details: "Latihan seperti berdiri dengan satu kaki, berjalan dengan tumit ke jari kaki, atau pose pohon dalam yoga. Mulailah dengan durasi singkat dan tingkatkan secara bertahap.",
    videoId: "8BcPHWGQO44",
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
              {exercise.videoId && (
                <div className="aspect-video overflow-hidden rounded-lg border">
                   <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${exercise.videoId}`}
                      title={exercise.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                </div>
              )}
              <p className="text-sm text-muted-foreground">{exercise.details}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
