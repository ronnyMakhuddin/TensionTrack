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
import type { ActivityLog, PersonalizedGoals, UserProfile, BloodPressureReading } from "@/lib/types";
import { activityAdvice } from "@/ai/flows/activity-advice";
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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isToday } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Flame, Loader2, Sparkles, CheckCircle, AlertTriangle, Minus } from "lucide-react";

const activityLogSchema = z.object({
  steps: z.coerce.number(),
  duration: z.coerce.number().min(0, "Durasi harus positif.").max(1440, "Durasi terlalu lama."),
  activityType: z.string().min(1, "Pilih jenis aktivitas."),
  description: z.string().min(10, "Jelaskan aktivitas minimal 10 karakter."),
  intensity: z.enum(["low", "medium", "high"]),
  healthConditions: z.string().optional(),
  lifestyleFactors: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.activityType === "walking" && data.steps <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Jumlah langkah harus diisi jika memilih Jalan Kaki.",
      path: ["steps"],
    });
  }
});

const activityTypes = [
  { value: "exercise", label: "Olahraga", impact: "positive" },
  { value: "walking", label: "Jalan Kaki", impact: "positive" },
  { value: "smoking", label: "Merokok", impact: "negative" },
  { value: "alcohol", label: "Minum Alkohol", impact: "negative" },
  { value: "sedentary", label: "Duduk Lama", impact: "negative" },
  { value: "stress", label: "Stres", impact: "negative" },
  { value: "meditation", label: "Meditasi", impact: "positive" },
  { value: "yoga", label: "Yoga", impact: "positive" },
  { value: "gaming", label: "Bermain Game", impact: "neutral" },
  { value: "social", label: "Aktivitas Sosial", impact: "positive" },
  { value: "work", label: "Bekerja", impact: "neutral" },
  { value: "other", label: "Lainnya", impact: "neutral" },
];

type ActivityFormType = z.infer<typeof activityLogSchema>;

