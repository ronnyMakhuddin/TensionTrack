"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import type { BloodPressureReading, FoodLog, ActivityLog, SleepLog } from "@/lib/types";
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
import { Share2, MessageCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

// Gunakan nomor telepon placeholder untuk integrasi WhatsApp
const DOCTOR_WHATSAPP_NUMBER = "6282131519004"; // Nomor Indonesia untuk konsultasi

export default function ConsultationPage() {
  const { user } = useAuth();
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateReport = async () => {
    if (!user || !db) return;
    setIsGenerating(true);

    try {
      // Fetch data
      const bpQuery = query(collection(db, "users", user.uid, "readings"), orderBy("timestamp", "desc"), limit(10));
      const foodQuery = query(collection(db, "users", user.uid, "food"), orderBy("timestamp", "desc"), limit(10));
      const activityQuery = query(collection(db, "users", user.uid, "activity"), orderBy("timestamp", "desc"), limit(10));
      const sleepQuery = query(collection(db, "users", user.uid, "sleep"), orderBy("timestamp", "desc"), limit(7));
      
      const [bpSnapshot, foodSnapshot, activitySnapshot, sleepSnapshot] = await Promise.all([
          getDocs(bpQuery),
          getDocs(foodQuery),
          getDocs(activityQuery),
          getDocs(sleepQuery)
      ]);

      const bpReadings = bpSnapshot.docs.map(d => d.data() as BloodPressureReading);
      const foodLogs = foodSnapshot.docs.map(d => d.data() as FoodLog);
      const activityLogs = activitySnapshot.docs.map(d => d.data() as ActivityLog);
      const sleepLogs = sleepSnapshot.docs.map(d => d.data() as SleepLog);
      
      let reportContent = "LAPORAN KESEHATAN KOMPREHENSIF\n";
      reportContent += "===================================\n";
      reportContent += `Tanggal: ${format(new Date(), "dd/MM/yyyy HH:mm")}\n\n`;

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
      
      reportContent += "\n";

      // Rekomendasi Umum
      reportContent += "💡 REKOMENDASI UMUM\n";
      reportContent += "-------------------\n";
      reportContent += "• Lakukan pengukuran tekanan darah secara rutin\n";
      reportContent += "• Tingkatkan aktivitas fisik yang sehat\n";
      reportContent += "• Kurangi aktivitas yang berdampak negatif\n";
      reportContent += "• Pertahankan pola tidur yang teratur\n";
      reportContent += "• Konsultasikan dengan dokter untuk evaluasi lebih lanjut\n\n";

      reportContent += "--- AKHIR LAPORAN ---\n";
      reportContent += `Dibuat oleh: TensionTrack App\n`;
      reportContent += `Untuk konsultasi lebih lanjut, hubungi dokter Anda.`;

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
    const message = encodeURIComponent(report);
    const whatsappUrl = `https://wa.me/${DOCTOR_WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, "_blank");
    setReport(null); // Hapus laporan setelah dibagikan
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
            Jadwalkan sesi konsultasi dengan dokter atau ahli gizi Anda langsung melalui WhatsApp.
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
            Buat ringkasan riwayat kesehatan Anda untuk dibagikan dengan dokter
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
                  Bagikan ke Dokter via WhatsApp
                </Button>
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
