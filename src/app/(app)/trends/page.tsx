"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, getDoc, doc } from "firebase/firestore";
import type { ActivityLog, BloodPressureReading, SleepLog, ExerciseLog, FoodLog, PatientProfile } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { BloodPressureChart } from "@/components/blood-pressure-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, TrendingDown, Activity, Heart, Utensils, Moon, Target, FileText, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

const activityChartConfig = {
  steps: {
    label: "Langkah",
    color: "hsl(var(--chart-1))",
  },
  duration: {
    label: "Durasi (menit)",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

const sleepChartConfig = {
  duration: {
    label: "Durasi (jam)",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const exerciseChartConfig = {
  duration: {
    label: "Durasi (menit)",
    color: "hsl(var(--chart-4))",
  },
  pulse: {
    label: "Detak Jantung (BPM)",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig;

export default function TrendsPage() {
  const { user } = useAuth();
  const [bpReadings, setBpReadings] = useState<BloodPressureReading[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [healthScore, setHealthScore] = useState<number>(0);
  const [healthTrend, setHealthTrend] = useState<'improving' | 'declining' | 'stable'>('stable');
  const [aiPlan, setAiPlan] = useState<string>('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !db) return;
    
    const bpQuery = query(collection(db, "users", user.uid, "readings"), orderBy("timestamp", "desc"));
    const unsubscribeBp = onSnapshot(bpQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})) as BloodPressureReading[];
        setBpReadings(data);
    });

    const activityQuery = query(collection(db, "users", user.uid, "activity"), orderBy("timestamp", "desc"));
    const unsubscribeActivity = onSnapshot(activityQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})) as ActivityLog[];
        setActivityLogs(data);
    });

    const sleepQuery = query(collection(db, "users", user.uid, "sleep"), orderBy("timestamp", "desc"));
    const unsubscribeSleep = onSnapshot(sleepQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})) as SleepLog[];
        setSleepLogs(data);
    });

    const exerciseQuery = query(collection(db, "users", user.uid, "exercises"), orderBy("timestamp", "desc"));
    const unsubscribeExercise = onSnapshot(exerciseQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})) as ExerciseLog[];
        setExerciseLogs(data);
    });

    const foodQuery = query(collection(db, "users", user.uid, "food"), orderBy("timestamp", "desc"));
    const unsubscribeFood = onSnapshot(foodQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})) as FoodLog[];
        setFoodLogs(data);
    });

    // Fetch patient profile
    const fetchProfile = async () => {
      try {
        const profileDoc = await getDoc(doc(db!, "users", user.uid, "profile", "data"));
        if (profileDoc.exists()) {
          setPatientProfile(profileDoc.data() as PatientProfile);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };
    fetchProfile();

    return () => {
        unsubscribeBp();
        unsubscribeActivity();
        unsubscribeSleep();
        unsubscribeExercise();
        unsubscribeFood();
    };
  }, [user]);

  // Calculate health score and trend
  useEffect(() => {
    let score = 0;
    let totalFactors = 0;

    // Blood pressure score (30%)
    if (bpReadings.length > 0) {
      const recentBP = bpReadings[0];
      const avgSystolic = bpReadings.slice(0, 5).reduce((sum, r) => sum + r.systolic, 0) / Math.min(bpReadings.length, 5);
      const avgDiastolic = bpReadings.slice(0, 5).reduce((sum, r) => sum + r.diastolic, 0) / Math.min(bpReadings.length, 5);
      
      if (avgSystolic < 120 && avgDiastolic < 80) score += 30;
      else if (avgSystolic < 130 && avgDiastolic < 85) score += 25;
      else if (avgSystolic < 140 && avgDiastolic < 90) score += 20;
      else if (avgSystolic < 160 && avgDiastolic < 100) score += 10;
      else score += 5;
      totalFactors += 30;
    }

    // Activity score (25%)
    if (activityLogs.length > 0) {
      const positiveActivities = activityLogs.filter(log => log.healthImpact === "positive").length;
      const totalActivities = activityLogs.length;
      const activityRatio = positiveActivities / totalActivities;
      score += activityRatio * 25;
      totalFactors += 25;
    }

    // Sleep score (20%)
    if (sleepLogs.length > 0) {
      const avgSleep = sleepLogs.reduce((sum, log) => sum + log.duration, 0) / sleepLogs.length;
      if (avgSleep >= 7 && avgSleep <= 9) score += 20;
      else if (avgSleep >= 6 && avgSleep <= 10) score += 15;
      else if (avgSleep >= 5 && avgSleep <= 11) score += 10;
      else score += 5;
      totalFactors += 20;
    }

    // Exercise score (15%)
    if (exerciseLogs.length > 0) {
      const avgDuration = exerciseLogs.reduce((sum, log) => sum + log.duration, 0) / exerciseLogs.length;
      if (avgDuration >= 30) score += 15;
      else if (avgDuration >= 20) score += 12;
      else if (avgDuration >= 10) score += 8;
      else score += 4;
      totalFactors += 15;
    }

    // Diet score (10%)
    if (foodLogs.length > 0) {
      // Simple scoring based on food log frequency (assuming regular logging = healthy eating)
      const recentFoodLogs = foodLogs.filter(log => {
        const logDate = new Date(log.timestamp);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate >= weekAgo;
      });
      if (recentFoodLogs.length >= 7) score += 10;
      else if (recentFoodLogs.length >= 5) score += 8;
      else if (recentFoodLogs.length >= 3) score += 5;
      else score += 2;
      totalFactors += 10;
    }

    const finalScore = totalFactors > 0 ? Math.round((score / totalFactors) * 100) : 0;
    setHealthScore(finalScore);

    // Determine trend based on recent vs older data
    if (bpReadings.length >= 2) {
      const recentAvg = bpReadings.slice(0, 3).reduce((sum, r) => sum + r.systolic, 0) / 3;
      const olderAvg = bpReadings.slice(3, 6).reduce((sum, r) => sum + r.systolic, 0) / 3;
      if (recentAvg < olderAvg) setHealthTrend('improving');
      else if (recentAvg > olderAvg) setHealthTrend('declining');
      else setHealthTrend('stable');
    }
  }, [bpReadings, activityLogs, sleepLogs, exerciseLogs, foodLogs]);

  const activityChartData = [...activityLogs]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-7) // Get last 7 days
    .map((r) => ({
      ...r,
      date: format(new Date(r.timestamp), "MMM d"),
      activityName: r.activityType || r.description || 'Aktivitas',
      tooltipText: `${r.activityType || r.description || 'Aktivitas'} - ${r.duration} menit`
    }));

  const sleepChartData = [...sleepLogs]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-7) // Get last 7 days
    .map((r) => ({
      ...r,
      date: format(new Date(r.timestamp), "MMM d"),
      tooltipText: `${r.duration} jam tidur${r.quality ? ` - ${r.quality}` : ''}`
    }));

  const exerciseChartData = [...exerciseLogs]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-7) // Get last 7 days
    .map((r) => ({
      ...r,
      date: format(new Date(r.timestamp), "MMM d"),
      exerciseName: r.exerciseTitle || 'Latihan',
      tooltipText: `${r.exerciseTitle || 'Latihan'} - ${r.duration} menit - ${r.breathing}`
    }));

  // Generate AI plan for behavior change
  const generateAIPlan = async () => {
    if (!user || !db) return;
    
    setIsGeneratingPlan(true);
    try {
      // Prepare data for AI analysis
      const analysisData = {
        patientProfile,
        bpReadings: bpReadings.slice(0, 10),
        activityLogs: activityLogs.slice(0, 10),
        sleepLogs: sleepLogs.slice(0, 7),
        exerciseLogs: exerciseLogs.slice(0, 10),
        foodLogs: foodLogs.slice(0, 10),
        healthScore,
        healthTrend
      };

      // Call AI flow for behavior change plan
      const response = await fetch('/api/ai/behavior-change-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
      });

      if (response.ok) {
        const result = await response.json();
        setAiPlan(result.plan);
        toast({
          title: "AI Plan Generated",
          description: "Plan perubahan perilaku berhasil dibuat.",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate AI plan');
      }
    } catch (error) {
      console.error('Error generating AI plan:', error);
      // Generate fallback plan
      const fallbackPlan = generateFallbackPlan();
      setAiPlan(fallbackPlan);
      toast({
        title: "AI Plan Generated",
        description: "Plan perubahan perilaku berhasil dibuat (fallback mode).",
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Generate fallback plan when AI fails
  const generateFallbackPlan = () => {
    const recentBP = bpReadings[0];
    const avgSystolic = bpReadings.length > 0 ? bpReadings.slice(0, 5).reduce((sum, r) => sum + r.systolic, 0) / Math.min(bpReadings.length, 5) : 0;
    const avgDiastolic = bpReadings.length > 0 ? bpReadings.slice(0, 5).reduce((sum, r) => sum + r.diastolic, 0) / Math.min(bpReadings.length, 5) : 0;
    
    const positiveActivities = activityLogs.filter(log => log.healthImpact === "positive").length;
    const negativeActivities = activityLogs.filter(log => log.healthImpact === "negative").length;
    const totalActivities = activityLogs.length;
    
    const avgSleep = sleepLogs.length > 0 ? sleepLogs.reduce((sum, log) => sum + log.duration, 0) / sleepLogs.length : 0;
    const avgExercise = exerciseLogs.length > 0 ? exerciseLogs.reduce((sum, log) => sum + log.duration, 0) / exerciseLogs.length : 0;

    return `📋 PLAN PERUBAHAN PERILAKU
[Tanggal: ${new Date().toLocaleDateString('id-ID')}]

🎯 TUJUAN UTAMA:
1. Menurunkan tekanan darah ke target normal (<140/90 mmHg)
2. Meningkatkan aktivitas fisik sehat
3. Memperbaiki pola tidur
4. Mengurangi aktivitas tidak sehat

📅 TIMELINE 30 HARI:
Minggu 1: Fokus pada monitoring tekanan darah dan identifikasi pola
Minggu 2: Implementasi aktivitas fisik ringan
Minggu 3: Perbaikan pola tidur dan diet
Minggu 4: Konsolidasi dan evaluasi progress

📊 TARGET SPESIFIK:
- Tekanan Darah: Turun 10-15 mmHg dalam 30 hari
- Aktivitas: 30 menit aktivitas fisik 5x/minggu
- Tidur: 7-8 jam per malam
- Latihan: 20-30 menit latihan 3x/minggu

💡 STRATEGI IMPLEMENTASI:
1. Monitor tekanan darah 2x sehari
2. Jalan kaki 30 menit setiap pagi
3. Hindari makanan tinggi garam
4. Tidur teratur jam 22:00
5. Latihan ringan 3x seminggu
6. Kurangi aktivitas tidak sehat
7. Konsultasi rutin dengan Ners Counselor

⚠️ HALANGAN & SOLUSI:
- Halangan: Malas berolahraga
  Solusi: Mulai dengan aktivitas ringan, ajak keluarga
- Halangan: Sulit tidur
  Solusi: Rutinitas sebelum tidur, hindari gadget
- Halangan: Makanan tidak sehat
  Solusi: Siapkan makanan sehat, baca label nutrisi

📈 MONITORING & EVALUASI:
- Catat tekanan darah harian
- Track aktivitas di aplikasi
- Evaluasi mingguan dengan Ners Counselor
- Ukur progress setiap 2 minggu

🔔 REMINDER & MOTIVASI:
"Kesehatan adalah investasi terbaik. Setiap langkah kecil menuju gaya hidup sehat adalah kemenangan. Tetap semangat dan konsisten!"`;
  };

  // Health trend data for chart - make it dynamic based on actual data
  const getHealthTrendData = () => {
    const hasBP = bpReadings.length > 0;
    const hasActivity = activityLogs.length > 0;
    const hasSleep = sleepLogs.length > 0;
    const hasExercise = exerciseLogs.length > 0;
    const hasFood = foodLogs.length > 0;

    const data = [];
    if (hasBP) data.push({ name: 'Tekanan Darah', value: 30, color: '#ef4444' });
    if (hasActivity) data.push({ name: 'Aktivitas', value: 25, color: '#3b82f6' });
    if (hasSleep) data.push({ name: 'Tidur', value: 20, color: '#8b5cf6' });
    if (hasExercise) data.push({ name: 'Latihan', value: 15, color: '#10b981' });
    if (hasFood) data.push({ name: 'Diet', value: 10, color: '#f59e0b' });

    // If no data, show default
    if (data.length === 0) {
      return [
        { name: 'Tekanan Darah', value: 30, color: '#ef4444' },
        { name: 'Aktivitas', value: 25, color: '#3b82f6' },
        { name: 'Tidur', value: 20, color: '#8b5cf6' },
        { name: 'Latihan', value: 15, color: '#10b981' },
        { name: 'Diet', value: 10, color: '#f59e0b' },
      ];
    }

    return data;
  };

  // Activity impact data with better labels
  const getActivityImpactData = () => {
    if (activityLogs.length === 0) return [];

    const positive = activityLogs.filter(log => log.healthImpact === "positive").length;
    const negative = activityLogs.filter(log => log.healthImpact === "negative").length;
    const neutral = activityLogs.filter(log => log.healthImpact === "neutral").length;

    const data = [];
    if (positive > 0) data.push({ name: 'Aktivitas Sehat', value: positive, color: '#10b981' });
    if (negative > 0) data.push({ name: 'Aktivitas Tidak Sehat', value: negative, color: '#ef4444' });
    if (neutral > 0) data.push({ name: 'Aktivitas Netral', value: neutral, color: '#6b7280' });

    return data;
  };

  // Health trend histogram data
  const getHealthTrendHistogramData = () => {
    if (bpReadings.length < 2) return [];

    // Get last 7 readings for trend analysis
    const recentReadings = bpReadings.slice(0, 7).reverse();
    
    return recentReadings.map((reading, index) => {
      const date = new Date(reading.timestamp);
      const systolic = reading.systolic;
      const diastolic = reading.diastolic;
      
      // Calculate trend indicator
      let trend = 'stable';
      if (index > 0) {
        const prevSystolic = recentReadings[index - 1].systolic;
        if (systolic < prevSystolic) trend = 'improving';
        else if (systolic > prevSystolic) trend = 'declining';
      }

      return {
        date: format(date, "MMM d"),
        systolic,
        diastolic,
        trend,
        avgBP: Math.round((systolic + diastolic) / 2)
      };
    });
  };

  // Activity trend histogram data
  const getActivityTrendHistogramData = () => {
    if (activityLogs.length < 2) return [];

    // Get last 7 activity logs
    const recentActivities = activityLogs.slice(0, 7).reverse();
    
    return recentActivities.map((activity, index) => {
      const date = new Date(activity.timestamp);
      const positiveCount = activityLogs.filter(log => 
        new Date(log.timestamp) <= date && log.healthImpact === "positive"
      ).length;
      const totalCount = activityLogs.filter(log => 
        new Date(log.timestamp) <= date
      ).length;
      
      const healthRatio = totalCount > 0 ? (positiveCount / totalCount) * 100 : 0;
      
      // Calculate trend
      let trend = 'stable';
      if (index > 0) {
        const prevActivity = recentActivities[index - 1];
        const prevPositiveCount = activityLogs.filter(log => 
          new Date(log.timestamp) <= new Date(prevActivity.timestamp) && log.healthImpact === "positive"
        ).length;
        const prevTotalCount = activityLogs.filter(log => 
          new Date(log.timestamp) <= new Date(prevActivity.timestamp)
        ).length;
        const prevHealthRatio = prevTotalCount > 0 ? (prevPositiveCount / prevTotalCount) * 100 : 0;
        
        if (healthRatio > prevHealthRatio) trend = 'improving';
        else if (healthRatio < prevHealthRatio) trend = 'declining';
      }

      return {
        date: format(date, "MMM d"),
        healthRatio: Math.round(healthRatio),
        duration: activity.duration,
        trend
      };
    });
  };

  // Health trend data for chart
  const healthTrendData = getHealthTrendData();

  // Activity impact data
  const activityImpactData = getActivityImpactData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tren Kesehatan Anda"
        description="Pantau perubahan tekanan darah dan aktivitas Anda dari waktu ke waktu."
      />
      
      {/* Health Analysis Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Komposisi Health Score</CardTitle>
            <CardDescription>Persentase kontribusi setiap faktor kesehatan</CardDescription>
          </CardHeader>
          <CardContent>
            {healthTrendData.length > 0 ? (
              <>
                <PieChart width={300} height={200}>
                  <Pie
                    data={healthTrendData}
                    cx={150}
                    cy={100}
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {healthTrendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="mt-4 space-y-2">
                  {healthTrendData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
                Belum ada data kesehatan
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dampak Aktivitas</CardTitle>
            <CardDescription>Distribusi aktivitas berdasarkan dampak kesehatan</CardDescription>
          </CardHeader>
          <CardContent>
            {activityImpactData.length > 0 ? (
              <>
                <PieChart width={300} height={200}>
                  <Pie
                    data={activityImpactData}
                    cx={150}
                    cy={100}
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {activityImpactData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="mt-4 space-y-2">
                  {activityImpactData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value} aktivitas</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
                Belum ada data aktivitas
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BloodPressureChart data={bpReadings} showReadings={7} />
        <Card>
          <CardHeader>
            <CardTitle>Tren Aktivitas</CardTitle>
            <CardDescription>Grafik garis aktivitas 7 hari terakhir.</CardDescription>
          </CardHeader>
          <CardContent>
            {activityChartData.length > 0 ? (
              <div className="space-y-4">
                <LineChart width={400} height={200} data={activityChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Line 
                    type="monotone" 
                    dataKey="steps" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Langkah"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="duration" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Durasi (menit)"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
                <div className="flex justify-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Langkah</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Durasi (menit)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
                Catat aktivitas pertama Anda untuk melihat grafik.
              </div>
            )}
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Tren Tidur</CardTitle>
            <CardDescription>Grafik garis data tidur 7 hari terakhir.</CardDescription>
          </CardHeader>
          <CardContent>
            {sleepChartData.length > 0 ? (
              <div className="space-y-4">
                <LineChart width={400} height={200} data={sleepChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Line 
                    type="monotone" 
                    dataKey="duration" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    name="Durasi (jam)"
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
                <div className="flex justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm">Durasi (jam)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
                Catat data tidur pertama Anda untuk melihat grafik.
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tren Latihan</CardTitle>
            <CardDescription>Grafik garis data latihan 7 hari terakhir.</CardDescription>
          </CardHeader>
          <CardContent>
            {exerciseChartData.length > 0 ? (
              <div className="space-y-4">
                <LineChart width={400} height={200} data={exerciseChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Line 
                    type="monotone" 
                    dataKey="duration" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    name="Durasi (menit)"
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pulse" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Detak Jantung (BPM)"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
                <div className="flex justify-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm">Durasi (menit)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Detak Jantung (BPM)</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
                Catat latihan pertama Anda untuk melihat grafik.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Behavior Change Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>AI Plan Perubahan Perilaku</span>
              </CardTitle>
              <CardDescription>
                Rekomendasi personal untuk meningkatkan kesehatan berdasarkan data Anda
              </CardDescription>
            </div>
            <Button 
              onClick={generateAIPlan} 
              disabled={isGeneratingPlan}
              className="flex items-center space-x-2"
            >
              <Target className="h-4 w-4" />
              <span>{isGeneratingPlan ? 'Membuat Plan...' : 'Generate Plan'}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {aiPlan ? (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📋 Plan Perubahan Perilaku</h4>
                <div className="whitespace-pre-wrap text-sm">{aiPlan}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Klik "Generate Plan" untuk mendapatkan rekomendasi personal</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nurse Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Laporan untuk Ners Counselor</span>
          </CardTitle>
          <CardDescription>
            Resume kesehatan pasien untuk konsultasi dengan Ners Counselor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Patient Info */}
            {patientProfile && (
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-3">📋 Informasi Pasien</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Nama:</span>
                    <p>{patientProfile.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Usia:</span>
                    <p>{calculateAge(patientProfile.birthDate)} tahun</p>
                  </div>
                  <div>
                    <span className="font-medium">Gender:</span>
                    <p>{patientProfile.gender}</p>
                  </div>
                  <div>
                    <span className="font-medium">No. HP:</span>
                    <p>{patientProfile.phoneNumber}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Health Summary */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-3">🏥 Ringkasan Kesehatan</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{healthScore}%</div>
                  <div className="text-sm text-muted-foreground">Health Score</div>
                  <Badge variant={healthScore >= 70 ? "default" : healthScore >= 50 ? "secondary" : "destructive"}>
                    {healthScore >= 70 ? "Baik" : healthScore >= 50 ? "Sedang" : "Perlu Perbaikan"}
                  </Badge>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{bpReadings.length}</div>
                  <div className="text-sm text-muted-foreground">Pengukuran TD</div>
                  {bpReadings.length > 0 && (
                    <div className="text-xs">
                      Terakhir: {bpReadings[0].systolic}/{bpReadings[0].diastolic} mmHg
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{activityLogs.length}</div>
                  <div className="text-sm text-muted-foreground">Aktivitas</div>
                  <div className="text-xs">
                    {activityLogs.filter(log => log.healthImpact === "positive").length} sehat
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Data */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-3">📊 Data Terkini</h4>
              <div className="space-y-3">
                {bpReadings.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Tekanan Darah Rata-rata (7 hari):</span>
                    <span className="font-medium">
                      {Math.round(bpReadings.slice(0, 7).reduce((sum, r) => sum + r.systolic, 0) / Math.min(bpReadings.length, 7))}/
                      {Math.round(bpReadings.slice(0, 7).reduce((sum, r) => sum + r.diastolic, 0) / Math.min(bpReadings.length, 7))} mmHg
                    </span>
                  </div>
                )}
                {sleepLogs.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Rata-rata Tidur (7 hari):</span>
                    <span className="font-medium">
                      {(sleepLogs.slice(0, 7).reduce((sum, log) => sum + log.duration, 0) / Math.min(sleepLogs.length, 7)).toFixed(1)} jam
                    </span>
                  </div>
                )}
                {exerciseLogs.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Rata-rata Latihan (7 hari):</span>
                    <span className="font-medium">
                      {Math.round(exerciseLogs.slice(0, 7).reduce((sum, log) => sum + log.duration, 0) / Math.min(exerciseLogs.length, 7))} menit
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-3">💡 Rekomendasi</h4>
              <div className="space-y-2 text-sm">
                {healthScore < 50 && (
                  <p>⚠️ Pasien memerlukan intervensi segera untuk meningkatkan kesehatan</p>
                )}
                {healthScore >= 50 && healthScore < 70 && (
                  <p>📈 Pasien perlu peningkatan dalam beberapa aspek kesehatan</p>
                )}
                {healthScore >= 70 && (
                  <p>✅ Pasien menunjukkan pola kesehatan yang baik</p>
                )}
                {bpReadings.length > 0 && bpReadings[0].systolic > 140 && (
                  <p>🩺 Perlu monitoring tekanan darah lebih ketat</p>
                )}
                {sleepLogs.length > 0 && sleepLogs[0].duration < 6 && (
                  <p>😴 Perlu perbaikan kualitas dan durasi tidur</p>
                )}
                {activityLogs.filter(log => log.healthImpact === "negative").length > 0 && (
                  <p>🚭 Perlu pengurangan aktivitas yang tidak sehat</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity and Exercise History Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Aktivitas</CardTitle>
            <CardDescription>Daftar aktivitas 7 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            {activityLogs.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Aktivitas</TableHead>
                      <TableHead>Durasi</TableHead>
                      <TableHead>Dampak</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLogs.slice(0, 7).map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium">
                          {format(new Date(activity.timestamp), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {activity.activityType || activity.description || 'Aktivitas'}
                            </div>
                            {activity.description && activity.activityType && (
                              <div className="text-sm text-muted-foreground">
                                {activity.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{activity.duration} menit</TableCell>
                        <TableCell>
                          <Badge variant={
                            activity.healthImpact === "positive" ? "default" :
                            activity.healthImpact === "negative" ? "destructive" : "secondary"
                          }>
                            {activity.healthImpact === "positive" ? "Sehat" :
                             activity.healthImpact === "negative" ? "Tidak Sehat" : "Netral"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
                Belum ada data aktivitas
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Riwayat Latihan</CardTitle>
            <CardDescription>Daftar latihan 7 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            {exerciseLogs.length > 0 ? (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Latihan</TableHead>
                      <TableHead>Durasi</TableHead>
                      <TableHead>Kondisi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exerciseLogs.slice(0, 7).map((exercise) => (
                      <TableRow key={exercise.id}>
                        <TableCell className="font-medium">
                          {format(new Date(exercise.timestamp), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {exercise.exerciseTitle || 'Latihan'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {exercise.notes}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{exercise.duration} menit</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              Detak: {exercise.pulse} BPM
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Nafas: {exercise.breathing}
                            </div>
                            <Badge variant={
                              exercise.difficulty === "easy" ? "default" :
                              exercise.difficulty === "medium" ? "secondary" : "destructive"
                            }>
                              {exercise.difficulty === "easy" ? "Mudah" :
                               exercise.difficulty === "medium" ? "Sedang" : "Sulit"}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
                Belum ada data latihan
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Health Trend Histograms */}
      {/* Dihapus: Chart tren tekanan darah dan aktivitas sehat manual, hanya tampilkan satu chart utama per kategori */}
      {/*
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        ...
      </div>
      */}

      {/* Blood Pressure History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Bacaan Tekanan Darah</CardTitle>
          <CardDescription>Daftar pengukuran tekanan darah 7 hari terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          {bpReadings.length > 0 ? (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Sistolik</TableHead>
                    <TableHead>Diastolik</TableHead>
                    <TableHead>Denyut Nadi</TableHead>
                    <TableHead>Kategori</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bpReadings.slice(0, 7).map((reading) => {
                    // Determine blood pressure category
                    let category = '';
                    let badgeVariant: "default" | "secondary" | "destructive" = "default";
                    
                    if (reading.systolic < 120 && reading.diastolic < 80) {
                      category = 'Normal';
                      badgeVariant = "default";
                    } else if (reading.systolic < 130 && reading.diastolic < 85) {
                      category = 'Tinggi Ringan';
                      badgeVariant = "secondary";
                    } else if (reading.systolic < 140 && reading.diastolic < 90) {
                      category = 'Tinggi Sedang';
                      badgeVariant = "secondary";
                    } else if (reading.systolic < 160 && reading.diastolic < 100) {
                      category = 'Tinggi';
                      badgeVariant = "destructive";
                    } else {
                      category = 'Tinggi Berat';
                      badgeVariant = "destructive";
                    }

                    return (
                      <TableRow key={reading.id}>
                        <TableCell className="font-medium">
                          {format(new Date(reading.timestamp), "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell>
                          {format(new Date(reading.timestamp), "HH:mm")}
                        </TableCell>
                        <TableCell>{reading.systolic} mmHg</TableCell>
                        <TableCell>{reading.diastolic} mmHg</TableCell>
                        <TableCell>{reading.pulse} BPM</TableCell>
                        <TableCell>
                          <Badge variant={badgeVariant}>
                            {category}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
              Belum ada data tekanan darah
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
