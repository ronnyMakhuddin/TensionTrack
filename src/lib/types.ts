export interface BloodPressureReading {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  timestamp: string; // ISO string
}

export interface FoodLog {
  id: string;
  description: string;
  timestamp: string;
}

export interface ActivityLog {
  id: string;
  steps: number;
  duration: number; // in minutes
  activityType?: string; // jenis aktivitas (olahraga, merokok, minum alkohol, dll)
  description?: string; // deskripsi aktivitas
  healthImpact?: 'positive' | 'negative' | 'neutral'; // dampak kesehatan
  intensity?: 'low' | 'medium' | 'high'; // intensitas aktivitas
  timestamp: string; // ISO string
}

export interface SleepLog {
  id: string;
  duration: number; // in hours
  quality?: string; // kualitas tidur
  healthConditions?: string; // kondisi kesehatan yang mempengaruhi tidur
  lifestyleFactors?: string; // faktor gaya hidup yang mempengaruhi tidur
  timestamp: string; // ISO string
}

export interface PersonalizedGoals {
  stepGoal: number;
  durationGoal: number;
}

export interface Reminder {
  id: string;
  title: string;
  type: 'medication' | 'measurement' | 'activity';
  frequency?: 'once' | 'multiple';
  time?: string; // untuk backward compatibility
  times?: string[]; // untuk multiple times
  interval?: number; // interval dalam jam untuk multiple times
  days: number[];
  enabled: boolean;
  dosage?: string; // dosis obat
  notes?: string; // catatan tambahan
  createdAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  healthHistory: string;
  createdAt: Date;
  stepGoal?: number;
  durationGoal?: number;
}

export interface ExerciseLog {
  id: string;
  exerciseTitle: string;
  duration: number; // in minutes
  pulse: number; // detak jantung setelah latihan
  breathing: string; // kondisi pernapasan (normal, cepat, lambat)
  notes: string; // catatan tambahan
  difficulty: 'easy' | 'medium' | 'hard'; // tingkat kesulitan
  completed: boolean; // apakah latihan selesai
  timestamp: string; // ISO string
}
