"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const educationContent = [
  {
    question: "Apa itu hipertensi?",
    answer:
      "Hipertensi, juga dikenal sebagai tekanan darah tinggi, adalah kondisi medis jangka panjang di mana tekanan darah di arteri secara konsisten meningkat. Ini adalah faktor risiko utama untuk penyakit arteri koroner, stroke, gagal jantung, dan masalah kesehatan lainnya.",
  },
  {
    question: "Apa saja gejala umumnya?",
    answer:
      "Kebanyakan orang dengan hipertensi tidak memiliki tanda atau gejala, bahkan jika pembacaan tekanan darah mencapai tingkat yang sangat tinggi. Beberapa orang mungkin mengalami sakit kepala, sesak napas, atau mimisan, tetapi tanda-tanda ini tidak spesifik dan biasanya tidak terjadi sampai tekanan darah tinggi mencapai tahap yang parah atau mengancam jiwa.",
  },
  {
    question: "Bagaimana cara mengatur pola makan saya?",
    answer:
      "Pola makan yang sehat sangat penting. Diet DASH (Dietary Approaches to Stop Hypertension) sering direkomendasikan. Diet ini menekankan buah-buahan, sayuran, biji-bijian, dan produk susu rendah lemak. Mengurangi asupan natrium (garam) juga sangat penting; usahakan di bawah 1.500 mg per hari. Cobalah untuk membatasi makanan olahan, daging merah, dan minuman manis, yang seringkali tinggi natrium dan lemak jenuh.",
  },
  {
    question: "Aktivitas fisik seperti apa yang terbaik?",
    answer:
      "Aktivitas fisik teratur dapat membantu menurunkan tekanan darah Anda. Usahakan untuk melakukan aktivitas aerobik intensitas sedang setidaknya 150 menit, seperti jalan cepat atau bersepeda, atau aktivitas intensitas tinggi selama 75 menit, seperti berlari, setiap minggu. Latihan kekuatan juga bermanfaat.",
  },
  {
    question: "Makanan apa yang kaya akan kalium?",
    answer:
      "Kalium dapat mengurangi efek natrium pada tekanan darah. Sumber kalium yang baik termasuk pisang, alpukat, bayam, ubi jalar, kentang, tomat, dan kacang-kacangan. Memasukkan makanan ini ke dalam diet Anda dapat mendukung kesehatan jantung.",
  },
  {
    question: "Makanan dan minuman apa yang harus saya hindari?",
    answer:
      "Cobalah untuk membatasi atau menghindari: Makanan tinggi natrium seperti makanan kaleng, daging olahan, dan makanan cepat saji. Lemak jenuh dan trans yang ditemukan dalam makanan yang digoreng dan daging berlemak. Gula tambahan yang ada dalam minuman manis dan makanan penutup. Alkohol yang berlebihan juga dapat meningkatkan tekanan darah.",
  },
  {
    question: "Bagaimana stres memengaruhi tekanan darah?",
    answer:
      "Tubuh Anda menghasilkan lonjakan hormon saat Anda berada dalam situasi stres. Hormon-hormon ini untuk sementara meningkatkan tekanan darah Anda. Meskipun stres itu sendiri mungkin tidak menyebabkan tekanan darah tinggi jangka panjang, mekanisme koping yang tidak sehat seperti makan berlebihan, merokok, atau minum alkohol dapat menyebabkannya. Mempraktikkan teknik relaksasi seperti meditasi, pernapasan dalam, dan yoga dapat membantu mengelola stres.",
  },
  {
    question: "Mengapa penting untuk minum obat secara teratur?",
    answer:
      "Konsistensi adalah kunci. Obat tekanan darah bekerja untuk menjaga tekanan darah Anda terkontrol dari waktu ke waktu. Melewatkan dosis dapat menyebabkan tekanan darah Anda naik, meningkatkan risiko serangan jantung dan stroke. Selalu minum obat sesuai resep dokter.",
  },
];

