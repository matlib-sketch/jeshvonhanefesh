import { create } from 'zustand'
import {
  listUsers, register, login, logout as apiLogout, deleteUser,
  type ApiProfile,
} from '../api/users'
import { getUserId } from '../api/client'

interface ProfileState {
  profiles: ApiProfile[]
  currentProfile: ApiProfile | null
  loading: boolean
  loadProfiles: () => Promise<void>
  loginWithPin: (profileId: string, pin: string) => Promise<boolean>
  loginDirect: (profileId: string) => Promise<boolean>
  logout: () => void
  createAndLogin: (name: string, color: string, pin: string) => Promise<void>
  deleteProfile: (id: string) => Promise<void>
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profiles: [],
  currentProfile: null,
  loading: true,

  loadProfiles: async () => {
    try {
      const profiles = await listUsers()
      const userId = getUserId()
      const currentProfile = userId ? (profiles.find((p) => p.id === userId) ?? null) : null
      set({ profiles, currentProfile, loading: false })
    } catch {
      set({ profiles: [], currentProfile: null, loading: false })
    }
  },

  loginWithPin: async (profileId, pin) => {
    const ok = await login(profileId, pin)
    if (!ok) return false
    window.location.reload()
    return true
  },

  loginDirect: async (profileId) => {
    const profile = get().profiles.find((p) => p.id === profileId)
    if (!profile || profile.has_pin) return false
    const ok = await login(profileId, '')
    if (!ok) return false
    window.location.reload()
    return true
  },

  logout: () => {
    apiLogout()
    window.location.reload()
  },

  createAndLogin: async (name, color, pin) => {
    await register(name, color, pin)
    window.location.reload()
  },

  deleteProfile: async (id) => {
    const currentId = getUserId()
    await deleteUser(id)
    const profiles = await listUsers()
    set({ profiles })
    if (currentId === id) {
      apiLogout()
      window.location.reload()
    }
  },
}))
