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
  timestamp: string; // ISO string
}

export interface SleepLog {
  id: string;
  duration: number; // in hours
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
  time: string; // HH:mm
  days: number[]; // 0-6 for Sun-Sat
  enabled: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  healthHistory: string;
  createdAt: Date;
  stepGoal?: number;
  durationGoal?: number;
}
