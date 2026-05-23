import { create } from 'zustand'
import { format } from 'date-fns'
import type { DailyEntry, Score } from '../domain/types'
import { saveEntry, getEntry, getEntriesRange, getAllEntries } from '../storage/db'

interface EntriesState {
  todayEntry: DailyEntry | null
  entries: DailyEntry[]
  loading: boolean
  loadToday: (weekMiddahFocus: number) => Promise<void>
  loadRange: (from: string, to: string) => Promise<void>
  loadAll: () => Promise<void>
  setScore: (middahId: number, score: Score) => void
  setJournal: (text: string) => void
  saveToday: () => Promise<void>
}

const today = () => format(new Date(), 'yyyy-MM-dd')

export const useEntriesStore = create<EntriesState>((set, get) => ({
  todayEntry: null,
  entries: [],
  loading: false,

  loadToday: async (weekMiddahFocus: number) => {
    set({ loading: true })
    const date = today()
    const existing = await getEntry(date)
    const entry: DailyEntry = existing ?? {
      date,
      scores: {},
      journal: '',
      weekMiddahFocus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set({ todayEntry: entry, loading: false })
  },

  loadRange: async (from, to) => {
    set({ loading: true })
    const entries = await getEntriesRange(from, to)
    set({ entries, loading: false })
  },

  loadAll: async () => {
    set({ loading: true })
    const entries = await getAllEntries()
    set({ entries, loading: false })
  },

  setScore: (middahId, score) => {
    const current = get().todayEntry
    if (!current) return
    set({
      todayEntry: {
        ...current,
        scores: { ...current.scores, [middahId]: score },
        updatedAt: new Date().toISOString(),
      },
    })
  },

  setJournal: (text) => {
    const current = get().todayEntry
    if (!current) return
    set({ todayEntry: { ...current, journal: text, updatedAt: new Date().toISOString() } })
  },

  saveToday: async () => {
    const entry = get().todayEntry
    if (!entry) return
    await saveEntry(entry)
  },
}))