const quizQuestions = [
  {
    question: "Manakah dari berikut ini yang dianggap sebagai pembacaan tekanan darah normal untuk orang dewasa?",
    options: ["140/90 mmHg", "120/80 mmHg", "100/60 mmHg", "130/85 mmHg"],
    correctAnswer: "120/80 mmHg",
    explanation: "Tekanan darah normal untuk orang dewasa umumnya dianggap di bawah 120/80 mmHg. Angka yang lebih tinggi dapat mengindikasikan peningkatan risiko hipertensi.",
  },
  {
    question: "Diet apa yang sering direkomendasikan untuk membantu mengelola tekanan darah tinggi?",
    options: ["Diet Keto", "Diet Mediterania", "Diet DASH", "Diet Paleo"],
    correctAnswer: "Diet DASH",
    explanation: "Diet DASH (Dietary Approaches to Stop Hypertension) dirancang khusus untuk membantu menurunkan tekanan darah. Diet ini kaya akan buah-buahan, sayuran, biji-bijian, dan rendah natrium.",
  },
  {
    question: "Manakah dari mineral berikut yang penting untuk menyeimbangkan kadar natrium dan membantu mengontrol tekanan darah?",
    options: ["Kalsium", "Besi", "Magnesium", "Kalium"],
    correctAnswer: "Kalium",
    explanation: "Kalium membantu mengurangi efek natrium pada tubuh dan mengendurkan dinding pembuluh darah, yang keduanya membantu menurunkan tekanan darah. Makanan seperti pisang, bayam, dan ubi jalar kaya akan kalium.",
  },
  {
    question: "Berapa lama aktivitas fisik yang direkomendasikan per minggu untuk membantu mengontrol tekanan darah?",
    options: ["30 menit", "75 menit", "150 menit", "300 menit"],
    correctAnswer: "150 menit",
    explanation: "Direkomendasikan untuk melakukan aktivitas aerobik intensitas sedang setidaknya 150 menit per minggu, atau aktivitas intensitas tinggi selama 75 menit per minggu.",
  },
  {
    question: "Makanan apa yang sebaiknya dihindari untuk penderita hipertensi?",
    options: ["Buah-buahan segar", "Makanan kaleng tinggi garam", "Sayuran hijau", "Ikan salmon"],
    correctAnswer: "Makanan kaleng tinggi garam",
    explanation: "Makanan kaleng sering mengandung natrium tinggi yang dapat meningkatkan tekanan darah. Pilih makanan segar atau makanan kaleng rendah natrium.",
  },
  {
    question: "Tekanan darah tinggi dapat meningkatkan risiko penyakit apa?",
    options: ["Diabetes", "Serangan jantung dan stroke", "Kanker", "Asma"],
    correctAnswer: "Serangan jantung dan stroke",
    explanation: "Hipertensi adalah faktor risiko utama untuk penyakit kardiovaskular termasuk serangan jantung dan stroke.",
  },
  {
    question: "Berapa batas maksimal konsumsi garam per hari untuk penderita hipertensi?",
    options: ["1.500 mg", "2.300 mg", "3.000 mg", "5.000 mg"],
    correctAnswer: "1.500 mg",
    explanation: "Penderita hipertensi disarankan untuk membatasi konsumsi natrium hingga 1.500 mg per hari untuk membantu mengontrol tekanan darah.",
  },
  {
    question: "Teknik pernapasan apa yang dapat membantu menurunkan tekanan darah?",
    options: ["Pernapasan cepat", "Pernapasan dalam dan lambat", "Menahan napas", "Pernapasan melalui mulut"],
    correctAnswer: "Pernapasan dalam dan lambat",
    explanation: "Pernapasan dalam dan lambat dapat mengaktifkan sistem saraf parasimpatis yang membantu menurunkan tekanan darah dan mengurangi stres.",
  },
  {
    question: "Makanan apa yang kaya akan kalium dan baik untuk tekanan darah?",
    options: ["Pisang", "Keripik kentang", "Roti putih", "Minuman bersoda"],
    correctAnswer: "Pisang",
    explanation: "Pisang kaya akan kalium yang membantu menyeimbangkan efek natrium dan mengendurkan pembuluh darah.",
  },
  {
    question: "Berapa kali tekanan darah sebaiknya diperiksa untuk penderita hipertensi?",
    options: ["Setiap bulan", "Setiap minggu", "Setiap hari", "Hanya saat sakit"],
    correctAnswer: "Setiap hari",
    explanation: "Penderita hipertensi disarankan untuk memeriksa tekanan darah setiap hari untuk memantau kondisi dan efektivitas pengobatan.",
  },
  {
    question: "Aktivitas apa yang dapat membantu mengurangi stres dan tekanan darah?",
    options: ["Menonton TV berjam-jam", "Meditasi dan yoga", "Makan makanan manis", "Minum kopi"],
    correctAnswer: "Meditasi dan yoga",
    explanation: "Meditasi dan yoga dapat membantu mengurangi stres dan menurunkan tekanan darah dengan mengaktifkan respons relaksasi tubuh.",
  },
  {
    question: "Berapa berat badan yang sebaiknya diturunkan untuk membantu mengontrol tekanan darah?",
    options: ["5-10% dari berat badan", "20-30% dari berat badan", "50% dari berat badan", "Tidak perlu menurunkan berat badan"],
    correctAnswer: "5-10% dari berat badan",
    explanation: "Menurunkan 5-10% dari berat badan dapat membantu menurunkan tekanan darah secara signifikan.",
  },
];

