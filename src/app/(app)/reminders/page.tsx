"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from 'date-fns';
import { BellRing, Plus, Trash2, Clock, Pill } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";

const reminderSchema = z.object({
  title: z.string().min(3, "Judul harus memiliki setidaknya 3 karakter."),
  type: z.enum(['medication', 'measurement', 'activity']),
  frequency: z.enum(['once', 'multiple']),
  time: z.string().optional(),
  times: z.array(z.string()).optional(),
  days: z.array(z.number()).min(1, "Pilih setidaknya satu hari."),
  dosage: z.string().optional(),
  notes: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.frequency === 'once' && !data.time) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Waktu harus diisi untuk frekuensi sekali sehari.",
      path: ["time"],
    });
  }
  if (data.frequency === 'multiple' && (!data.times || data.times.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Pilih setidaknya satu waktu untuk multiple times.",
      path: ["times"],
    });
  }
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

const commonTimes = [
  { label: "Pagi (08:00)", value: "08:00" },
  { label: "Siang (12:00)", value: "12:00" },
  { label: "Sore (16:00)", value: "16:00" },
  { label: "Malam (20:00)", value: "20:00" },
  { label: "Tengah Malam (00:00)", value: "00:00" },
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
      frequency: "once",
      time: "08:00",
      times: [],
      days: [],
      dosage: "",
      notes: "",
    },
  });

  const watchType = form.watch("type");
  const watchFrequency = form.watch("frequency");

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);
  
  useEffect(() => {
    if (!user || !db) return;
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

  const generateMultipleTimes = (startTime: string, interval: number) => {
    const times = [];
    let currentTime = new Date(`2000-01-01T${startTime}:00`);
    
    for (let i = 0; i < 24 / interval; i++) {
      times.push(format(currentTime, 'HH:mm'));
      currentTime.setHours(currentTime.getHours() + interval);
    }
    
    return times;
  };

  useEffect(() => {
    if (watchFrequency === "multiple" && watchType === "medication") {
      const startTime = form.getValues("times")[0] || "08:00";
      const interval = form.getValues("interval");
      const generatedTimes = generateMultipleTimes(startTime, interval);
      form.setValue("times", generatedTimes);
    }
  }, [watchFrequency, watchType, form]);

  useEffect(() => {
    if (notificationPermission !== 'granted' || !reminders.length) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = format(now, 'HH:mm');

      reminders.forEach(reminder => {
        if (reminder.enabled && reminder.days.includes(currentDay)) {
          if (reminder.frequency === 'multiple' && reminder.times?.includes(currentTime)) {
            new Notification('Pengingat TensionTrack', {
              body: `${reminder.title}${reminder.dosage ? ` - ${reminder.dosage}` : ''}`,
              icon: '/icon.png'
            });
          } else if ((reminder.frequency === 'once' || !reminder.frequency) && reminder.time === currentTime) {
            new Notification('Pengingat TensionTrack', {
              body: reminder.title,
              icon: '/icon.png'
            });
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [reminders, notificationPermission]);

  const onSubmit = async (values: z.infer<typeof reminderSchema>) => {
    if (!user || !db) return;
    try {
        const reminderData = {
            ...values,
            enabled: true,
            createdAt: new Date().toISOString(),
        };
        
        await addDoc(collection(db, "users", user.uid, "reminders"), reminderData);
        toast({ title: "Pengingat Ditambahkan", description: "Pengingat baru telah disimpan." });
        form.reset();
        setIsFormOpen(false);
    } catch (error) {
        toast({ title: "Error", description: "Gagal menambahkan pengingat.", variant: "destructive" });
        console.error("Error adding reminder:", error);
    }
  };

  const toggleReminder = async (id: string, enabled: boolean) => {
    if (!user || !db) return;
    const reminderRef = doc(db, "users", user.uid, "reminders", id);
    await updateDoc(reminderRef, { enabled });
  };

  const deleteReminder = async (id: string) => {
    if (!user || !db) return;
    const reminderRef = doc(db, "users", user.uid, "reminders", id);
    await deleteDoc(reminderRef);
    toast({ title: "Pengingat Dihapus" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengingat"
        description="Atur pengingat untuk obat, aktivitas, dan pengukuran dengan jadwal multiple times per hari."
        actions={
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="-ml-1 mr-2 h-4 w-4" />
                Tambah Pengingat
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frekuensi</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih frekuensi" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="once">Sekali sehari</SelectItem>
                              <SelectItem value="multiple">Multiple times</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {form.watch("frequency") === "multiple" ? (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="times"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Waktu Pengingat</FormLabel>
                            <div className="space-y-2">
                              {field.value?.map((time, index) => (
                                <div key={index} className="flex gap-2">
                                  <FormControl>
                                    <Input
                                      type="time"
                                      value={time}
                                      onChange={(e) => {
                                        const newTimes = [...(field.value || [])];
                                        newTimes[index] = e.target.value;
                                        field.onChange(newTimes);
                                      }}
                                    />
                                  </FormControl>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newTimes = field.value?.filter((_, i) => i !== index) || [];
                                      field.onChange(newTimes);
                                    }}
                                  >
                                    Hapus
                                  </Button>
                                </div>
                              ))}
                              <div className="flex gap-2 flex-wrap">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    const newTimes = [...(field.value || []), "08:00"];
                                    field.onChange(newTimes);
                                  }}
                                >
                                  + Tambah Waktu
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    field.onChange(["08:00", "16:00", "00:00"]);
                                  }}
                                >
                                  3x1 (8-16-00)
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    field.onChange(["08:00", "20:00"]);
                                  }}
                                >
                                  2x1 (8-20)
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    field.onChange(["08:00", "14:00", "20:00"]);
                                  }}
                                >
                                  3x1 (8-14-20)
                                </Button>
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : (
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
                  )}

                  <FormField
                    control={form.control}
                    name="days"
                    render={() => (
                      <FormItem>
                        <FormLabel>Hari</FormLabel>
                        <div className="grid grid-cols-7 gap-2">
                          {dayOptions.map((day) => (
                            <FormField
                              key={day.id}
                              control={form.control}
                              name="days"
                              render={({ field }) => {
                                return (
                                  <FormItem key={day.id} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(day.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, day.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== day.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-xs font-normal">
                                      {dayLabels[day.id]}
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

                  {form.watch("type") === "medication" && (
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="dosage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dosis (Opsional)</FormLabel>
                            <FormControl>
                              <Input placeholder="misal: 1 tablet" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Catatan (Opsional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Catatan tambahan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">Simpan</Button>
                    <DialogClose asChild>
                      <Button variant="outline" className="flex-1">Batal</Button>
                    </DialogClose>
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
          <AlertTitle>Izin Notifikasi</AlertTitle>
          <AlertDescription>
            Untuk menerima pengingat, Anda perlu memberikan izin notifikasi.
            <Button variant="outline" size="sm" className="ml-2" onClick={requestNotificationPermission}>
              Berikan Izin
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {reminders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <BellRing className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Belum ada pengingat. Tambahkan pengingat pertama Anda.
              </p>
            </CardContent>
          </Card>
        ) : (
          reminders.map((reminder) => (
            <Card key={reminder.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {reminder.type === 'medication' ? (
                      <Pill className="h-5 w-5 text-blue-500" />
                    ) : (
                      <BellRing className="h-5 w-5 text-green-500" />
                    )}
                    <CardTitle className="text-lg">{reminder.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={reminder.enabled}
                      onCheckedChange={(checked) => toggleReminder(reminder.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReminder(reminder.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">
                      {typeOptions.find(t => t.value === reminder.type)?.label}
                    </Badge>
                    {reminder.frequency === 'multiple' && (
                      <Badge variant="secondary">
                        {reminder.times?.length || 0}x sehari
                      </Badge>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    {reminder.frequency === 'multiple' && reminder.times ? (
                      <div className="flex flex-wrap gap-1">
                        {reminder.times.map((time, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {reminder.time || 'Tidak ada waktu'}
                      </Badge>
                    )}
                    {reminder.dosage && (
                      <Badge variant="outline" className="text-xs ml-2">
                        {reminder.dosage}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {reminder.days?.map((day) => (
                      <Badge key={day} variant="outline" className="text-xs">
                        {dayLabels[day]}
                      </Badge>
                    ))}
                  </div>
                  {reminder.notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {reminder.notes}
                    </p>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
