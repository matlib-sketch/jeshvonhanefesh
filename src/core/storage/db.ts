import Dexie, { type EntityTable } from 'dexie'
import type { DailyEntry, Goal, UserSettings } from '../domain/types'

// Tabla de configuración con un solo registro (id siempre = 1)
interface SettingsRecord extends UserSettings {
  id: 1;
}

class CheshbonDB extends Dexie {
  entries!: EntityTable<DailyEntry, 'date'>
  goals!: EntityTable<Goal, 'id'>
  settings!: EntityTable<SettingsRecord, 'id'>

  constructor() {
    super('CheshbonHaNefesh')
    this.version(1).stores({
      entries: 'date, createdAt, weekMiddahFocus',
      goals: 'id, type, periodStart, periodEnd, completed',
      settings: 'id',
    })
  }
}

export const db = new CheshbonDB()

// --- Entries ---

export const saveEntry = async (entry: DailyEntry): Promise<void> => {
  await db.entries.put(entry)
}

export const getEntry = async (date: string): Promise<DailyEntry | undefined> => {
  return db.entries.get(date)
}

export const getEntriesRange = async (from: string, to: string): Promise<DailyEntry[]> => {
  return db.entries.where('date').between(from, to, true, true).sortBy('date')
}

export const getAllEntries = async (): Promise<DailyEntry[]> => {
  return db.entries.orderBy('date').toArray()
}

export const deleteEntry = async (date: string): Promise<void> => {
  await db.entries.delete(date)
}

// --- Goals ---

export const saveGoal = async (goal: Goal): Promise<void> => {
  await db.goals.put(goal)
}

export const getGoals = async (): Promise<Goal[]> => {
  return db.goals.orderBy('periodStart').reverse().toArray()
}

export const updateGoal = async (id: string, changes: Partial<Goal>): Promise<void> => {
  await db.goals.update(id, changes)
}

export const deleteGoal = async (id: string): Promise<void> => {
  await db.goals.delete(id)
}

// --- Settings ---

const SETTINGS_ID = 1 as const

const DEFAULT_SETTINGS: SettingsRecord = {
  id: SETTINGS_ID,
  cycleStartDate: new Date().toISOString().split('T')[0],
  reminderTime: '21:00',
  language: 'es',
  theme: 'system',
  notificationsEnabled: false,
  onboardingCompleted: false,
  disabledMiddot: [],
  middahTargets: {},
  customMiddot: [],
}

export const getSettings = async (): Promise<SettingsRecord> => {
  const record = await db.settings.get(SETTINGS_ID)
  if (!record) return DEFAULT_SETTINGS
  // Merge defaults para usuarios que no tienen los campos nuevos
  return Object.assign({ disabledMiddot: [], middahTargets: {}, customMiddot: [] }, record)
}


export const saveSettings = async (settings: Partial<UserSettings>): Promise<void> => {
  const current = await getSettings()
  await db.settings.put({ ...current, ...settings, id: SETTINGS_ID })
}

// --- Export / Import ---

export const exportAllData = async () => {
  const [entries, goals, settings] = await Promise.all([
    getAllEntries(),
    getGoals(),
    getSettings(),
  ])
  return { entries, goals, settings, exportedAt: new Date().toISOString() }
}

export const importAllData = async (data: ReturnType<typeof exportAllData> extends Promise<infer T> ? T : never): Promise<void> => {
  await db.transaction('rw', [db.entries, db.goals, db.settings], async () => {
    await db.entries.clear()
    await db.goals.clear()
    await db.entries.bulkPut(data.entries)
    await db.goals.bulkPut(data.goals)
    if (data.settings) {
      await db.settings.put({ ...data.settings, id: SETTINGS_ID })
    }
  })
}

export const resetAllData = async (): Promise<void> => {
  await db.transaction('rw', [db.entries, db.goals, db.settings], async () => {
    await db.entries.clear()
    await db.goals.clear()
    await db.settings.clear()
  })
}