export default function EducationPage() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [currentQuizQuestions, setCurrentQuizQuestions] = useState<typeof quizQuestions>([]);
  const [score, setScore] = useState<number>(0);

  // Fungsi untuk mengacak pertanyaan
  const generateRandomQuiz = () => {
    const shuffled = [...quizQuestions].sort(() => Math.random() - 0.5);
    const randomQuestions = shuffled.slice(0, 5); // Ambil 5 pertanyaan random
    setCurrentQuizQuestions(randomQuestions);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  // Generate quiz random saat komponen pertama kali dimuat
  useEffect(() => {
    generateRandomQuiz();
  }, []);

  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers({
      ...answers,
      [questionIndex]: value,
    });
    if (showResults) {
      setShowResults(false);
    }
  };

  const handleSubmit = () => {
    let correctCount = 0;
    currentQuizQuestions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
  };

  const handleReset = () => {
    generateRandomQuiz();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edukasi & Sumber Daya"
        description="Pelajari lebih lanjut tentang mengelola kondisi Anda dan uji pengetahuan Anda."
      />
      <Card>
        <CardHeader>
          <CardTitle>Pertanyaan yang Sering Diajukan</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {educationContent.map((item, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Tes Pengetahuan Hipertensi Anda</CardTitle>
          <CardDescription>Jawab 5 pertanyaan random untuk melihat seberapa banyak yang Anda ketahui tentang hipertensi.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {showResults && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-lg mb-2">Hasil Kuis Anda:</h3>
              <p className="text-lg">
                Skor: <span className="font-bold text-blue-600">{score}</span> dari <span className="font-bold">{currentQuizQuestions.length}</span> pertanyaan
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {score === currentQuizQuestions.length ? "Sempurna! Anda sangat memahami tentang hipertensi!" :
                 score >= currentQuizQuestions.length * 0.8 ? "Bagus! Pengetahuan Anda tentang hipertensi cukup baik." :
                 score >= currentQuizQuestions.length * 0.6 ? "Cukup baik! Terus belajar untuk meningkatkan pengetahuan Anda." :
                 "Jangan khawatir! Terus pelajari materi edukasi untuk meningkatkan pemahaman Anda."}
              </p>
            </div>
          )}
          <div className="space-y-8">
            {currentQuizQuestions.map((q, index) => (
              <div key={index} className="space-y-4">
                <p className="font-medium">{index + 1}. {q.question}</p>
                <RadioGroup
                  value={answers[index]}
                  onValueChange={(value) => handleAnswerChange(index, value)}
                  disabled={showResults}
                  className="space-y-2"
                >
                  {q.options.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`q${index}-${option}`} />
                      <Label htmlFor={`q${index}-${option}`} className="font-normal cursor-pointer">{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
                {showResults && (
                  <div className={cn(
                    "mt-4 p-3 rounded-md text-sm flex items-start gap-3",
                    answers[index] === q.correctAnswer ? "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-200" : "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-200"
                  )}>
                    {answers[index] === q.correctAnswer ? (
                       <CheckCircle className="h-5 w-5 mt-0.5 shrink-0" />
                    ) : (
                       <XCircle className="h-5 w-5 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="font-semibold">
                        {answers[index] === q.correctAnswer ? "Benar!" : `Jawaban Anda: ${answers[index] || 'Tidak dijawab'}` }
                      </p>
                      <p className="mt-1">
                        {q.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-4 border-t">
            {!showResults ? (
              <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== currentQuizQuestions.length}>
                Lihat Hasil
              </Button>
            ) : (
              <Button onClick={handleReset}>
                Kuis Baru
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
