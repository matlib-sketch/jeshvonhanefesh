// Tipos centrales del dominio — sin dependencias de plataforma

export interface Middah {
  id: number;
  hebrew: string;
  transliteration: string;
  spanish: string;
  description: string;
  dailyPrompt: string;
}

export interface CustomMiddah extends Middah {
  custom: true;  // IDs >= 100
}

export type Score = -2 | -1 | 0 | 1 | 2;

export interface DailyEntry {
  date: string;
  scores: Record<number, Score>;
  journal: string;
  weekMiddahFocus: number;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  type: 'weekly' | 'monthly';
  text: string;
  middahId?: number;
  periodStart: string;
  periodEnd: string;
  completed: boolean;
  createdAt: string;
}

export interface UserSettings {
  cycleStartDate: string;
  reminderTime: string;
  language: 'es' | 'en' | 'he';
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  onboardingCompleted: boolean;
  disabledMiddot: number[];
  middahTargets: Record<number, number>;
  customMiddot: CustomMiddah[];
}
