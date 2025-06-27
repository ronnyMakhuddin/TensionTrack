"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import type { SleepLog } from "@/lib/types";
import { sleepAdvice } from "@/ai/flows/sleep-advice";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Moon, Sparkles, CheckCircle, AlertTriangle } from "lucide-react";

const sleepLogSchema = z.object({
  duration: z.coerce.number().min(0.5, "Durasi tidur minimal 0.5 jam.").max(24, "Durasi tidur tidak wajar."),
  quality: z.string().min(10, "Jelaskan kualitas tidur Anda minimal 10 karakter."),
  healthConditions: z.string().optional(),
  lifestyleFactors: z.string().optional(),
});

export default function SleepPage() {
  const { user } = useAuth();
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [advice, setAdvice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof sleepLogSchema>>({
    resolver: zodResolver(sleepLogSchema),
    defaultValues: { 
      duration: 8,
      quality: "",
      healthConditions: "",
      lifestyleFactors: ""
    },
  });

  useEffect(() => {
    if (!user || !db) return;
    const sleepQuery = query(collection(db, "users", user.uid, "sleep"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(sleepQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SleepLog[];
      setSleepLogs(data);
    });
    return () => unsubscribe();
  }, [user]);

  const getSleepStatus = (duration: number) => {
    if (duration < 6) return { text: "Kurang", color: "text-red-500", icon: AlertTriangle };
    if (duration >= 6 && duration <= 9) return { text: "Optimal", color: "text-green-500", icon: CheckCircle };
    if (duration > 9) return { text: "Berlebihan", color: "text-yellow-500", icon: AlertTriangle };
    return { text: "N/A", color: "text-muted-foreground", icon: Moon };
  };

  const onSubmit = async (values: z.infer<typeof sleepLogSchema>) => {
    if (!user || !db) return;
    setIsLoading(true);
    
    try {
      // Simpan data tidur
      await addDoc(collection(db, "users", user.uid, "sleep"), {
        duration: values.duration,
        quality: values.quality,
        healthConditions: values.healthConditions || "",
        lifestyleFactors: values.lifestyleFactors || "",
        timestamp: new Date().toISOString(),
      });

      // Generate saran AI
      const sleepHistory = sleepLogs
        .slice(0, 7)
        .map(log => `${log.duration.toFixed(1)} jam (${log.timestamp && format(new Date(log.timestamp), "dd/MM")})`)
        .join(", ") || "Belum ada riwayat tidur";

      const averageDuration = sleepLogs.length > 0 
        ? sleepLogs.reduce((sum, log) => sum + log.duration, 0) / sleepLogs.length 
        : values.duration;

      const result = await sleepAdvice({
        sleepHistory,
        averageSleepDuration: averageDuration,
        sleepQuality: values.quality,
        healthConditions: values.healthConditions || "Tidak ada kondisi kesehatan khusus",
        lifestyleFactors: values.lifestyleFactors || "Tidak ada faktor gaya hidup khusus",
      });

      setAdvice(result);
      form.reset({ 
        duration: 8,
        quality: "",
        healthConditions: "",
        lifestyleFactors: ""
      });
      
      toast({
        title: "Tidur Dicatat",
        description: "Data tidur Anda berhasil dicatat dan saran AI telah dibuat.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Kesalahan",
        description: "Gagal mencatat data tidur atau membuat saran AI.",
      });
      console.error("Error adding sleep log: ", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const sortedLogs = [...sleepLogs].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catatan Tidur"
        description="Catat durasi tidur harian Anda dan dapatkan saran AI untuk meningkatkan kualitas tidur."
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Catat Data Tidur Baru</CardTitle>
          <CardDescription>Masukkan detail tidur Anda untuk mendapatkan saran yang dipersonalisasi.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durasi Tidur (jam)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="contoh: 8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kualitas Tidur</FormLabel>
                      <FormControl>
                        <Input placeholder="Bagaimana kualitas tidur Anda?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="healthConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kondisi Kesehatan (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Apakah ada kondisi kesehatan yang mempengaruhi tidur Anda?" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lifestyleFactors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Faktor Gaya Hidup (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Apakah ada faktor gaya hidup yang mempengaruhi tidur Anda?" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Memproses..." : "Tambah Catatan & Dapatkan Saran"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {advice && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>Saran AI untuk Tidur Anda</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription className="font-medium">
                {advice.sleepAssessment}
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Rekomendasi:</h4>
                <ul className="space-y-1">
                  {advice.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="text-sm">• {rec}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Tips Kebersihan Tidur:</h4>
                <ul className="space-y-1">
                  {advice.sleepHygieneTips.map((tip: string, index: number) => (
                    <li key={index} className="text-sm">• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Durasi Optimal</p>
                <p className="text-lg font-bold">{advice.suggestedSleepDuration.optimal} jam</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Rentang Sehat</p>
                <p className="text-sm">{advice.suggestedSleepDuration.min}-{advice.suggestedSleepDuration.max} jam</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Tanda Peringatan</p>
                <p className="text-sm text-red-500">{advice.warningSigns.length} item</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Tidur Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedLogs.length > 0 ? (
            <ul className="space-y-4">
              {sortedLogs.slice(0, 10).map((log) => {
                const status = getSleepStatus(log.duration);
                const StatusIcon = status.icon;
                return (
                  <li key={log.id} className="p-4 border rounded-lg bg-background">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{log.duration.toFixed(1)} jam</p>
                          <StatusIcon className={`h-4 w-4 ${status.color}`} />
                          <span className={`text-xs ${status.color}`}>{status.text}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {log.timestamp && format(new Date(log.timestamp), "eeee, MMM d, yyyy")}
                        </p>
                        {log.quality && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Kualitas: {log.quality}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex h-[100px] w-full items-center justify-center text-muted-foreground">
              Anda belum mencatat data tidur apa pun.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
