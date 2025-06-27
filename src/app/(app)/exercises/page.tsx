"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from 'date-fns';
import { Play, Clock, Heart, Activity, CheckCircle, XCircle } from "lucide-react";

import type { ExerciseLog } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const exerciseLogSchema = z.object({
  exerciseTitle: z.string(),
  duration: z.coerce.number().min(1, "Durasi minimal 1 menit").max(180, "Durasi maksimal 3 jam"),
  pulse: z.coerce.number().min(40, "Detak jantung minimal 40").max(200, "Detak jantung maksimal 200"),
  breathing: z.enum(["normal", "cepat", "lambat"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  notes: z.string().optional(),
});

const exercises = [
  {
    title: "Yoga untuk Relaksasi",
    description: "Yoga dapat membantu menurunkan tekanan darah dengan mengurangi stres dan meningkatkan fleksibilitas.",
    details: "Fokus pada pose yang menenangkan seperti Child's Pose, Cat-Cow, dan Corpse Pose. Gabungkan dengan pernapasan dalam untuk hasil maksimal.",
    videoId: "4pLUleLdwY4",
    recommendedDuration: 20,
  },
  {
    title: "Latihan Pernapasan Dalam",
    description: "Teknik pernapasan yang tepat dapat menenangkan sistem saraf Anda dan menurunkan tekanan darah secara instan.",
    details: "Duduk atau berbaring dengan nyaman. Tarik napas dalam-dalam melalui hidung selama 4 hitungan, tahan selama 4 hitungan, dan hembuskan perlahan melalui mulut selama 6-8 hitungan.",
    videoId: "8VwufJrUhic",
    recommendedDuration: 10,
  },
  {
    title: "Tai Chi untuk Kesehatan Jantung",
    description: "Tai Chi adalah latihan gerakan lambat yang dapat meningkatkan kesehatan jantung dan menurunkan tekanan darah.",
    details: "Latihan ini menggabungkan gerakan lembut dengan pernapasan dalam. Mulailah dengan gerakan dasar dan tingkatkan secara bertahap.",
    videoId: "cEOS2zoyQw4",
    recommendedDuration: 25,
  },
  {
    title: "Latihan Kekuatan Ringan",
    description: "Latihan kekuatan dengan beban ringan dapat membantu mengontrol tekanan darah dan meningkatkan kesehatan jantung.",
    details: "Gunakan dumbbell ringan atau resistance band. Fokus pada gerakan yang terkontrol dan pernapasan yang tepat.",
    videoId: "U0bhE67HuDY",
    recommendedDuration: 30,
  },
  {
    title: "Peregangan untuk Relaksasi",
    description: "Peregangan dapat membantu mengurangi ketegangan otot dan menurunkan tekanan darah.",
    details: "Lakukan peregangan lembut untuk semua kelompok otot utama. Tahan setiap pose selama 15-30 detik.",
    videoId: "2L2lnxIcNmo",
    recommendedDuration: 15,
  },
  {
    title: "Meditasi untuk Kesehatan Jantung",
    description: "Meditasi dapat membantu menurunkan stres dan tekanan darah dengan menenangkan pikiran dan tubuh.",
    details: "Duduk dengan nyaman dan tutup mata. Fokus pada pernapasan Anda. Jika pikiran mengembara, kembalikan fokus ke napas.",
    videoId: "inpok4MKVLM",
    recommendedDuration: 15,
  },
];

export default function ExercisesPage() {
  const { user } = useAuth();
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof exerciseLogSchema>>({
    resolver: zodResolver(exerciseLogSchema),
    defaultValues: {
      exerciseTitle: "",
      duration: 20,
      pulse: 80,
      breathing: "normal",
      difficulty: "medium",
      notes: "",
    },
  });

  useEffect(() => {
    if (!user || !db) return;
    const exerciseQuery = query(collection(db, "users", user.uid, "exercises"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(exerciseQuery, snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ExerciseLog[];
        setExerciseLogs(data);
    });
    return () => unsubscribe();
  }, [user]);

  const onSubmit = async (values: z.infer<typeof exerciseLogSchema>) => {
    if (!user || !db) return;
    try {
        await addDoc(collection(db, "users", user.uid, "exercises"), {
            ...values,
            completed: true,
            timestamp: new Date().toISOString(),
        });
        toast({ title: "Latihan Dicatat", description: "Catatan latihan Anda berhasil disimpan." });
        form.reset();
        setIsFormOpen(false);
        setSelectedExercise("");
    } catch (error) {
        toast({ title: "Error", description: "Gagal mencatat latihan.", variant: "destructive" });
        console.error("Error adding exercise log:", error);
    }
  };

  const startExercise = (exerciseTitle: string) => {
    setSelectedExercise(exerciseTitle);
    form.setValue("exerciseTitle", exerciseTitle);
    setIsFormOpen(true);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getBreathingColor = (breathing: string) => {
    switch (breathing) {
      case "normal": return "bg-green-100 text-green-800";
      case "cepat": return "bg-orange-100 text-orange-800";
      case "lambat": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Program Latihan Terpandu"
        description="Temukan latihan yang aman dan efektif untuk membantu mengelola hipertensi. Catat latihan Anda dan pantau kondisi fisik."
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Catat Latihan: {selectedExercise}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durasi Latihan (menit)</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="180" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pulse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detak Jantung Setelah Latihan (BPM)</FormLabel>
                      <FormControl>
                        <Input type="number" min="40" max="200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="breathing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kondisi Pernapasan</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kondisi pernapasan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="cepat">Cepat</SelectItem>
                          <SelectItem value="lambat">Lambat</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tingkat Kesulitan</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih tingkat kesulitan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Mudah</SelectItem>
                          <SelectItem value="medium">Sedang</SelectItem>
                          <SelectItem value="hard">Sulit</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catatan Tambahan (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Bagaimana perasaan Anda setelah latihan? Ada keluhan atau hal positif?" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">Simpan Latihan</Button>
                <DialogClose asChild>
                  <Button variant="outline" className="flex-1">Batal</Button>
                </DialogClose>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {exercises.map((exercise) => (
          <Card key={exercise.title}>
            <CardHeader>
              <CardTitle>{exercise.title}</CardTitle>
              <CardDescription>{exercise.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {exercise.videoId && (
                <div className="aspect-video overflow-hidden rounded-lg border">
                   <iframe
                      className="h-full w-full"
                      src={`https://www.youtube.com/embed/${exercise.videoId}`}
                      title={exercise.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Durasi yang disarankan: {exercise.recommendedDuration} menit</span>
              </div>
              <p className="text-sm text-muted-foreground">{exercise.details}</p>
              <Button 
                onClick={() => startExercise(exercise.title)}
                className="w-full"
              >
                <Play className="mr-2 h-4 w-4" />
                Mulai Latihan & Catat
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {exerciseLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Riwayat Latihan</CardTitle>
            <CardDescription>Catatan latihan yang telah Anda lakukan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {exerciseLogs.slice(0, 10).map((log) => (
                <div key={log.id} className="p-4 border rounded-lg bg-background">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{log.exerciseTitle}</h4>
                    <div className="flex gap-2">
                      <Badge className={getDifficultyColor(log.difficulty)}>
                        {log.difficulty === "easy" ? "Mudah" : log.difficulty === "medium" ? "Sedang" : "Sulit"}
                      </Badge>
                      {log.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{log.duration} menit</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span>{log.pulse} BPM</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <Badge className={getBreathingColor(log.breathing)}>
                        {log.breathing}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(log.timestamp), "dd/MM/yyyy HH:mm")}
                    </div>
                  </div>
                  {log.notes && (
                    <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 