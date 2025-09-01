
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import type { BloodPressureReading, FoodLog, ActivityLog } from "@/lib/types";
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
const DOCTOR_WHATSAPP_NUMBER = "6281234567890"; // Contoh nomor Indonesia

export default function ConsultationPage() {
  const { user } = useAuth();
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateReport = async () => {
    if (!user) return;
    setIsGenerating(true);

    try {
      // Fetch data
      const bpQuery = query(collection(db, "users", user.uid, "readings"), orderBy("timestamp", "desc"), limit(10));
      const foodQuery = query(collection(db, "users", user.uid, "food"), orderBy("timestamp", "desc"), limit(10));
      const activityQuery = query(collection(db, "users", user.uid, "activity"), orderBy("timestamp", "desc"), limit(10));
      
      const [bpSnapshot, foodSnapshot, activitySnapshot] = await Promise.all([
          getDocs(bpQuery),
          getDocs(foodQuery),
          getDocs(activityQuery)
      ]);

      const bpReadings = bpSnapshot.docs.map(d => d.data() as BloodPressureReading);
      const foodLogs = foodSnapshot.docs.map(d => d.data() as FoodLog);
      const activityLogs = activitySnapshot.docs.map(d => d.data() as ActivityLog);
      
      let reportContent = "Laporan Kesehatan Komprehensif\n";
      reportContent += "===================================\n\n";

      // Data Tekanan Darah
      reportContent += "Riwayat Tekanan Darah (10 hari terakhir):\n";
      if (bpReadings.length > 0) {
        bpReadings.forEach((r) => {
          reportContent += `- ${format(new Date(r.timestamp), "dd/MM/yyyy HH:mm")}: Sistolik ${r.systolic}, Diastolik ${r.diastolic}, Denyut ${r.pulse} BPM\n`;
        });
      } else {
        reportContent += "Tidak ada data tekanan darah yang tercatat.\n";
      }
      reportContent += "\n";

      // Data Diet
      reportContent += "Catatan Diet (10 hari terakhir):\n";
      if (foodLogs.length > 0) {
        foodLogs.forEach((log) => {
          reportContent += `- ${format(new Date(log.timestamp), "dd/MM/yyyy")}: ${log.description}\n`;
        });
      } else {
        reportContent += "Tidak ada data diet yang tercatat.\n";
      }
      reportContent += "\n";

      // Data Aktivitas
      reportContent += "Catatan Aktivitas (10 hari terakhir):\n";
      if (activityLogs.length > 0) {
        activityLogs.forEach((log) => {
          reportContent += `- ${format(new Date(log.timestamp), "dd/MM/yyyy")}: ${log.steps.toLocaleString()} langkah, ${log.duration} menit\n`;
        });
      } else {
        reportContent += "Tidak ada data aktivitas yang tercatat.\n";
      }
      reportContent += "\n";

      reportContent += "--- Akhir Laporan ---";

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
