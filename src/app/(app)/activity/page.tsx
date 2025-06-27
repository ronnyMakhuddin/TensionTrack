"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import type { ActivityLog, PersonalizedGoals, UserProfile } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format, isToday } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Flame } from "lucide-react";

const activityLogSchema = z.object({
  steps: z.coerce.number().min(0, "Langkah harus positif.").max(100000, "Langkah terlalu banyak."),
  duration: z.coerce.number().min(0, "Durasi harus positif.").max(1440, "Durasi terlalu lama."),
});

export default function ActivityPage() {
  const { user } = useAuth();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [personalizedGoals, setPersonalizedGoals] = useState<PersonalizedGoals | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof activityLogSchema>>({
    resolver: zodResolver(activityLogSchema),
    defaultValues: { steps: 0, duration: 0 },
  });

  useEffect(() => {
    if (!user) return;

    // Fetch Activity Logs
    const activityQuery = query(collection(db, "users", user.uid, "activity"), orderBy("timestamp", "desc"));
    const unsubscribeActivity = onSnapshot(activityQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ActivityLog[];
      setActivityLogs(data);
    });

    // Fetch Personalized Goals from user profile
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data() as UserProfile;
        if (userData.stepGoal && userData.durationGoal) {
          setPersonalizedGoals({
            stepGoal: userData.stepGoal,
            durationGoal: userData.durationGoal,
          });
        }
      }
    });
    
    return () => {
        unsubscribeActivity();
        unsubscribeProfile();
    };
  }, [user]);

  const onSubmit = async (values: z.infer<typeof activityLogSchema>) => {
    if (!user) return;
    if (values.steps === 0 && values.duration === 0) {
      form.setError("steps", { message: "Harap isi langkah atau durasi." });
      return;
    }
    
    try {
        await addDoc(collection(db, "users", user.uid, "activity"), {
            steps: values.steps,
            duration: values.duration,
            timestamp: new Date().toISOString(),
        });
        form.reset({ steps: 0, duration: 0 });
        toast({
            title: "Aktivitas Dicatat",
            description: "Aktivitas Anda berhasil dicatat.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Kesalahan",
            description: "Gagal mencatat aktivitas.",
        });
        console.error("Error adding activity log: ", error);
    }
  };
  
  const sortedLogs = [...activityLogs].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  const todaySteps = activityLogs
    .filter((log) => log.timestamp && isToday(new Date(log.timestamp)))
    .reduce((total, log) => total + log.steps, 0);

  const dailyStepGoal = personalizedGoals?.stepGoal ?? 10000;
  const dailyDurationGoal = personalizedGoals?.durationGoal ?? 30;

  const stepProgress = Math.min((todaySteps / dailyStepGoal) * 100, 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pelacakan Aktivitas"
        description="Catat aktivitas fisik harian Anda untuk tetap termotivasi."
      />

      <Card>
        <CardHeader>
          <CardTitle>Tantangan Harian</CardTitle>
          {personalizedGoals ? (
             <CardDescription>
              Berdasarkan saran AI, target Anda hari ini adalah {dailyStepGoal.toLocaleString()} langkah atau {dailyDurationGoal} menit aktivitas.
            </CardDescription>
          ) : (
            <CardDescription>
              Capai target 10.000 langkah hari ini! Untuk tantangan yang dipersonalisasi, kunjungi halaman <Button variant="link" asChild className="p-0 h-auto text-base"><Link href="/advice">Saran AI</Link></Button>.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Flame className="h-6 w-6 text-orange-500" />
            <div className="w-full">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{todaySteps.toLocaleString()} / {dailyStepGoal.toLocaleString()} langkah</span>
                <span className="text-sm font-bold">{stepProgress.toFixed(0)}%</span>
              </div>
              <Progress value={stepProgress} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Catat Aktivitas Baru</CardTitle>
          <CardDescription>Masukkan jumlah langkah dan durasi (dalam menit).</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="steps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah Langkah</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="misal: 5000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durasi (menit)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="misal: 30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit">Tambah Catatan</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedLogs.length > 0 ? (
            <ul className="space-y-4">
              {sortedLogs.slice(0, 10).map((log) => (
                <li key={log.id} className="p-4 border rounded-lg bg-background flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {log.steps > 0 && `${log.steps.toLocaleString()} langkah`}{log.steps > 0 && log.duration > 0 && ', '}{log.duration > 0 && `${log.duration} menit`}
                    </p>
                    <p className="text-sm text-muted-foreground">{log.timestamp && format(new Date(log.timestamp), "MMM d, yyyy 'pukul' p")}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-[100px] w-full items-center justify-center text-muted-foreground">
              Anda belum mencatat aktivitas apa pun.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
