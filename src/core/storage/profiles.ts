import Dexie, { type EntityTable } from 'dexie'

export interface Profile {
  id: string
  name: string
  pinHash: string   // SHA-256 del PIN, o '' si no tiene
  color: string
  createdAt: string
}

class ProfilesDB extends Dexie {
  profiles!: EntityTable<Profile, 'id'>
  constructor() {
    super('CheshbonHaNefesh_Profiles')
    this.version(1).stores({ profiles: 'id, name' })
  }
}

const profilesDb = new ProfilesDB()

const sha256 = async (text: string): Promise<string> => {
  if (!text) return ''
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const getProfiles = (): Promise<Profile[]> => profilesDb.profiles.toArray()

export const createProfile = async (name: string, color: string, pin: string): Promise<Profile> => {
  const profile: Profile = {
    id: crypto.randomUUID(),
    name: name.trim(),
    pinHash: await sha256(pin),
    color,
    createdAt: new Date().toISOString(),
  }
  await profilesDb.profiles.add(profile)
  return profile
}

export const verifyPin = async (profileId: string, pin: string): Promise<boolean> => {
  const profile = await profilesDb.profiles.get(profileId)
  if (!profile) return false
  if (!profile.pinHash) return true  // sin PIN — acceso libre
  return profile.pinHash === (await sha256(pin))
}

export const profileHasPin = async (profileId: string): Promise<boolean> => {
  const profile = await profilesDb.profiles.get(profileId)
  return !!(profile?.pinHash)
}

export const deleteProfileAndData = async (id: string): Promise<void> => {
  await profilesDb.profiles.delete(id)
  await Dexie.delete(`CheshbonHaNefesh_${id}`)
}

export const setSession = (profileId: string): void => {
  localStorage.setItem('currentProfileId', profileId)
}

export const getSession = (): string | null => localStorage.getItem('currentProfileId')

export const clearSession = (): void => localStorage.removeItem('currentProfileId')
