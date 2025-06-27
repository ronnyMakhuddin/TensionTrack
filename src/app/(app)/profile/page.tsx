"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, Edit, User, Phone, MapPin, Heart, Scale, Ruler } from "lucide-react";

import type { PatientProfile } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  age: z.coerce.number().min(1, "Umur minimal 1 tahun").max(120, "Umur maksimal 120 tahun"),
  gender: z.enum(["male", "female"]),
  height: z.coerce.number().min(50, "Tinggi minimal 50 cm").max(250, "Tinggi maksimal 250 cm"),
  weight: z.coerce.number().min(10, "Berat minimal 10 kg").max(300, "Berat maksimal 300 kg"),
  phoneNumber: z.string().min(10, "Nomor telepon minimal 10 digit"),
  address: z.string().min(10, "Alamat minimal 10 karakter"),
  emergencyContact: z.object({
    name: z.string().min(2, "Nama kontak darurat minimal 2 karakter"),
    relationship: z.string().min(2, "Hubungan minimal 2 karakter"),
    phoneNumber: z.string().min(10, "Nomor telepon minimal 10 digit"),
  }),
  medicalHistory: z.object({
    hasHypertension: z.boolean(),
    hasDiabetes: z.boolean(),
    hasHeartDisease: z.boolean(),
    hasKidneyDisease: z.boolean(),
  }),
});

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      age: 0,
      gender: "male",
      height: 0,
      weight: 0,
      phoneNumber: "",
      address: "",
      emergencyContact: {
        name: "",
        relationship: "",
        phoneNumber: "",
      },
      medicalHistory: {
        hasHypertension: false,
        hasDiabetes: false,
        hasHeartDisease: false,
        hasKidneyDisease: false,
      },
    },
  });

  useEffect(() => {
    if (!user || !db) return;
    
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "users", user.uid, "profile", "data");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data() as PatientProfile;
          setProfile(data);
          form.reset(data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Gagal memuat profil.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, form, toast]);

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user || !db) return;
    
    try {
      const profileData: PatientProfile = {
        id: user.uid,
        ...values,
      };
      
      await setDoc(doc(db, "users", user.uid, "profile", "data"), profileData);
      setProfile(profileData);
      setIsEditing(false);
      
      toast({
        title: "Profil Disimpan",
        description: "Data profil Anda berhasil disimpan.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Gagal menyimpan profil.",
        variant: "destructive",
      });
    }
  };

  const calculateBMI = () => {
    if (!profile || !profile.height || !profile.weight) return null;
    const heightInMeters = profile.height / 100;
    const bmi = profile.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Kurus", color: "text-blue-600" };
    if (bmi < 25) return { category: "Normal", color: "text-green-600" };
    if (bmi < 30) return { category: "Gemuk", color: "text-yellow-600" };
    return { category: "Obesitas", color: "text-red-600" };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Profil Pasien" description="Kelola data identitas dan riwayat kesehatan Anda." />
        <div className="flex justify-center">
          <div className="text-center">Memuat profil...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Profil Pasien" 
        description="Kelola data identitas dan riwayat kesehatan Anda." 
      />

      {isEditing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Data Pribadi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Lengkap</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Umur (tahun)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jenis Kelamin</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih jenis kelamin" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Laki-laki</SelectItem>
                              <SelectItem value="female">Perempuan</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tinggi Badan (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Berat Badan (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telepon</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Alamat</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Riwayat Kesehatan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="medicalHistory.hasHypertension"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Hipertensi</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="medicalHistory.hasDiabetes"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Diabetes</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="medicalHistory.hasHeartDisease"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Penyakit Jantung</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="medicalHistory.hasKidneyDisease"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Penyakit Ginjal</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Kontak Darurat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="emergencyContact.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Kontak Darurat</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContact.relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hubungan</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContact.phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Telepon</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Simpan Profil
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                Batal
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="space-y-6">
          {profile ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Data Pribadi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nama</label>
                        <p className="text-sm">{profile.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Umur</label>
                        <p className="text-sm">{profile.age} tahun</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Jenis Kelamin</label>
                        <p className="text-sm">{profile.gender === "male" ? "Laki-laki" : "Perempuan"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Telepon</label>
                        <p className="text-sm">{profile.phoneNumber}</p>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Alamat</label>
                      <p className="text-sm">{profile.address}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scale className="h-5 w-5" />
                      Data Fisik
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tinggi Badan</label>
                        <p className="text-sm">{profile.height} cm</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Berat Badan</label>
                        <p className="text-sm">{profile.weight} kg</p>
                      </div>
                    </div>
                    {calculateBMI() && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">BMI</label>
                        <p className="text-sm">
                          {calculateBMI()} - {getBMICategory(parseFloat(calculateBMI()!)).category}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Riwayat Kesehatan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${profile.medicalHistory.hasHypertension ? 'bg-red-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">Hipertensi</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${profile.medicalHistory.hasDiabetes ? 'bg-red-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">Diabetes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${profile.medicalHistory.hasHeartDisease ? 'bg-red-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">Penyakit Jantung</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${profile.medicalHistory.hasKidneyDisease ? 'bg-red-500' : 'bg-gray-300'}`} />
                      <span className="text-sm">Penyakit Ginjal</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Kontak Darurat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nama</label>
                      <p className="text-sm">{profile.emergencyContact.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Hubungan</label>
                      <p className="text-sm">{profile.emergencyContact.relationship}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Telepon</label>
                      <p className="text-sm">{profile.emergencyContact.phoneNumber}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">Belum ada data profil. Silakan lengkapi data Anda.</p>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-center">
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              {profile ? "Edit Profil" : "Lengkapi Profil"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 