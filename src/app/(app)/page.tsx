"use client";

import { useState, useEffect } from "react";
import { format, isToday } from "date-fns";
import { Activity, Bed, HeartPulse, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";

import type { BloodPressureReading, ActivityLog, SleepLog } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/page-header";
import { BloodPressureForm } from "@/components/blood-pressure-form";
import { BloodPressureChart } from "@/components/blood-pressure-chart";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { user } = useAuth();
  const [readings, setReadings] = useState<BloodPressureReading[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Fetch Blood Pressure Readings in real-time
    const bpQuery = query(collection(db, "users", user.uid, "readings"), orderBy("timestamp", "desc"));
    const unsubscribeBp = onSnapshot(bpQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as BloodPressureReading[];
      setReadings(data);
    }, (error) => {
        console.error("Error fetching BP readings:", error);
        toast({ variant: "destructive", title: "Gagal memuat data tekanan darah." });
    });

    // Fetch Activity Logs in real-time
    const activityQuery = query(collection(db, "users", user.uid, "activity"), orderBy("timestamp", "desc"));
    const unsubscribeActivity = onSnapshot(activityQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ActivityLog[];
      setActivityLogs(data);
    }, (error) => {
        console.error("Error fetching activity logs:", error);
        toast({ variant: "destructive", title: "Gagal memuat data aktivitas." });
    });

    // Fetch Sleep Logs in real-time
    const sleepQuery = query(collection(db, "users", user.uid, "sleep"), orderBy("timestamp", "desc"));
    const unsubscribeSleep = onSnapshot(sleepQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SleepLog[];
      setSleepLogs(data);
    }, (error) => {
        console.error("Error fetching sleep logs:", error);
        toast({ variant: "destructive", title: "Gagal memuat data tidur." });
    });

    return () => {
      unsubscribeBp();
      unsubscribeActivity();
      unsubscribeSleep();
    };
  }, [user, toast]);

  const latestReading = readings.length > 0 ? readings[0] : null;
  const latestSleep = sleepLogs.length > 0 ? sleepLogs[0] : null;

  const todaySteps = activityLogs
    .filter((log) => log.timestamp && isToday(new Date(log.timestamp)))
    .reduce((total, log) => total + log.steps, 0);

  const handleNewReading = async (values: Omit<BloodPressureReading, "id" | "timestamp">) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "readings"), {
        ...values,
        timestamp: new Date().toISOString(),
      });
      setIsFormOpen(false);
      toast({
        title: "Sukses",
        description: "Bacaan tekanan darah baru Anda telah disimpan.",
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Kesalahan",
        description: "Gagal menyimpan bacaan. Silakan coba lagi.",
      });
      console.error("Error adding document: ", error);
    }
  };

  const getReadingStatus = (systolic: number, diastolic: number) => {
    if (systolic < 90 || diastolic < 60) return { text: "Rendah", color: "text-blue-500" };
    if (systolic < 120 && diastolic < 80) return { text: "Normal", color: "text-green-500" };
    if (systolic >= 120 && systolic <= 129 && diastolic < 80) return { text: "Meningkat", color: "text-yellow-500" };
    if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) return { text: "Tinggi (Tahap 1)", color: "text-orange-500" };
    if (systolic >= 140 || diastolic >= 90) return { text: "Tinggi (Tahap 2)", color: "text-red-500" };
    if (systolic > 180 || diastolic > 120) return { text: "Krisis Hipertensi", color: "text-red-700 font-bold" };
    return { text: "N/A", color: "text-muted-foreground" };
  };

  const status = latestReading ? getReadingStatus(latestReading.systolic, latestReading.diastolic) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dasbor"
        description="Berikut ringkasan kesehatan Anda hari ini. Tetap di jalur!"
        actions={
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="-ml-1 mr-2 h-4 w-4" />
                Tambah Bacaan
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Bacaan Tekanan Darah Baru</DialogTitle>
              </DialogHeader>
              <BloodPressureForm onSubmit={handleNewReading} onCancel={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tekanan Darah</CardTitle>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {latestReading ? (
              <>
                <div className="text-2xl font-bold">{`${latestReading.systolic}/${latestReading.diastolic}`} <span className="text-lg font-normal text-muted-foreground">mmHg</span></div>
                <p className={`text-xs ${status?.color}`}>{status?.text}</p>
                <p className="text-xs text-muted-foreground">
                  {latestReading.timestamp && format(new Date(latestReading.timestamp), "MMM d, yyyy 'pukul' p")}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada bacaan.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Denyut Nadi</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </CardHeader>
          <CardContent>
            {latestReading ? (
              <>
                <div className="text-2xl font-bold">{latestReading.pulse} <span className="text-lg font-normal text-muted-foreground">BPM</span></div>
                <p className="text-xs text-muted-foreground">Denyut per menit</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada bacaan.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktivitas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySteps.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">langkah hari ini</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tidur</CardTitle>
            <Bed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {latestSleep ? (
              <>
                <div className="text-2xl font-bold">{latestSleep.duration.toFixed(1)} <span className="text-lg font-normal text-muted-foreground">jam</span></div>
                 <p className="text-xs text-muted-foreground">
                  pada {format(new Date(latestSleep.timestamp), "MMM d, yyyy")}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Belum ada data.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <BloodPressureChart data={readings} />
    </div>
  );
}
