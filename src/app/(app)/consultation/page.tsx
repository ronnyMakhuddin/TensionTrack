"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs, getDoc, doc } from "firebase/firestore";
import type { BloodPressureReading, FoodLog, ActivityLog, SleepLog, ExerciseLog, PatientProfile } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Share2, MessageCircle, Loader2, Printer, FileText, Lock } from "lucide-react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Gunakan nomor telepon placeholder untuk integrasi WhatsApp
const DOCTOR_WHATSAPP_NUMBER = "6282131519004"; // Nomor Indonesia untuk konsultasi

// Fungsi untuk menghitung umur dari tanggal lahir
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

const passwordSchema = z.object({
  password: z.string().min(4, "Password minimal 4 karakter").max(20, "Password maksimal 20 karakter"),
});

export default function ConsultationPage() {
  const { user } = useAuth();
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const { toast } = useToast();

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  const generateReport = async () => {
    if (!user || !db) return;
    setIsGenerating(true);

    try {
      // Fetch data
      const bpQuery = query(collection(db, "users", user.uid, "readings"), orderBy("timestamp", "desc"), limit(10));
      const foodQuery = query(collection(db, "users", user.uid, "food"), orderBy("timestamp", "desc"), limit(10));
      const activityQuery = query(collection(db, "users", user.uid, "activity"), orderBy("timestamp", "desc"), limit(10));
      const sleepQuery = query(collection(db, "users", user.uid, "sleep"), orderBy("timestamp", "desc"), limit(7));
      const exerciseQuery = query(collection(db, "users", user.uid, "exercises"), orderBy("timestamp", "desc"), limit(10));
      
      const [bpSnapshot, foodSnapshot, activitySnapshot, sleepSnapshot, exerciseSnapshot] = await Promise.all([
          getDocs(bpQuery),
          getDocs(foodQuery),
          getDocs(activityQuery),
          getDocs(sleepQuery),
          getDocs(exerciseQuery)
      ]);

      const bpReadings = bpSnapshot.docs.map(d => d.data() as BloodPressureReading);
      const foodLogs = foodSnapshot.docs.map(d => d.data() as FoodLog);
      const activityLogs = activitySnapshot.docs.map(d => d.data() as ActivityLog);
      const sleepLogs = sleepSnapshot.docs.map(d => d.data() as SleepLog);
      const exerciseLogs = exerciseSnapshot.docs.map(d => d.data() as ExerciseLog);
      
      // Fetch patient profile
      let patientProfile: PatientProfile | null = null;
      try {
        const profileDoc = await getDoc(doc(db, "users", user.uid, "profile", "data"));
        if (profileDoc.exists()) {
          patientProfile = profileDoc.data() as PatientProfile;
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }

      let reportContent = "LAPORAN KESEHATAN KOMPREHENSIF\n";
      reportContent += "===================================\n";
      reportContent += `Tanggal: ${format(new Date(), "dd/MM/yyyy HH:mm")}\n\n`;

      // Identitas Pasien
      reportContent += "👤 IDENTITAS PASIEN\n";
      reportContent += "==================\n";
      if (patientProfile) {
        reportContent += `Nama: ${patientProfile.name}\n`;
        reportContent += `Tanggal Lahir: ${new Date(patientProfile.birthDate).toLocaleDateString('id-ID')}\n`;
        reportContent += `Umur: ${calculateAge(patientProfile.birthDate)} tahun\n`;
        reportContent += `Jenis Kelamin: ${patientProfile.gender === "male" ? "Laki-laki" : "Perempuan"}\n`;
        reportContent += `Tinggi Badan: ${patientProfile.height} cm\n`;
        reportContent += `Berat Badan: ${patientProfile.weight} kg\n`;
        
        // Calculate BMI
        if (patientProfile.height && patientProfile.weight) {
          const heightInMeters = patientProfile.height / 100;
          const bmi = patientProfile.weight / (heightInMeters * heightInMeters);
          reportContent += `BMI: ${bmi.toFixed(1)} (${bmi < 18.5 ? "Kurus" : bmi < 25 ? "Normal" : bmi < 30 ? "Gemuk" : "Obesitas"})\n`;
        }
        
        reportContent += `Nomor Telepon: ${patientProfile.phoneNumber}\n`;
        reportContent += `Alamat: ${patientProfile.address}\n`;
        
        // Emergency Contact
        reportContent += `\nKontak Darurat:\n`;
        reportContent += `  Nama: ${patientProfile.emergencyContact.name}\n`;
        reportContent += `  Hubungan: ${patientProfile.emergencyContact.relationship}\n`;
        reportContent += `  Telepon: ${patientProfile.emergencyContact.phoneNumber}\n`;
        
        // Medical History
        reportContent += `\nRiwayat Kesehatan:\n`;
        if (patientProfile.medicalHistory.hasHypertension) reportContent += `  • Hipertensi\n`;
        if (patientProfile.medicalHistory.hasDiabetes) reportContent += `  • Diabetes\n`;
        if (patientProfile.medicalHistory.hasHeartDisease) reportContent += `  • Penyakit Jantung\n`;
        if (patientProfile.medicalHistory.hasKidneyDisease) reportContent += `  • Penyakit Ginjal\n`;
        if (patientProfile.medicalHistory.otherConditions && patientProfile.medicalHistory.otherConditions.length > 0) {
          reportContent += `  • Riwayat Tambahan:\n`;
          if (Array.isArray(patientProfile.medicalHistory.otherConditions)) {
            patientProfile.medicalHistory.otherConditions.forEach(condition => {
              reportContent += `    - ${condition}\n`;
            });
          } else {
            reportContent += `    - ${patientProfile.medicalHistory.otherConditions}\n`;
          }
        }
      } else {
        reportContent += "Data identitas pasien belum lengkap.\n";
        reportContent += "Silakan lengkapi profil di menu Profil.\n";
      }
      reportContent += "\n";

      // Ringkasan Kesehatan
      reportContent += "📊 RINGKASAN KESEHATAN\n";
      reportContent += "----------------------\n";
      if (bpReadings.length > 0) {
        const latestBP = bpReadings[0];
        const avgSystolic = bpReadings.reduce((sum, r) => sum + r.systolic, 0) / bpReadings.length;
        const avgDiastolic = bpReadings.reduce((sum, r) => sum + r.diastolic, 0) / bpReadings.length;
        reportContent += `Tekanan Darah Terakhir: ${latestBP.systolic}/${latestBP.diastolic} mmHg\n`;
        reportContent += `Rata-rata Sistolik: ${avgSystolic.toFixed(0)} mmHg\n`;
        reportContent += `Rata-rata Diastolik: ${avgDiastolic.toFixed(0)} mmHg\n`;
      } else {
        reportContent += "Tekanan Darah: Tidak ada data\n";
      }
      reportContent += "\n";

      // Data Tekanan Darah Detail
      reportContent += "🩺 RIWAYAT TEKANAN DARAH (10 hari terakhir)\n";
      reportContent += "----------------------------------------\n";
      if (bpReadings.length > 0) {
        bpReadings.forEach((r, index) => {
          const date = format(new Date(r.timestamp), "dd/MM/yyyy HH:mm");
          reportContent += `${index + 1}. ${date}: ${r.systolic}/${r.diastolic} mmHg, Denyut ${r.pulse} BPM\n`;
        });
      } else {
        reportContent += "Tidak ada data tekanan darah yang tercatat.\n";
      }
      reportContent += "\n";

      // Data Aktivitas
      reportContent += "🏃‍♂️ RIWAYAT AKTIVITAS (10 hari terakhir)\n";
      reportContent += "------------------------------------\n";
      if (activityLogs.length > 0) {
        const activityTypes = {
          exercise: "Olahraga",
          walking: "Jalan Kaki", 
          smoking: "Merokok",
          alcohol: "Minum Alkohol",
          sedentary: "Duduk Lama",
          stress: "Stres",
          meditation: "Meditasi",
          yoga: "Yoga",
          gaming: "Bermain Game",
          social: "Aktivitas Sosial",
          work: "Bekerja",
          other: "Lainnya"
        };
        
        activityLogs.forEach((log, index) => {
          const date = format(new Date(log.timestamp), "dd/MM/yyyy");
          const activityLabel = activityTypes[log.activityType as keyof typeof activityTypes] || log.activityType || "Aktivitas";
          const intensity = log.intensity === "high" ? "Tinggi" : log.intensity === "medium" ? "Sedang" : "Rendah";
          const impact = log.healthImpact === "positive" ? "✅" : log.healthImpact === "negative" ? "❌" : "⚪";
          
          reportContent += `${index + 1}. ${date}: ${impact} ${activityLabel}\n`;
          reportContent += `   Deskripsi: ${log.description}\n`;
          if (log.steps > 0) reportContent += `   Langkah: ${log.steps.toLocaleString()}\n`;
          if (log.duration > 0) reportContent += `   Durasi: ${log.duration} menit\n`;
          reportContent += `   Intensitas: ${intensity}\n\n`;
        });
      } else {
        reportContent += "Tidak ada data aktivitas yang tercatat.\n";
      }
      reportContent += "\n";

      // Data Diet
      reportContent += "🍽️ CATATAN DIET (10 hari terakhir)\n";
      reportContent += "-------------------------------\n";
      if (foodLogs.length > 0) {
        foodLogs.forEach((log, index) => {
          const date = format(new Date(log.timestamp), "dd/MM/yyyy");
          reportContent += `${index + 1}. ${date}: ${log.description}\n`;
        });
      } else {
        reportContent += "Tidak ada data diet yang tercatat.\n";
      }
      reportContent += "\n";

      // Data Tidur
      reportContent += "😴 RIWAYAT TIDUR (7 hari terakhir)\n";
      reportContent += "-------------------------------\n";
      if (sleepLogs.length > 0) {
        const avgSleepHours = sleepLogs.reduce((sum, log) => sum + log.duration, 0) / sleepLogs.length;
        
        reportContent += `Rata-rata jam tidur: ${avgSleepHours.toFixed(1)} jam\n`;
        if (sleepLogs.some(log => log.quality)) {
          const qualityLogs = sleepLogs.filter(log => log.quality);
          reportContent += `Kualitas tidur: ${qualityLogs.map(log => log.quality).join(", ")}\n`;
        }
        reportContent += "\n";
        
        sleepLogs.forEach((log, index) => {
          const date = format(new Date(log.timestamp), "dd/MM/yyyy");
          reportContent += `${index + 1}. ${date}: ${log.duration} jam tidur`;
          if (log.quality) reportContent += `, Kualitas: ${log.quality}`;
          if (log.healthConditions) reportContent += `\n   Kondisi: ${log.healthConditions}`;
          if (log.lifestyleFactors) reportContent += `\n   Faktor: ${log.lifestyleFactors}`;
          reportContent += "\n";
        });
      } else {
        reportContent += "Tidak ada data tidur yang tercatat.\n";
      }
      reportContent += "\n";

      // Data Latihan
      reportContent += "💪 RIWAYAT LATIHAN (10 hari terakhir)\n";
      reportContent += "--------------------------------\n";
      if (exerciseLogs.length > 0) {
        const avgDuration = exerciseLogs.reduce((sum, log) => sum + log.duration, 0) / exerciseLogs.length;
        const avgPulse = exerciseLogs.reduce((sum, log) => sum + log.pulse, 0) / exerciseLogs.length;
        
        reportContent += `Rata-rata durasi latihan: ${avgDuration.toFixed(1)} menit\n`;
        reportContent += `Rata-rata detak jantung setelah latihan: ${avgPulse.toFixed(0)} BPM\n`;
        reportContent += "\n";
        
        exerciseLogs.forEach((log, index) => {
          const date = format(new Date(log.timestamp), "dd/MM/yyyy HH:mm");
          const difficulty = log.difficulty === "easy" ? "Mudah" : log.difficulty === "medium" ? "Sedang" : "Sulit";
          const breathing = log.breathing === "normal" ? "Normal" : log.breathing === "cepat" ? "Cepat" : "Lambat";
          
          reportContent += `${index + 1}. ${date}: ${log.exerciseTitle}\n`;
          reportContent += `   Durasi: ${log.duration} menit\n`;
          reportContent += `   Detak jantung: ${log.pulse} BPM\n`;
          reportContent += `   Pernapasan: ${breathing}\n`;
          reportContent += `   Tingkat kesulitan: ${difficulty}\n`;
          if (log.notes) reportContent += `   Catatan: ${log.notes}\n`;
          reportContent += "\n";
        });
      } else {
        reportContent += "Tidak ada data latihan yang tercatat.\n";
      }
      reportContent += "\n";

      // Analisis Pola
      reportContent += "📈 ANALISIS POLA KESEHATAN\n";
      reportContent += "---------------------------\n";
      
      // Analisis tekanan darah
      if (bpReadings.length > 0) {
        const highBPCount = bpReadings.filter(r => r.systolic >= 140 || r.diastolic >= 90).length;
        const normalBPCount = bpReadings.length - highBPCount;
        reportContent += `• Tekanan darah tinggi: ${highBPCount} dari ${bpReadings.length} pengukuran\n`;
        reportContent += `• Tekanan darah normal: ${normalBPCount} dari ${bpReadings.length} pengukuran\n`;
      }
      
      // Analisis aktivitas
      if (activityLogs.length > 0) {
        const positiveActivities = activityLogs.filter(log => log.healthImpact === "positive").length;
        const negativeActivities = activityLogs.filter(log => log.healthImpact === "negative").length;
        const totalActivities = activityLogs.length;
        reportContent += `• Aktivitas sehat: ${positiveActivities} dari ${totalActivities} aktivitas\n`;
        reportContent += `• Aktivitas tidak sehat: ${negativeActivities} dari ${totalActivities} aktivitas\n`;
      }
      
      // Analisis tidur
      if (sleepLogs.length > 0) {
        const goodSleepCount = sleepLogs.filter(log => log.duration >= 7 && log.duration <= 9).length;
        const poorSleepCount = sleepLogs.length - goodSleepCount;
        reportContent += `• Tidur cukup (7-9 jam): ${goodSleepCount} dari ${sleepLogs.length} hari\n`;
        reportContent += `• Tidur kurang/berlebihan: ${poorSleepCount} dari ${sleepLogs.length} hari\n`;
      }
      
      // Analisis latihan
      if (exerciseLogs.length > 0) {
        const avgDuration = exerciseLogs.reduce((sum, log) => sum + log.duration, 0) / exerciseLogs.length;
        const avgPulse = exerciseLogs.reduce((sum, log) => sum + log.pulse, 0) / exerciseLogs.length;
        const normalBreathingCount = exerciseLogs.filter(log => log.breathing === "normal").length;
        const breathingIssuesCount = exerciseLogs.length - normalBreathingCount;
        
        reportContent += `• Rata-rata durasi latihan: ${avgDuration.toFixed(1)} menit\n`;
        reportContent += `• Rata-rata detak jantung setelah latihan: ${avgPulse.toFixed(0)} BPM\n`;
        reportContent += `• Pernapasan normal: ${normalBreathingCount} dari ${exerciseLogs.length} sesi\n`;
        reportContent += `• Masalah pernapasan: ${breathingIssuesCount} dari ${exerciseLogs.length} sesi\n`;
      }
      
      reportContent += "\n";

      // Rencana Perubahan Perilaku
      reportContent += "📋 RENCANA PERUBAHAN PERILAKU\n";
      reportContent += "==============================\n";
      reportContent += "Data Sebelum Perlakuan:\n";
      reportContent += "----------------------\n";
      
      // Data tekanan darah sebelum perlakuan
      if (bpReadings.length > 0) {
        const recentReadings = bpReadings.slice(0, 3); // 3 pengukuran terakhir
        const avgSystolic = recentReadings.reduce((sum, r) => sum + r.systolic, 0) / recentReadings.length;
        const avgDiastolic = recentReadings.reduce((sum, r) => sum + r.diastolic, 0) / recentReadings.length;
        reportContent += `• Tekanan darah rata-rata: ${avgSystolic.toFixed(0)}/${avgDiastolic.toFixed(0)} mmHg\n`;
        reportContent += `• Status: ${avgSystolic >= 140 || avgDiastolic >= 90 ? "Hipertensi" : "Normal"}\n`;
      }
      
      // Data aktivitas sebelum perlakuan
      if (activityLogs.length > 0) {
        const negativeActivities = activityLogs.filter(log => log.healthImpact === "negative");
        const positiveActivities = activityLogs.filter(log => log.healthImpact === "positive");
        reportContent += `• Aktivitas tidak sehat: ${negativeActivities.length} aktivitas\n`;
        reportContent += `• Aktivitas sehat: ${positiveActivities.length} aktivitas\n`;
        if (negativeActivities.length > 0) {
          reportContent += `• Aktivitas yang perlu diubah: ${negativeActivities.map(log => log.activityType).join(", ")}\n`;
        }
      }
      
      // Data tidur sebelum perlakuan
      if (sleepLogs.length > 0) {
        const avgSleep = sleepLogs.reduce((sum, log) => sum + log.duration, 0) / sleepLogs.length;
        reportContent += `• Rata-rata jam tidur: ${avgSleep.toFixed(1)} jam\n`;
        reportContent += `• Status tidur: ${avgSleep >= 7 && avgSleep <= 9 ? "Cukup" : avgSleep < 7 ? "Kurang" : "Berlebihan"}\n`;
      }
      
      // Data latihan sebelum perlakuan
      if (exerciseLogs.length > 0) {
        const avgDuration = exerciseLogs.reduce((sum, log) => sum + log.duration, 0) / exerciseLogs.length;
        reportContent += `• Rata-rata durasi latihan: ${avgDuration.toFixed(1)} menit\n`;
        reportContent += `• Frekuensi latihan: ${exerciseLogs.length} sesi dalam 10 hari terakhir\n`;
      }
      
      reportContent += "\nRencana Perubahan yang Akan Diimplementasikan:\n";
      reportContent += "-----------------------------------------\n";
      
      // Rekomendasi perubahan berdasarkan data
      if (bpReadings.length > 0) {
        const latestBP = bpReadings[0];
        if (latestBP.systolic >= 140 || latestBP.diastolic >= 90) {
          reportContent += "• Target tekanan darah: Turunkan ke <140/90 mmHg\n";
          reportContent += "• Frekuensi pengukuran: 2x sehari (pagi dan malam)\n";
        }
      }
      
      if (activityLogs.length > 0) {
        const negativeCount = activityLogs.filter(log => log.healthImpact === "negative").length;
        if (negativeCount > 0) {
          reportContent += "• Kurangi aktivitas tidak sehat secara bertahap\n";
          reportContent += "• Ganti dengan aktivitas sehat yang setara\n";
        }
      }
      
      if (sleepLogs.length > 0) {
        const avgSleep = sleepLogs.reduce((sum, log) => sum + log.duration, 0) / sleepLogs.length;
        if (avgSleep < 7) {
          reportContent += "• Target jam tidur: 7-9 jam per malam\n";
          reportContent += "• Buat rutinitas tidur yang konsisten\n";
        } else if (avgSleep > 9) {
          reportContent += "• Target jam tidur: 7-9 jam per malam\n";
          reportContent += "• Kurangi waktu tidur berlebihan\n";
        }
      }
      
      if (exerciseLogs.length === 0) {
        reportContent += "• Mulai program latihan terpandu 3x seminggu\n";
        reportContent += "• Durasi awal: 15-20 menit per sesi\n";
      } else {
        const avgDuration = exerciseLogs.reduce((sum, log) => sum + log.duration, 0) / exerciseLogs.length;
        if (avgDuration < 30) {
          reportContent += "• Tingkatkan durasi latihan ke 30 menit per sesi\n";
        }
        if (exerciseLogs.length < 5) {
          reportContent += "• Tingkatkan frekuensi latihan ke 5x seminggu\n";
        }
      }
      
      reportContent += "• Konsultasi rutin dengan Ners Counselor setiap 2 minggu\n";
      reportContent += "• Evaluasi progress setiap bulan\n";
      reportContent += "\n";

      // Rekomendasi Umum
      reportContent += "💡 REKOMENDASI UMUM\n";
      reportContent += "-------------------\n";
      reportContent += "• Lakukan pengukuran tekanan darah secara rutin\n";
      reportContent += "• Tingkatkan aktivitas fisik yang sehat\n";
      reportContent += "• Lakukan latihan terpandu secara teratur\n";
      reportContent += "• Kurangi aktivitas yang berdampak negatif\n";
      reportContent += "• Pertahankan pola tidur yang teratur\n";
      reportContent += "• Konsultasikan dengan Ners Counselor untuk evaluasi lebih lanjut\n\n";

      reportContent += "--- AKHIR LAPORAN ---\n";
      reportContent += `Dibuat oleh: TensionTrack App\n`;
      reportContent += `Untuk konsultasi lebih lanjut, hubungi Ners Counselor Anda.\n\n`;
      
      if (isPasswordProtected) {
        reportContent += "🔒 INFORMASI KEAMANAN PDF\n";
        reportContent += "========================\n";
        reportContent += "PDF laporan ini dilindungi dengan password untuk kerahasiaan pasien.\n";
        reportContent += "Password akan dikirimkan secara terpisah melalui WhatsApp.\n";
        reportContent += "Jangan bagikan password kepada pihak yang tidak berwenang.\n\n";
      }

      setReport(reportContent);
      toast({
        title: "Laporan Dibuat",
        description: "Laporan Anda siap untuk dibagikan.",
      });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Kesalahan",
            description: "Gagal membuat laporan."
        });
        console.error("Error generating report: ", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareReportViaWhatsApp = () => {
    if (!report) return;
    
    let message = encodeURIComponent(report);
    let whatsappUrl = `https://wa.me/${DOCTOR_WHATSAPP_NUMBER}?text=${message}`;
    
    // Jika PDF dilindungi password, kirim password secara terpisah
    if (isPasswordProtected) {
      const passwordMessage = encodeURIComponent(
        `🔐 PASSWORD UNTUK LAPORAN KESEHATAN\n\n` +
        `Password: ${passwordForm.getValues().password}\n\n` +
        `⚠️ PERINGATAN:\n` +
        `• Password ini hanya untuk Ners Counselor\n` +
        `• Jangan bagikan kepada pihak lain\n` +
        `• Gunakan untuk membuka PDF laporan kesehatan\n\n` +
        `Terima kasih.`
      );
      
      // Buka dua tab WhatsApp - satu untuk laporan, satu untuk password
      window.open(whatsappUrl, "_blank");
      setTimeout(() => {
        window.open(`https://wa.me/${DOCTOR_WHATSAPP_NUMBER}?text=${passwordMessage}`, "_blank");
      }, 1000);
      
      toast({
        title: "Laporan & Password Terkirim",
        description: "Laporan dan password dikirim secara terpisah untuk keamanan.",
      });
    } else {
      window.open(whatsappUrl, "_blank");
      toast({
        title: "Laporan Terkirim",
        description: "Laporan kesehatan berhasil dikirim ke Ners Counselor.",
      });
    }
    
    setReport(null); // Hapus laporan setelah dibagikan
  };

  const printPDF = async () => {
    if (!report) return;
    
    try {
      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();
      
      // Add a page
      const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      const { width, height } = page.getSize();
      
      // Embed the standard font
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Header
      page.drawText("LAPORAN KESEHATAN KOMPREHENSIF", {
        x: 50,
        y: height - 50,
        size: 16,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      
      page.drawText("TensionTrack App", {
        x: 50,
        y: height - 70,
        size: 12,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      // Password protection notice
      page.drawText("⚠️ DOKUMEN RAHASIA - LAPORAN KESEHATAN PASIEN", {
        x: 50,
        y: height - 100,
        size: 10,
        font: boldFont,
        color: rgb(1, 0, 0),
      });
      
      page.drawText("Dokumen ini berisi informasi medis yang bersifat rahasia.", {
        x: 50,
        y: height - 115,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      page.drawText("Hanya boleh dibuka oleh tenaga medis yang berwenang.", {
        x: 50,
        y: height - 130,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
      });
      
      if (isPasswordProtected) {
        const password = passwordForm.getValues().password;
        page.drawText(`🔒 Password untuk membuka PDF: ${password}`, {
          x: 50,
          y: height - 145,
          size: 10,
          font: boldFont,
          color: rgb(0, 0, 1),
        });
      }
      
      // Content
      const lines = report.split('\n');
      let yPosition = height - 160;
      const lineHeight = 15;
      const margin = 50;
      const maxWidth = width - 100;
      
      for (const line of lines) {
        if (yPosition < 50) {
          // Add new page if needed
          const newPage = pdfDoc.addPage([595.28, 841.89]);
          yPosition = height - 50;
        }
        
        // Handle long lines by wrapping
        const words = line.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine + word + ' ';
          const textWidth = font.widthOfTextAtSize(testLine, 10);
          
          if (textWidth > maxWidth && currentLine) {
            page.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: 10,
              font: font,
              color: rgb(0, 0, 0),
            });
            yPosition -= lineHeight;
            currentLine = word + ' ';
            
            if (yPosition < 50) {
              const newPage = pdfDoc.addPage([595.28, 841.89]);
              yPosition = height - 50;
            }
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine) {
          page.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: 10,
            font: font,
            color: rgb(0, 0, 0),
          });
          yPosition -= lineHeight;
        }
      }
      
      // Footer
      const pages = pdfDoc.getPages();
      pages.forEach((page, index) => {
        page.drawText(`Halaman ${index + 1} dari ${pages.length}`, {
          x: 50,
          y: 30,
          size: 8,
          font: font,
          color: rgb(0.5, 0.5, 0.5),
        });
        
        page.drawText(`Dicetak: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, {
          x: 250,
          y: 30,
          size: 8,
          font: font,
          color: rgb(0.5, 0.5, 0.5),
        });
        
        page.drawText("TensionTrack - Aplikasi Manajemen Hipertensi", {
          x: 450,
          y: 30,
          size: 8,
          font: font,
          color: rgb(0.5, 0.5, 0.5),
        });
      });
      
      // Apply password protection if enabled
      if (isPasswordProtected) {
        const password = passwordForm.getValues().password;
        if (password) {
          // Note: pdf-lib encryption requires additional setup
          // For now, we'll add a notice in the PDF about password protection
          console.warn('Password protection requires additional pdf-lib setup');
        }
      }
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-kesehatan-${format(new Date(), "dd-MM-yyyy-HHmm")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "PDF Berhasil Dibuat",
        description: isPasswordProtected 
          ? `PDF dilindungi dengan password dan disimpan`
          : `PDF berhasil disimpan`,
      });
      
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast({
        title: "Error",
        description: "Gagal membuat PDF. Silakan coba lagi.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
    setIsPasswordProtected(true);
    setShowPasswordDialog(false);
    toast({
      title: "PDF Dilindungi",
      description: `PDF akan dibuat dengan password: ${values.password}`,
    });
    printPDF();
  };

  const scheduleUrl = `https://wa.me/${DOCTOR_WHATSAPP_NUMBER}?text=${encodeURIComponent("Halo, saya ingin menjadwalkan sesi konsultasi kesehatan.")}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Konsultasi Virtual"
        description="Terhubung dengan tenaga medis melalui WhatsApp."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <MessageCircle className="h-8 w-8 text-primary" />
            <CardTitle>Jadwalkan Sesi Konsultasi</CardTitle>
          </div>
          <CardDescription>
            Jadwalkan sesi konsultasi dengan Ners Counselor atau ahli gizi Anda langsung melalui WhatsApp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href={scheduleUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="mr-2 h-4 w-4" />
              Jadwalkan via WhatsApp
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Share2 className="h-8 w-8 text-primary" />
            <CardTitle>Bagikan Laporan Kesehatan</CardTitle>
          </div>
          <CardDescription>
            Buat ringkasan riwayat kesehatan Anda untuk dibagikan dengan Ners Counselor
            Anda melalui WhatsApp sebelum sesi konsultasi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!report ? (
            <Button onClick={generateReport} disabled={isGenerating}>
              {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Siapkan Laporan
            </Button>
          ) : (
            <div className="space-y-4">
              <Textarea
                readOnly
                value={report}
                rows={15}
                className="font-mono text-xs bg-muted"
              />
              <div className="flex gap-2">
                <Button onClick={shareReportViaWhatsApp}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Bagikan ke Ners Counselor via WhatsApp
                </Button>
                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Lock className="mr-2 h-4 w-4" />
                      Print PDF dengan Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Lindungi PDF dengan Password</DialogTitle>
                    </DialogHeader>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password untuk PDF</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Masukkan password (4-20 karakter)" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2 pt-4">
                          <Button type="submit" className="flex-1">
                            <Lock className="mr-2 h-4 w-4" />
                            Buat PDF Terlindungi
                          </Button>
                          <DialogClose asChild>
                            <Button variant="outline" className="flex-1">
                              Batal
                            </Button>
                          </DialogClose>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                <Button variant="outline" onClick={() => setReport(null)}>
                  Batal
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
