"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from 'date-fns';
import { BellRing, Plus, Trash2 } from "lucide-react";

import type { Reminder } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const reminderSchema = z.object({
  title: z.string().min(3, "Judul harus memiliki setidaknya 3 karakter."),
  type: z.enum(['medication', 'measurement', 'activity']),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format waktu tidak valid (HH:MM)."),
  days: z.array(z.number()).min(1, "Pilih setidaknya satu hari."),
});

const dayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const dayOptions = [
  { id: 0, label: 'Minggu' },
  { id: 1, label: 'Senin' },
  { id: 2, label: 'Selasa' },
  { id: 3, label: 'Rabu' },
  { id: 4, label: 'Kamis' },
  { id: 5, label: 'Jumat' },
  { id: 6, label: 'Sabtu' },
];
const typeOptions = [
    { value: 'medication', label: 'Obat' },
    { value: 'measurement', label: 'Pengukuran' },
    { value: 'activity', label: 'Aktivitas' },
];

export default function RemindersPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof reminderSchema>>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      title: "",
      type: "medication",
      time: "08:00",
      days: [],
    },
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  
  useEffect(() => {
    if (!user) return;
    const remindersQuery = query(collection(db, "users", user.uid, "reminders"), orderBy("time"));
    const unsubscribe = onSnapshot(remindersQuery, snapshot => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reminder[];
        setReminders(data);
    });
    return () => unsubscribe();
  }, [user]);

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        if (permission === 'granted') {
          toast({ title: "Izin Diberikan", description: "Anda akan menerima pengingat." });
        } else {
          toast({ variant: "destructive", title: "Izin Ditolak", description: "Anda tidak akan menerima pengingat." });
        }
      });
    }
  };

  useEffect(() => {
    if (notificationPermission !== 'granted' || !reminders.length) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = format(now, 'HH:mm');

      reminders.forEach(reminder => {
        if (reminder.enabled && reminder.days.includes(currentDay) && reminder.time === currentTime) {
          new Notification('Pengingat TensionTrack', {
            body: reminder.title,
            icon: '/icon.png'
          });
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [reminders, notificationPermission]);

  const onSubmit = async (values: z.infer<typeof reminderSchema>) => {
    if (!user) return;
    try {
        await addDoc(collection(db, "users", user.uid, "reminders"), {
            ...values,
            enabled: true,
        });
        toast({ title: "Pengingat Ditambahkan", description: "Pengingat baru telah disimpan." });
        form.reset();
        setIsFormOpen(false);
    } catch (error) {
        toast({ title: "Error", description: "Gagal menambahkan pengingat.", variant: "destructive" });
        console.error("Error adding reminder:", error);
    }
  };

  const toggleReminder = async (id: string, enabled: boolean) => {
    if (!user) return;
    const reminderRef = doc(db, "users", user.uid, "reminders", id);
    await updateDoc(reminderRef, { enabled });
  };

  const deleteReminder = async (id: string) => {
    if (!user) return;
    const reminderRef = doc(db, "users", user.uid, "reminders", id);
    await deleteDoc(reminderRef);
    toast({ title: "Pengingat Dihapus" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengingat"
        description="Atur pengingat untuk obat, aktivitas, dan pengukuran."
        actions={
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="-ml-1 mr-2 h-4 w-4" />
                Tambah Pengingat
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Pengingat Baru</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                   <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Judul Pengingat</FormLabel>
                        <FormControl>
                          <Input placeholder="misal: Minum obat pagi" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis</FormLabel>
                         <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis pengingat" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {typeOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Waktu</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="days"
                    render={() => (
                      <FormItem>
                        <FormLabel>Ulangi pada hari</FormLabel>
                        <div className="flex flex-wrap gap-4 py-2">
                          {dayOptions.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="days"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-2 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <div className="flex justify-end gap-2">
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Batal</Button>
                    </DialogClose>
                    <Button type="submit">Simpan</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      {notificationPermission !== 'granted' && (
        <Alert>
          <BellRing className="h-4 w-4" />
          <AlertTitle>Aktifkan Notifikasi</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Agar pengingat berfungsi, Anda perlu memberikan izin notifikasi.</span>
            <Button onClick={requestNotificationPermission} size="sm">
              Izinkan Notifikasi
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengingat</CardTitle>
          <CardDescription>
            {reminders.length > 0 ? "Kelola pengingat aktif Anda di sini." : "Anda belum memiliki pengingat."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reminders.length > 0 ? (
            <ul className="space-y-4">
              {reminders.map((reminder) => (
                <li key={reminder.id} className="p-4 border rounded-lg bg-background flex justify-between items-center">
                  <div className="flex-grow">
                    <p className="font-medium">{reminder.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {reminder.time} - {reminder.days.sort().map(d => dayLabels[d]).join(', ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={(checked) => toggleReminder(reminder.id, checked)}
                      aria-label="Aktifkan pengingat"
                    />
                     <Button variant="ghost" size="icon" onClick={() => deleteReminder(reminder.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                        <span className="sr-only">Hapus</span>
                     </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex h-[100px] w-full items-center justify-center text-muted-foreground">
              Klik "Tambah Pengingat" untuk memulai.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
