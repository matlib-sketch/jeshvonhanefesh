import { getToken, setToken, clearToken, setUserId, clearUserId } from './client'

export interface ApiProfile {
  id: string
  name: string
  color: string
  has_pin: boolean
}

interface AuthResponse {
  token: string
  user: { id: string; name: string; color: string }
}

// Carga el usuario actual desde el JWT almacenado
export const getCurrentUser = async (): Promise<ApiProfile | null> => {
  const token = getToken()
  if (!token) return null
  const res = await fetch('/api/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    clearToken()
    clearUserId()
    return null
  }
  return res.json()
}

// Busca un usuario por nombre (sin exponer la lista completa)
export const lookupByName = async (name: string): Promise<ApiProfile | null> => {
  const res = await fetch(`/api/auth/lookup?name=${encodeURIComponent(name)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error('Error al conectar')
  return res.json()
}

export const register = async (name: string, color: string, pin: string): Promise<string> => {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, color, pin }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? 'Error al crear cuenta')
  }
  const { token, user } = (await res.json()) as AuthResponse
  setToken(token)
  setUserId(user.id)
  return user.id
}

export const login = async (userId: string, pin: string): Promise<boolean> => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, pin }),
  })
  if (!res.ok) return false
  const { token, user } = (await res.json()) as AuthResponse
  setToken(token)
  setUserId(user.id)
  return true
}

export const logout = (): void => {
  clearToken()
  clearUserId()
}

export const deleteUser = async (id: string): Promise<void> => {
  await fetch(`/api/auth/users/${id}`, { method: 'DELETE' })
}
