import { create } from 'zustand'
import {
  getCurrentUser, login, logout as apiLogout, deleteUser,
  type ApiProfile,
} from '../api/users'

interface ProfileState {
  currentProfile: ApiProfile | null
  loading: boolean
  loadProfiles: () => Promise<void>
  loginWithPin: (profileId: string, pin: string) => Promise<boolean>
  loginDirect: (profileId: string) => Promise<boolean>
  logout: () => void
  createAndLogin: () => void   // el register ya guarda el token — solo recargar
  deleteProfile: (id: string) => Promise<void>
}

export const useProfileStore = create<ProfileState>((set) => ({
  currentProfile: null,
  loading: true,

  loadProfiles: async () => {
    const currentProfile = await getCurrentUser()
    set({ currentProfile, loading: false })
  },

  loginWithPin: async (profileId, pin) => {
    const ok = await login(profileId, pin)
    if (!ok) return false
    window.location.reload()
    return true
  },

  loginDirect: async (profileId) => {
    const ok = await login(profileId, '')
    if (!ok) return false
    window.location.reload()
    return true
  },

  logout: () => {
    apiLogout()
    window.location.reload()
  },

  createAndLogin: () => {
    // register() ya guardó el token en localStorage; recargar inicializa la app
    window.location.reload()
  },

  deleteProfile: async (id) => {
    await deleteUser(id)
    apiLogout()
    window.location.reload()
  },
}))
