import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { Goal } from '../domain/types'
import { getGoals, saveGoal, updateGoal, deleteGoal } from '../storage/db'

// uuid no tiene tipos propios — pequeño workaround inline
declare module 'uuid' { export function v4(): string }

interface GoalsState {
  goals: Goal[]
  loading: boolean
  loadGoals: () => Promise<void>
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => Promise<void>
  toggleGoal: (id: string) => Promise<void>
  removeGoal: (id: string) => Promise<void>
}

export const useGoalsStore = create<GoalsState>((set, get) => ({
  goals: [],
  loading: false,

  loadGoals: async () => {
    set({ loading: true })
    const goals = await getGoals()
    set({ goals, loading: false })
  },

  addGoal: async (partial) => {
    const goal: Goal = {
      ...partial,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    }
    await saveGoal(goal)
    set({ goals: [goal, ...get().goals] })
  },

  toggleGoal: async (id) => {
    const goal = get().goals.find((g) => g.id === id)
    if (!goal) return
    await updateGoal(id, { completed: !goal.completed })
    set({ goals: get().goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)) })
  },

  removeGoal: async (id) => {
    await deleteGoal(id)
    set({ goals: get().goals.filter((g) => g.id !== id) })
  },
}))
