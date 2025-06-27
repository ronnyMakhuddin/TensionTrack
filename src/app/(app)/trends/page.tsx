
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import type { ActivityLog, BloodPressureReading, SleepLog } from "@/lib/types";
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
import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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

export default function TrendsPage() {
  const { user } = useAuth();
  const [bpReadings, setBpReadings] = useState<BloodPressureReading[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);

  useEffect(() => {
    if (!user) return;
    
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

    return () => {
        unsubscribeBp();
        unsubscribeActivity();
        unsubscribeSleep();
    };
  }, [user]);

  const activityChartData = [...activityLogs]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-7) // Get last 7 days
    .map((r) => ({
      ...r,
      date: format(new Date(r.timestamp), "MMM d"),
    }));

  const sleepChartData = [...sleepLogs]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .slice(-7) // Get last 7 days
    .map((r) => ({
      ...r,
      date: format(new Date(r.timestamp), "MMM d"),
    }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tren Kesehatan Anda"
        description="Pantau perubahan tekanan darah dan aktivitas Anda dari waktu ke waktu."
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BloodPressureChart data={bpReadings} showReadings={7} />
        <Card>
          <CardHeader>
            <CardTitle>Tren Aktivitas</CardTitle>
            <CardDescription>Menampilkan aktivitas 7 hari terakhir.</CardDescription>
          </CardHeader>
          <CardContent>
            {activityChartData.length > 0 ? (
              <ChartContainer config={activityChartConfig} className="min-h-[200px] w-full">
                <BarChart accessibilityLayer data={activityChartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="steps" fill="var(--color-steps)" radius={4} />
                  <Bar dataKey="duration" fill="var(--color-duration)" radius={4} />
                </BarChart>
              </ChartContainer>
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
            <CardDescription>Menampilkan data tidur 7 hari terakhir.</CardDescription>
          </CardHeader>
          <CardContent>
            {sleepChartData.length > 0 ? (
              <ChartContainer config={sleepChartConfig} className="min-h-[200px] w-full">
                <BarChart accessibilityLayer data={sleepChartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="duration" fill="var(--color-duration)" radius={4} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="flex h-[200px] w-full items-center justify-center text-muted-foreground">
                Catat data tidur pertama Anda untuk melihat grafik.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Bacaan Tekanan Darah</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Tanggal</TableHead>
                <TableHead className="w-[100px]">Waktu</TableHead>
                <TableHead>Sistolik</TableHead>
                <TableHead>Diastolik</TableHead>
                <TableHead>Denyut Nadi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bpReadings.length > 0 ? (
                bpReadings.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell className="font-medium">{reading.timestamp && format(new Date(reading.timestamp), "MMM d, yyyy")}</TableCell>
                    <TableCell>{reading.timestamp && format(new Date(reading.timestamp), "p")}</TableCell>
                    <TableCell>{reading.systolic} mmHg</TableCell>
                    <TableCell>{reading.diastolic} mmHg</TableCell>
                    <TableCell>{reading.pulse} BPM</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Tidak ada bacaan ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Aktivitas</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Tanggal</TableHead>
                <TableHead className="w-[100px]">Waktu</TableHead>
                <TableHead>Langkah</TableHead>
                <TableHead>Durasi (menit)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLogs.length > 0 ? (
                activityLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.timestamp && format(new Date(log.timestamp), "MMM d, yyyy")}</TableCell>
                    <TableCell>{log.timestamp && format(new Date(log.timestamp), "p")}</TableCell>
                    <TableCell>{log.steps.toLocaleString()} langkah</TableCell>
                    <TableCell>{log.duration} menit</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Tidak ada aktivitas ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Riwayat Tidur</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Tanggal</TableHead>
                <TableHead>Durasi (jam)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sleepLogs.length > 0 ? (
                sleepLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.timestamp && format(new Date(log.timestamp), "MMM d, yyyy")}</TableCell>
                    <TableCell>{log.duration.toFixed(1)} jam</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="h-24 text-center">
                    Tidak ada data tidur ditemukan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
