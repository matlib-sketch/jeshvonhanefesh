import { api } from './client'
import type { DailyEntry, Goal, UserSettings } from '../domain/types'

// ── Settings ──────────────────────────────────────────

const DEFAULT_SETTINGS: UserSettings = {
  cycleStartDate: new Date().toISOString().split('T')[0],
  reminderTime: '21:00',
  language: 'es',
  theme: 'system',
  notificationsEnabled: false,
  onboardingCompleted: false,
  disabledMiddot: [],
  middahTargets: {},
  spiritualCheckTargets: {},
  customMiddot: [],
}

export const getSettings = async (): Promise<UserSettings> => {
  const data = await api<Partial<UserSettings>>('/me/settings')
  return { ...DEFAULT_SETTINGS, ...data }
}

export const saveSettings = (settings: Partial<UserSettings>): Promise<unknown> =>
  api('/me/settings', { method: 'PUT', body: JSON.stringify(settings) })

// ── Entries ───────────────────────────────────────────

export const getEntry = async (date: string): Promise<DailyEntry | undefined> => {
  const entries = await api<DailyEntry[]>(`/me/entries?from=${date}&to=${date}`)
  return entries[0]
}

export const getEntriesRange = (from: string, to: string): Promise<DailyEntry[]> =>
  api<DailyEntry[]>(`/me/entries?from=${from}&to=${to}`)

export const getAllEntries = (): Promise<DailyEntry[]> =>
  api<DailyEntry[]>('/me/entries')

export const saveEntry = (entry: DailyEntry): Promise<unknown> =>
  api(`/me/entries/${entry.date}`, { method: 'PUT', body: JSON.stringify(entry) })

export const deleteEntry = (date: string): Promise<unknown> =>
  api(`/me/entries/${date}`, { method: 'DELETE' })

// ── Goals ─────────────────────────────────────────────

export const getGoals = (): Promise<Goal[]> =>
  api<Goal[]>('/me/goals')

export const saveGoal = (goal: Goal): Promise<unknown> =>
  api('/me/goals', { method: 'POST', body: JSON.stringify(goal) })

export const updateGoal = (id: string, changes: Partial<Goal>): Promise<unknown> =>
  api(`/me/goals/${id}`, { method: 'PUT', body: JSON.stringify(changes) })

export const deleteGoal = (id: string): Promise<unknown> =>
  api(`/me/goals/${id}`, { method: 'DELETE' })

// ── Export / Import / Reset ───────────────────────────

export interface ExportData {
  entries: DailyEntry[]
  goals: Goal[]
  settings: Partial<UserSettings>
  exportedAt: string
}

export const exportAllData = (): Promise<ExportData> =>
  api<ExportData>('/me/export')

export const importAllData = (data: ExportData): Promise<unknown> =>
  api('/me/import', { method: 'POST', body: JSON.stringify(data) })

export const resetAllData = (): Promise<unknown> =>
  api('/me/data', { method: 'DELETE' })
