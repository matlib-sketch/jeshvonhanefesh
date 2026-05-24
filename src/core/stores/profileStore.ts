import { create } from 'zustand'
import type { Profile } from '../storage/profiles'
import {
  getProfiles, createProfile, verifyPin, profileHasPin,
  deleteProfileAndData, setSession, getSession, clearSession,
} from '../storage/profiles'

interface ProfileState {
  profiles: Profile[]
  currentProfile: Profile | null
  loading: boolean
  loadProfiles: () => Promise<void>
  loginWithPin: (profileId: string, pin: string) => Promise<boolean>
  loginDirect: (profileId: string) => Promise<boolean>
  logout: () => void
  createAndLogin: (name: string, color: string, pin: string) => Promise<void>
  deleteProfile: (id: string) => Promise<void>
}

export const useProfileStore = create<ProfileState>((set) => ({
  profiles: [],
  currentProfile: null,
  loading: true,

  loadProfiles: async () => {
    const profiles = await getProfiles()
    const sessionId = getSession()
    const currentProfile = sessionId ? (profiles.find((p) => p.id === sessionId) ?? null) : null
    set({ profiles, currentProfile, loading: false })
  },

  loginWithPin: async (profileId, pin) => {
    const ok = await verifyPin(profileId, pin)
    if (!ok) return false
    setSession(profileId)
    window.location.reload()
    return true
  },

  loginDirect: async (profileId) => {
    const hasPin = await profileHasPin(profileId)
    if (hasPin) return false  // requiere PIN — usar loginWithPin
    setSession(profileId)
    window.location.reload()
    return true
  },

  logout: () => {
    clearSession()
    window.location.reload()
  },

  createAndLogin: async (name, color, pin) => {
    const profile = await createProfile(name, color, pin)
    setSession(profile.id)
    window.location.reload()
  },

  deleteProfile: async (id) => {
    await deleteProfileAndData(id)
    const profiles = await getProfiles()
    set({ profiles })
    // Si era el perfil activo, hacer logout
    if (getSession() === id) {
      clearSession()
      window.location.reload()
    }
  },
}))
