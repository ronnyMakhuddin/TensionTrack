"use client";

import { useState } from "react";
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
];

export default function EducationPage() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

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
    setShowResults(true);
  };

  const handleReset = () => {
    setAnswers({});
    setShowResults(false);
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
          <CardDescription>Jawab kuis singkat ini untuk melihat seberapa banyak yang Anda ketahui.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-8">
            {quizQuestions.map((q, index) => (
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
                        {answers[index] === q.correctAnswer ? "Benar!" : `Jawaban Anda: ${answers[index]}` }
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
              <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== quizQuestions.length}>Lihat Hasil</Button>
            ) : (
              <Button onClick={handleReset}>Coba Lagi</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
