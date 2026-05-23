import { create } from 'zustand'
import type { UserSettings } from '../domain/types'
import { getSettings, saveSettings } from '../storage/db'

interface SettingsState {
  settings: UserSettings | null
  loading: boolean
  loadSettings: () => Promise<void>
  updateSettings: (changes: Partial<UserSettings>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: null,
  loading: true,

  loadSettings: async () => {
    const settings = await getSettings()
    set({ settings, loading: false })
  },

  updateSettings: async (changes) => {
    await saveSettings(changes)
    const current = get().settings
    if (current) {
      set({ settings: { ...current, ...changes } })
    }
  },
}))
