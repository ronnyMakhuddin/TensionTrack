"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import type { FoodLog } from "@/lib/types"
import { PageHeader } from "@/components/page-header"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { dietFeedback } from "@/ai/flows/diet-feedback"
import { Loader2, Sparkles } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const foodLogSchema = z.object({
  description: z.string().min(3, "Harap jelaskan apa yang Anda makan dengan minimal 3 karakter."),
})

export default function DietPage() {
  const { user } = useAuth();
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const { toast } = useToast();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof foodLogSchema>>({
    resolver: zodResolver(foodLogSchema),
    defaultValues: { description: "" },
  })
  
  useEffect(() => {
    if (!user) return;
    const foodQuery = query(collection(db, "users", user.uid, "food"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(foodQuery, (snapshot) => {
        const data = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})) as FoodLog[];
        setFoodLogs(data);
    });
    return () => unsubscribe();
  }, [user]);

  const onSubmit = async (values: z.infer<typeof foodLogSchema>) => {
    if (!user) return;
    try {
        await addDoc(collection(db, "users", user.uid, "food"), {
            description: values.description,
            timestamp: new Date().toISOString(),
        });
        form.reset();
        toast({
          title: "Makanan Dicatat",
          description: "Makanan Anda berhasil dicatat.",
        });
    } catch(error) {
        toast({
            variant: "destructive",
            title: "Kesalahan",
            description: "Gagal mencatat makanan.",
        });
        console.error("Error adding food log: ", error);
    }
  }

  const handleGetFeedback = async () => {
    setIsLoading(true);
    setFeedback(null);

    if (foodLogs.length === 0) {
      toast({
        variant: "destructive",
        title: "Tidak Ada Data",
        description: "Harap catat beberapa makanan terlebih dahulu sebelum meminta umpan balik.",
      });
      setIsLoading(false);
      return;
    }

    const formattedLogs = foodLogs
      .slice(0, 15) // Use last 15 entries
      .map(log => `- ${log.description} (pada ${format(new Date(log.timestamp), "MMM d")})`)
      .join("\n");

    try {
      const result = await dietFeedback({ foodLogs: formattedLogs });
      setFeedback(result.feedback);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Kesalahan",
        description: "Gagal menghasilkan umpan balik. Silakan coba lagi.",
      });
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedLogs = [...foodLogs].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  
  return (
    <div className="space-y-6">
      <PageHeader
        title="Catatan Diet"
        description="Catat makanan Anda untuk lebih memahami diet Anda."
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Analisis Diet AI</CardTitle>
          <CardDescription>Dapatkan umpan balik tentang catatan makanan terbaru Anda dari asisten AI kami.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <Button onClick={handleGetFeedback} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Dapatkan Umpan Balik AI
          </Button>

          {feedback && (
            <Alert className="mt-4">
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Umpan Balik Diet Anda</AlertTitle>
              <AlertDescription>
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: feedback.replace(/\n/g, '<br />') }}></div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Catat Makanan Baru</CardTitle>
          <CardDescription>Jelaskan apa yang Anda makan atau minum.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi Makanan</FormLabel>
                    <FormControl>
                      <Textarea rows={3} placeholder="contoh: Oatmeal dengan buah untuk sarapan, dan secangkir teh hijau." {...field} />
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
          <CardTitle>Catatan Makanan Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedLogs.length > 0 ? (
            <ul className="space-y-4">
              {sortedLogs.slice(0, 10).map((log) => (
                <li key={log.id} className="p-4 border rounded-lg bg-background">
                  <p className="font-medium">{log.description}</p>
                  <p className="text-sm text-muted-foreground">{log.timestamp && format(new Date(log.timestamp), "MMM d, yyyy 'pukul' p")}</p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-[100px] w-full items-center justify-center text-muted-foreground">
              Anda belum mencatat makanan apa pun.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
