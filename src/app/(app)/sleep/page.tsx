"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import type { SleepLog } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const sleepLogSchema = z.object({
  duration: z.coerce.number().min(0.5, "Durasi tidur minimal 0.5 jam.").max(24, "Durasi tidur tidak wajar."),
});

export default function SleepPage() {
  const { user } = useAuth();
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof sleepLogSchema>>({
    resolver: zodResolver(sleepLogSchema),
    defaultValues: { duration: 8 },
  });

  useEffect(() => {
    if (!user) return;
    const sleepQuery = query(collection(db, "users", user.uid, "sleep"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(sleepQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SleepLog[];
      setSleepLogs(data);
    });
    return () => unsubscribe();
  }, [user]);

  const onSubmit = async (values: z.infer<typeof sleepLogSchema>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "sleep"), {
        duration: values.duration,
        timestamp: new Date().toISOString(),
      });
      form.reset({ duration: 8 });
      toast({
        title: "Tidur Dicatat",
        description: "Data tidur Anda berhasil dicatat.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Kesalahan",
        description: "Gagal mencatat data tidur.",
      });
      console.error("Error adding sleep log: ", error);
    }
  };
  
  const sortedLogs = [...sleepLogs].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catatan Tidur"
        description="Catat durasi tidur harian Anda untuk melihat polanya."
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Catat Data Tidur Baru</CardTitle>
          <CardDescription>Masukkan durasi tidur Anda dalam jam (misalnya, 7.5 untuk 7 jam 30 menit).</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <Button type="submit">Tambah Catatan</Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Tidur Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedLogs.length > 0 ? (
            <ul className="space-y-4">
              {sortedLogs.slice(0, 10).map((log) => (
                <li key={log.id} className="p-4 border rounded-lg bg-background flex justify-between items-center">
                   <div>
                    <p className="font-medium">{log.duration.toFixed(1)} jam</p>
                    <p className="text-sm text-muted-foreground">{log.timestamp && format(new Date(log.timestamp), "eeee, MMM d, yyyy")}</p>
                  </div>
                </li>
              ))}
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
