
"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { personalizedHypertensionAdvice } from "@/ai/flows/personalized-hypertension-advice";
import type { BloodPressureReading, FoodLog, UserProfile } from "@/lib/types";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const adviceSchema = z.object({
  activityLevel: z
    .string()
    .min(10, "Harap jelaskan tingkat aktivitas Anda lebih detail."),
  stressLevels: z
    .string()
    .min(10, "Harap jelaskan tingkat stres Anda lebih detail."),
  healthHistory: z
    .string()
    .min(10, "Harap jelaskan riwayat kesehatan Anda lebih detail."),
});

export default function AdvicePage() {
  const { user } = useAuth();
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof adviceSchema>>({
    resolver: zodResolver(adviceSchema),
    defaultValues: {
      activityLevel: "Saya berjalan kaki sekitar 30 menit setiap hari dan melakukan pekerjaan kebun ringan di akhir pekan.",
      stressLevels: "Pekerjaan saya bisa membuat stres, tetapi saya mencoba untuk bersantai dengan membaca atau mendengarkan musik di malam hari.",
      healthHistory: "Tidak ada riwayat penyakit serius, hanya hipertensi yang baru terdiagnosis.",
    },
  });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);
        if(docSnap.exists()){
            const data = docSnap.data() as UserProfile;
            if (data.healthHistory) {
                form.setValue("healthHistory", data.healthHistory);
            }
        }
    };
    fetchProfile();
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof adviceSchema>) => {
    if (!user) return;
    
    setIsLoading(true);
    setAdvice(null);
    
    try {
      // Update user profile in Firestore, creating it if it doesn't exist.
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { healthHistory: values.healthHistory }, { merge: true });

      // Fetch latest data for the prompt
      const bpQuery = query(collection(db, "users", user.uid, "readings"), orderBy("timestamp", "desc"), limit(7));
      const foodQuery = query(collection(db, "users", user.uid, "food"), orderBy("timestamp", "desc"), limit(7));
      
      const bpSnapshot = await getDocs(bpQuery);
      const foodSnapshot = await getDocs(foodQuery);

      const bpReadings = bpSnapshot.docs.map(d => d.data() as BloodPressureReading);
      const foodLogs = foodSnapshot.docs.map(d => d.data() as FoodLog);

      const dietData =
        foodLogs
          .map(log => `- ${log.description} (pada ${new Date(log.timestamp).toLocaleDateString()})`)
          .join("\n") || "Tidak ada data diet terbaru yang dicatat.";

      const bloodPressureReadings =
        bpReadings
          .map(r => `- Sistolik: ${r.systolic}, Diastolik: ${r.diastolic}, Denyut Nadi: ${r.pulse} (pada ${new Date(r.timestamp).toLocaleDateString()})`)
          .join("\n") || "Tidak ada bacaan tekanan darah terbaru.";

      const result = await personalizedHypertensionAdvice({
        healthHistory: values.healthHistory,
        activityLevel: values.activityLevel,
        stressLevels: values.stressLevels,
        dietData,
        bloodPressureReadings,
      });

      setAdvice(result.advice);

      // Save personalized goals
      await setDoc(userDocRef, {
        stepGoal: result.suggestedStepGoal,
        durationGoal: result.suggestedDurationGoal,
      }, { merge: true });

      toast({
        title: "Saran Dihasilkan",
        description: "Tantangan harian Anda di halaman Aktivitas telah diperbarui.",
      });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Kesalahan",
        description: "Gagal menghasilkan saran. Silakan coba lagi.",
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Saran AI Personalisasi"
        description="Dapatkan rekomendasi bertenaga AI berdasarkan gaya hidup Anda."
      />

      <Card>
        <CardHeader>
          <CardTitle>Informasi Gaya Hidup & Kesehatan</CardTitle>
          <CardDescription>
            Berikan beberapa detail tentang gaya hidup dan riwayat kesehatan Anda. Data diet dan tekanan darah terbaru akan disertakan secara otomatis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                control={form.control}
                name="healthHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Riwayat Kesehatan</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="contoh: Saya memiliki riwayat hipertensi dalam keluarga."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="activityLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tingkat Aktivitas</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="contoh: Saya berjalan kaki selama 30 menit 3 kali seminggu."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stressLevels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tingkat Stres & Manajemen</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="contoh: Saya memiliki pekerjaan dengan tingkat stres tinggi. Saya berlatih meditasi selama 10 menit setiap hari."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Hasilkan Saran
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {advice && (
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertTitle>Saran Personalisasi Anda</AlertTitle>
          <AlertDescription>
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: advice.replace(/\n/g, '<br />') }}></div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