export default function ActivityPage() {
  const { user } = useAuth();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [bloodPressureReadings, setBloodPressureReadings] = useState<BloodPressureReading[]>([]);
  const [personalizedGoals, setPersonalizedGoals] = useState<PersonalizedGoals | null>(null);
  const [advice, setAdvice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ActivityFormType>({
    resolver: zodResolver(activityLogSchema),
    defaultValues: { 
      steps: 0, 
      duration: 0, 
      activityType: "",
      description: "",
      intensity: "medium",
      healthConditions: "",
      lifestyleFactors: ""
    },
  });

  useEffect(() => {
    if (!user || !db) return;

    // Fetch Activity Logs
    const activityQuery = query(collection(db, "users", user.uid, "activity"), orderBy("timestamp", "desc"));
    const unsubscribeActivity = onSnapshot(activityQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ActivityLog[];
      setActivityLogs(data);
    });

    // Fetch Blood Pressure Readings
    const bpQuery = query(collection(db, "users", user.uid, "readings"), orderBy("timestamp", "desc"));
    const unsubscribeBP = onSnapshot(bpQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BloodPressureReading[];
      setBloodPressureReadings(data);
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
        unsubscribeBP();
        unsubscribeProfile();
    };
  }, [user]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "activityType" && value.activityType !== "walking" && value.steps !== 0) {
        form.setValue("steps", 0);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const getActivityStatus = (activityType: string, intensity: string) => {
    const activity = activityTypes.find(a => a.value === activityType);
    if (!activity) return { text: "Tidak Diketahui", color: "text-gray-500", icon: Minus };
    
    if (activity.impact === "positive") {
      return { text: "Sehat", color: "text-green-500", icon: CheckCircle };
    } else if (activity.impact === "negative") {
      return { text: "Tidak Sehat", color: "text-red-500", icon: AlertTriangle };
    } else {
      return { text: "Netral", color: "text-yellow-500", icon: Minus };
    }
  };

  const onSubmit = async (values: ActivityFormType) => {
    if (!user || !db) return;
    if (values.steps === 0 && values.duration === 0) {
      form.setError("steps", { message: "Harap isi langkah atau durasi." });
      return;
    }
    
    setIsLoading(true);
    
    try {
        // Simpan aktivitas
        const activity = activityTypes.find(a => a.value === values.activityType);
        await addDoc(collection(db, "users", user.uid, "activity"), {
            steps: values.steps,
            duration: values.duration,
            activityType: values.activityType,
            description: values.description,
            intensity: values.intensity,
            healthImpact: activity?.impact || "neutral",
            timestamp: new Date().toISOString(),
        });

        // Generate saran AI
        const activityHistory = activityLogs
          .slice(0, 7)
          .map(log => `${log.activityType || 'Aktivitas'} - ${log.description} (${log.duration} menit, ${log.timestamp && format(new Date(log.timestamp), "dd/MM")})`)
          .join(", ") || "Belum ada riwayat aktivitas";

        const activityTypesList = [...new Set(activityLogs.map(log => log.activityType).filter((type): type is string => Boolean(type)))];
        const unhealthyHabits = activityTypesList.filter(type => 
          activityTypes.find(a => a.value === type)?.impact === "negative"
        );

        const bpHistory = bloodPressureReadings
          .slice(0, 5)
          .map(r => `${r.systolic}/${r.diastolic} mmHg (${r.timestamp && format(new Date(r.timestamp), "dd/MM")})`)
          .join(", ") || "Belum ada data tekanan darah";

        const result = await activityAdvice({
          activityHistory,
          activityTypes: activityTypesList,
          unhealthyHabits,
          healthConditions: values.healthConditions || "Tidak ada kondisi kesehatan khusus",
          lifestyleFactors: values.lifestyleFactors || "Tidak ada faktor gaya hidup khusus",
          bloodPressureReadings: bpHistory,
        });

        setAdvice(result);
        form.reset({ 
          steps: 0, 
          duration: 0, 
          activityType: "",
          description: "",
          intensity: "medium",
          healthConditions: "",
          lifestyleFactors: ""
        });
        
        toast({
            title: "Aktivitas Dicatat",
            description: "Aktivitas Anda berhasil dicatat dan saran AI telah dibuat.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Kesalahan",
            description: "Gagal mencatat aktivitas atau membuat saran AI.",
        });
        console.error("Error adding activity log: ", error);
    } finally {
        setIsLoading(false);
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
        description="Catat berbagai jenis aktivitas harian Anda dan dapatkan saran AI untuk gaya hidup yang lebih sehat."
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
          <CardDescription>Catat berbagai jenis aktivitas termasuk kebiasaan tidak sehat untuk mendapatkan saran yang tepat.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="activityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis Aktivitas</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis aktivitas" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {activityTypes.map((activity) => (
                          <SelectItem key={activity.value} value={activity.value}>
                            {activity.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {form.watch("activityType") === "walking" && (
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
                )}
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
                <FormField
                  control={form.control}
                  name="intensity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intensitas</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih intensitas" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="low">Rendah</SelectItem>
                          <SelectItem value="medium">Sedang</SelectItem>
                          <SelectItem value="high">Tinggi</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Aktivitas</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Jelaskan aktivitas Anda secara detail..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="healthConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kondisi Kesehatan (Opsional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Apakah ada kondisi kesehatan yang mempengaruhi aktivitas Anda?" 
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
                          placeholder="Apakah ada faktor gaya hidup yang mempengaruhi aktivitas Anda?" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
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
              <CardTitle>Saran AI untuk Aktivitas Anda</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert>
              <AlertDescription className="font-medium">
                {advice.activityAssessment}
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-green-600">Dampak Positif:</h4>
                <ul className="space-y-1">
                  {advice.healthImpact.positive.map((impact: string, index: number) => (
                    <li key={index} className="text-sm">• {impact}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-red-600">Dampak Negatif:</h4>
                <ul className="space-y-1">
                  {advice.healthImpact.negative.map((impact: string, index: number) => (
                    <li key={index} className="text-sm">• {impact}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2 text-blue-600">Tingkatkan:</h4>
                <ul className="space-y-1">
                  {advice.recommendations.increase.map((rec: string, index: number) => (
                    <li key={index} className="text-sm">• {rec}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-orange-600">Kurangi:</h4>
                <ul className="space-y-1">
                  {advice.recommendations.reduce.map((rec: string, index: number) => (
                    <li key={index} className="text-sm">• {rec}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-green-600">Ganti Dengan:</h4>
                <ul className="space-y-1">
                  {advice.recommendations.replace.map((rec: string, index: number) => (
                    <li key={index} className="text-sm">• {rec}</li>
                  ))}
                </ul>
              </div>
            </div>

            {advice.specificAdvice && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                {advice.specificAdvice.smoking && (
                  <div>
                    <h4 className="font-semibold mb-2 text-red-600">Saran untuk Merokok:</h4>
                    <p className="text-sm">{advice.specificAdvice.smoking}</p>
                  </div>
                )}
                {advice.specificAdvice.alcohol && (
                  <div>
                    <h4 className="font-semibold mb-2 text-orange-600">Saran untuk Alkohol:</h4>
                    <p className="text-sm">{advice.specificAdvice.alcohol}</p>
                  </div>
                )}
                {advice.specificAdvice.exercise && (
                  <div>
                    <h4 className="font-semibold mb-2 text-green-600">Saran untuk Olahraga:</h4>
                    <p className="text-sm">{advice.specificAdvice.exercise}</p>
                  </div>
                )}
                {advice.specificAdvice.stress && (
                  <div>
                    <h4 className="font-semibold mb-2 text-purple-600">Saran untuk Stres:</h4>
                    <p className="text-sm">{advice.specificAdvice.stress}</p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div>
                <h4 className="font-semibold mb-2 text-red-600">Tanda Peringatan:</h4>
                <ul className="space-y-1">
                  {advice.warningSigns.map((sign: string, index: number) => (
                    <li key={index} className="text-sm">• {sign}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 text-blue-600">Tips Motivasi:</h4>
                <ul className="space-y-1">
                  {advice.motivationTips.map((tip: string, index: number) => (
                    <li key={index} className="text-sm">• {tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedLogs.length > 0 ? (
            <ul className="space-y-4">
              {sortedLogs.slice(0, 10).map((log) => {
                const status = getActivityStatus(log.activityType || "", log.intensity || "medium");
                const StatusIcon = status.icon;
                return (
                  <li key={log.id} className="p-4 border rounded-lg bg-background">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{log.activityType || "Aktivitas"}</p>
                          <StatusIcon className={`h-4 w-4 ${status.color}`} />
                          <span className={`text-xs ${status.color}`}>{status.text}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {log.timestamp && format(new Date(log.timestamp), "eeee, MMM d, yyyy")}
                        </p>
                        {log.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {log.description}
                          </p>
                        )}
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          {log.steps > 0 && <span>{log.steps.toLocaleString()} langkah</span>}
                          {log.duration > 0 && <span>{log.duration} menit</span>}
                          {log.intensity && <span>Intensitas: {log.intensity}</span>}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
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
